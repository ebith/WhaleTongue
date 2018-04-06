import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {get} from 'axios';

export default class OgpThumbnail extends Component {
  componentDidMount() {
    const url = this.props.entities.urls[0].expanded_url;
    const match = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([-\w]+)/.exec(url);
    if (match) {
      this.setState({thumbnail: {href: url, image: `https://i.ytimg.com/vi/${match[1]}/default.jpg`}});
    } else {
      get(url, {responseType: 'document'}).then(res => {
        this.setState({
          thumbnail: {
            href: url,
            image: res.data.querySelector('meta[property="og:image"]').content,
          },
        });
      });
    }
  }

  constructor() {
    super();
    this.state = {
      thumbnail: {},
    };
  }

  render() {
    return this.state.thumbnail.image ? (
      <div className="ogp-thumbnail">
        <a href={this.state.thumbnail.href}>
          <img src={this.state.thumbnail.image} />
        </a>
      </div>
    ) : null;
  }
}

OgpThumbnail.propTypes = {
  entities: PropTypes.object.isRequired,
};
