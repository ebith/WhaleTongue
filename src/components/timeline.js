import React, { Component } from 'react';
import {format, parse} from 'date-fns/esm';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faRetweet from '@fortawesome/fontawesome-free-solid/faRetweet';
import faLock from '@fortawesome/fontawesome-free-solid/faLock';

import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';

import { Media } from './media.js';

export class Timeline extends Component {
  render() {
    return (
      <List
        items={ this.props.tweets }
        onRenderCell={ this._onRenderCell }
      />
    );
  }
  _onRenderCell(tweet) {
    if (tweet.notice) {
      return (
        <div className='tweet-itemCell'>
          <Image className='tweet-profile-image' src='https://pbs.twimg.com/profile_images/875087697177567232/Qfy0kRIP_normal.jpg' width={ 48 } height={ 48 } imageFit={ ImageFit.cover }/>
          <div className='tweet-itemContent'>
            <div className="flex-box">
              <span className="tweet-name">Notice</span>
              <Extra timestamp={tweet.timestamp} />
            </div>
            <div className='tweet-content'>
              <span className={`tweet-text middle`}>{ tweet.text }</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className='tweet-itemCell'>
          <ProfileImage profile_image={tweet.profile_image} screen_name={tweet.screen_name} />
          <div className='tweet-itemContent'>
            <div className="flex-box">
              <Name screen_name={tweet.screen_name} name={tweet.name} />
              <Extra retweeter={tweet.retweeter} id={tweet.id} timestamp={tweet.timestamp} locked={tweet.protected} event={tweet.event}/>
            </div>
            <Text tweet={tweet} />
          </div>
        </div>
      );
    }
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

export const Extra = ({ retweeter, id, timestamp, locked, event}) => {
  let text, className, elem;
  if (retweeter) {
    text = retweeter.name;
    className = 'retweeter';
  } else {
    text = format(new Date(timestamp), 'HH:mm');
  }
  if (event) {
    elem = <span className={`tweet-event ${event}`}>{event}</span>
  } else {
    elem =
    <a href={`https://twitter.com/statuses/${id}`}>
      <span className={className}>{text}</span>
    </a>
  }
  return (
    <span className="tweet-extra">
      {retweeter && <FontAwesomeIcon icon={faRetweet} />}
      {locked && <FontAwesomeIcon icon={faLock} />}
      {elem}
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
    const { text, html_text, quoted, entities } = this.props.tweet;

    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    context.font = '"Yu Gothic", YuGothic';
    const width = context.measureText(quoted ? text + quoted.text : text).width;
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
        <span className={`tweet-text ${widthClass}`} dangerouslySetInnerHTML={this.html(html_text, quoted)} />
        {entities && <Media entities={entities} />}
      </div>
    );
  }
};
