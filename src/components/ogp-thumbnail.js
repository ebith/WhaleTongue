import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {get} from 'axios';

export default class OgpThumbnail extends Component {
  componentDidMount() {
    console.log(this.props.entities.urls);
    (async () => {
      const list = ['www.youtube.com/watch', 'youtu.be', 'www.nicovideo.jp/watch', 'nico.ms', 'gyazo.com'];
      const re = new RegExp(
        list
          .map(url => {
            return `^https?://${url}`;
          })
          .join('|')
      );

      const thumbnails = [];
      for (const entity of this.props.entities.urls) {
        if (re.test(entity.expanded_url)) {
          const match = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([-\w]+)/.exec(entity.expanded_url);
          if (match) {
            thumbnails.push({href: entity.expanded_url, image: `https://i.ytimg.com/vi/${match[1]}/default.jpg`});
          } else {
            get(entity.expanded_url, {responseType: 'document'}).then(res => {
              thumbnails.push({
                href: entity.expanded_url,
                image: res.data.querySelector('meta[property="og:image"]').content,
              });
            });
          }
        }
      }
      this.setState({thumbnails});
    })();
  }

  constructor() {
    super();
    this.state = {
      thumbnails: [],
    };
  }

  render() {
    return (
      <div className="ogp-thumbnail">
        {this.state.thumbnails.map(thumb => (
          <a key={thumb.href} href={thumb.href}>
            <img src={thumb.image} />
          </a>
        ))}
      </div>
    );
  }
}

OgpThumbnail.propTypes = {
  entities: PropTypes.object.isRequired,
};
