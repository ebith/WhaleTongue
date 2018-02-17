import React, { Component } from 'react';
import {format, parse} from 'date-fns/esm';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faRetweet from '@fortawesome/fontawesome-free-solid/faRetweet';

import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';

import Twitter from '../lib/twitter';
import { Media, ExternalMedia } from './media.js';
import { OgpThubnail } from './ogp-thumbnail.js';

export class Timeline extends Component {
  constructor(props) {
    super();
    this.state = {
      tweets: []
    };
    const t = new Twitter(props.config);
    t.on('tweet', tweet => {
      let tweets = [tweet].concat(this.state.tweets);
      if (tweets.length > 1000) { tweets.pop(); }
      this.setState({ tweets });
    });
    t.connect();

    // t.getLastStatus(config.screen_name, user => {
    //   console.log(user.status.text);
    // });
    t.getTimeline((timeline) => {
      this.setState({tweets: timeline});
      console.log(timeline);
    });
    // this.state = { tweets:
    //   require('../statuses2.json').map(status => {
    //     return t.processStatus(status);
    //   })
    // };
  }
  render() {
    return (
      <List
        items={ this.state.tweets }
        onRenderCell={ this._onRenderCell }
      />
    );
  }
  _onRenderCell(tweet) {
    return (
      <div className='tweet-itemCell' data-is-focusable={ true }>
        <ProfileImage profile_image={tweet.profile_image} screen_name={tweet.screen_name} />
        <div className='tweet-itemContent'>
          <Name screen_name={tweet.screen_name} name={tweet.name} />
          <Extra retweeter={tweet.retweeter} id={tweet.id} timestamp={tweet.timestamp}/>
          <Text tweet={tweet} />
        </div>
      </div>
    );
  }
}

export const ProfileImage = ({ screen_name, profile_image }) => (
  <a className='tweet-profile-image' href={'https://twitter.com/' + screen_name}>
    <Image src={profile_image} width={ 48 } height={ 48 } imageFit={ ImageFit.cover }/>
  </a>
);

export const Name = ({ name, screen_name }) => (
  <a href={`https://twitter.com/${screen_name}`} className="tweet-name">
    {name}
    <span className="tweet-screen_name">
      @{screen_name}
    </span>
  </a>
);

export const Extra = ({ retweeter, id, timestamp }) => {
  let elem;
  if (retweeter) {
    elem = (
      <span>
        <FontAwesomeIcon icon={faRetweet} />
        <span className='retweeter'>{retweeter.name}</span>
      </span>
    );
  } else {
    elem = (
      <span>
        <span>{format(new Date(timestamp), 'HH:mm')}</span>
      </span>
    )
  }
  return (
    <span className="tweet-extra">
      <a href={`https://twitter.com/statuses/${id}`}>
      {elem}
      </a>
    </span>
  );
}

export class Text extends Component {
  // componentDidMount() {}

  html(html_text, quoted) {
    if (quoted) {
      return { __html: html_text + ` >> @${quoted.screen_name}: ${quoted.html_text}`};
    } else {
      return { __html: html_text};
    }
  }

  render() {
    const { text, html_text, quoted, extended_entities, entities } = this.props.tweet;

    const canvas = document.querySelector('canvas');
    const width = canvas.getContext('2d').measureText(quoted ? text + quoted.text : text).width;
    let widthClass;
    if (width < 80) {
      widthClass = 'fuckingShort';
    } else if (width < 140) {
      widthClass = 'tooShort';
    } else if (width < 250) {
      widthClass = 'short';
    } else if (width < 450) {
      widthClass = 'middle';
    } else if (width < 600) {
      widthClass = 'long';
    } else {
      widthClass = 'tooLong';
    }

    return (
      <div className='tweet-content'>
        <span className={`tweet-text ${widthClass} ${width}`} dangerouslySetInnerHTML={this.html(html_text, quoted)} />
        {extended_entities && <Media entities={extended_entities} />}
        {!extended_entities && <ExternalMedia entities={entities} />}
        {!extended_entities && <OgpThubnail entities={entities} />}
      </div>
    );
  }
};
