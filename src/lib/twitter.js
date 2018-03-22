/* eslint-disable camelcase */
import EventEmitter from 'events';
import {OAuth} from 'oauth';
import {autoLink} from 'twitter-text';

export default class Twitter extends EventEmitter {
  constructor(config) {
    super();
    this.reconnectCount = 0;
    this.accessToken = config.accessToken;
    this.accessTokenSecret = config.accessTokenSecret;
    this.oauth = new OAuth(
      'https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      config.consumerKey,
      config.consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );
    this.sampleStream = config.sampleStream;
  }

  connect() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.emit('notice', {text: 'Refreshing connection', notice: true, timestamp: Date.now()});
      this.reconnectCount = 0;
      this.stream.abort();
      this.connect();
    }, 60 * 60 * 24 * 7 * 1000);
    if (this.stream) {
      this.stream.abort();
    }
    this.stream = this.oauth.get(
      this.sampleStream
        ? 'https://stream.twitter.com/1.1/statuses/sample.json'
        : 'https://userstream.twitter.com/1.1/user.json?replies=all',
      this.accessToken,
      this.accessTokenSecret
    );
    this.stream.end();
    this.stream.on('error', err => {
      this.emit('error', err);
    });
    this.stream.on('response', response => {
      response.setEncoding('utf8');
      let buffer = '';
      response.on('data', data => {
        clearTimeout(this.stallTimer);
        this.stallTimer = setTimeout(() => {
          this.emit('notice', {text: 'Reconnecting stream', notice: true, timestamp: Date.now()});
          this.reconnectCount++;
          this.connect();
        }, 60000);

        buffer += data;
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line !== '') {
            let status;
            try {
              status = JSON.parse(line);
            } catch (e) {
              console.log(line);
            }
            if (status.text || status.event) {
              // Slow down sample stream
              if (this.sampleStream && Math.floor(Math.random() * (12 - 0 + 1)) + 0 === 0) {
                this.emit('tweet', this.processStatus(status));
              } else {
                this.emit('tweet', this.processStatus(status));
              }
            } else if (status.friends) {
              this.emit('ready');
            } else {
              // Delete
            }
          }
        }
      });
    });
  }

  updateStatus(text, callback) {
    this.oauth.post(
      'https://api.twitter.com/1.1/statuses/update.json',
      this.accessToken,
      this.accessTokenSecret,
      {status: text},
      err => {
        if (err) {
          console.log(err);
        }
        if (callback) {
          callback();
        }
      }
    );
  }

  getLastStatus(screen_name, callback) {
    this.oauth.get(
      `https://api.twitter.com/1.1/users/show.json?screen_name=${screen_name}`,
      this.accessToken,
      this.accessTokenSecret,
      (err, data) => {
        if (err) {
          console.log(err);
        }
        callback(JSON.parse(data));
      }
    );
  }

  getTimeline(callback) {
    this.oauth.get(
      'https://api.twitter.com/1.1/statuses/home_timeline.json?count=200&exclude_replies=false&tweet_mode=extended',
      this.accessToken,
      this.accessTokenSecret,
      (err, data) => {
        if (err) {
          console.log(err);
        }
        const statuses = JSON.parse(data).map(status => {
          return this.processStatus(status);
        });
        callback(statuses);
      }
    );
  }

  // eslint-disable-next-line complexity
  processStatus(status) {
    if (status.event) {
      const tweet = {
        timestamp: status.created_at,
        id: Date.now(),
        profile_image: status.source.profile_image_url_https,
        name: status.source.name,
        screen_name: status.source.screen_name,
      };
      switch (status.event) {
        case 'block':
          tweet.event = 'block';
          tweet.text = `Blocked => @${status.target.screen_name}`;
          break;
        case 'unblock':
          tweet.event = 'unblock';
          tweet.text = `Unblocked => @${status.target.screen_name}`;
          break;
        case 'favorite':
          tweet.event = 'favorite';
          tweet.text = `Favorited => @${status.target.screen_name}: ${status.target_object.text}`;
          break;
        case 'unfavorite':
          tweet.event = 'unfavorite';
          tweet.text = `Unfavorited => @${status.target.screen_name}: ${status.target_object.text}`;
          break;
        case 'follow':
          tweet.event = 'follow';
          tweet.text = `Followed => @${status.target.screen_name}`;
          break;
        case 'unfollow':
          tweet.event = 'unfollow';
          tweet.text = `Unfollowed => @${status.target.screen_name}`;
          break;
        case 'list_member_added':
          tweet.event = 'list_member_added';
          tweet.text = `Added => @${status.target.screen_name} on the list`;
          break;
        case 'list_member_removed':
          tweet.event = 'list_member_removed';
          tweet.text = `Removed => @${status.target.screen_name} on the list`;
          break;
        default:
      }
      tweet.html_text = autoLink(tweet.text, {usernameIncludeSymbol: true});
      return tweet;
    }

    const collectUrlEntity = entities => {
      let urlEntities = [];
      if (entities.media) {
        urlEntities = entities.media;
      }
      if (entities.urls) {
        urlEntities = urlEntities.concat(entities.urls);
      }
      return urlEntities;
    };

    const linkify = (text, entities) => {
      return autoLink(text, {
        urlEntities: collectUrlEntity(entities || {}),
        usernameIncludeSymbol: true,
      });
    };

    if (status.extended_tweet) {
      status.text = status.extended_tweet.full_text;
      status.entities = status.extended_tweet.entities;
    } else {
      if (status.extended_entities) {
        status.entities.media = status.extended_entities.media;
      }
      if (status.full_text) {
        // REST API: tweet_mode=extended
        status.text = status.full_text;
      }
    }
    status.html_text = linkify(status.text, status.entities);

    if (status.retweeted_status) {
      if (status.retweeted_status.extended_tweet) {
        status.retweeted_status.text = status.retweeted_status.extended_tweet.full_text;
        status.retweeted_status.entities = status.retweeted_status.extended_tweet.entities;
      } else {
        if (status.retweeted_status.extended_entities) {
          status.retweeted_status.entities.media = status.retweeted_status.extended_entities.media;
        }
        if (status.retweeted_status.full_text) {
          status.retweeted_status.text = status.retweeted_status.full_text;
        }
      }
      status.retweeted_status.html_text = linkify(status.retweeted_status.text, status.retweeted_status.entities);

      if (status.retweeted_status.quoted_status) {
        if (status.retweeted_status.quoted_status.extended_tweet) {
          status.retweeted_status.quoted_status.text = status.retweeted_status.quoted_status.extended_tweet.full_text;
          status.retweeted_status.quoted_status.entities =
            status.retweeted_status.quoted_status.extended_tweet.entities;
        } else {
          if (status.retweeted_status.quoted_status.extended_entities) {
            status.retweeted_status.quoted_status.entities.media =
              status.retweeted_status.quoted_status.extended_entities.media;
          }
          if (status.retweeted_status.quoted_status.full_text) {
            status.retweeted_status.quoted_status.text = status.retweeted_status.quoted_status.full_text;
          }
        }
        status.retweeted_status.quoted_status.html_text = linkify(
          status.retweeted_status.quoted_status.text,
          status.retweeted_status.quoted_status.entities
        );
      }
    }

    if (status.quoted_status) {
      if (status.quoted_status.extended_tweet) {
        status.quoted_status.text = status.quoted_status.extended_tweet.full_text;
        status.quoted_status.entities = status.quoted_status.extended_tweet.entities;
      } else {
        if (status.quoted_status.extended_entities) {
          status.quoted_status.entities.media = status.quoted_status.extended_entities.media;
        }
        if (status.quoted_status.full_text) {
          status.quoted_status.text = status.quoted_status.full_text;
        }
      }
      status.quoted_status.html_text = linkify(status.quoted_status.text, status.quoted_status.entities);
    }

    let tweet;
    if (status.retweeted_status) {
      tweet = {
        protected: status.retweeted_status.user.protected,
        timestamp: status.retweeted_status.created_at,
        id: status.retweeted_status.id_str,
        profile_image: status.retweeted_status.user.profile_image_url_https,
        name: status.retweeted_status.user.name,
        screen_name: status.retweeted_status.user.screen_name,
        text: status.retweeted_status.text,
        html_text: status.retweeted_status.html_text,
        entities: status.retweeted_status.entities,
        retweeter: {
          name: status.user.name,
          screen_name: status.user.screen_name,
        },
      };

      if (status.retweeted_status.quoted_status) {
        tweet.quoted = {
          name: status.retweeted_status.quoted_status.user.name,
          screen_name: status.retweeted_status.quoted_status.user.screen_name,
          html_text: status.retweeted_status.quoted_status.html_text,
        };
      }
    } else {
      tweet = {
        protected: status.user.protected,
        timestamp: status.created_at,
        id: status.id_str,
        profile_image: status.user.profile_image_url_https,
        name: status.user.name,
        screen_name: status.user.screen_name,
        text: status.text,
        html_text: status.html_text,
        entities: status.entities,
      };
    }
    if (status.quoted_status) {
      tweet.quoted = {
        name: status.quoted_status.user.name,
        screen_name: status.quoted_status.user.screen_name,
        html_text: status.quoted_status.html_text,
      };
    }

    return tweet;
  }
}
