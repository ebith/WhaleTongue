import React, { Component } from 'react';
import { get } from 'axios';

export class OgpThumbnail extends Component {
  componentDidMount() {
    (async()=>{
      const domains = [
        'youtube.com/watch',
        'youtu.be',
        'nicovideo.jp/watch',
        'nico.ms',
        'gyazo.com',
      ];

      let thumbnails = [];
      for (const entity of this.props.entities.urls) {
        for (const domain of domains) {
          if (entity.expanded_url.includes(domain)) {
            const match = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([-\w]+)/.exec(entity.expanded_url);
            if (match) {
              thumbnails.push({href: entity.expanded_url, image: `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`});
            } else {
              const response = await get(entity.expanded_url, {responseType: 'document'});
              thumbnails.push({href: entity.expanded_url, image: response.data.querySelector('meta[property="og:image"]').content});
            }
          }
        }
      }

      this.setState({thumbnails});

    })();

  }

  constructor(props) {
    super();
    this.state = {
      thumbnails: []
    }
  }

  render() {
    return (
      <div className="ogp-thumbnail">
        {this.state.thumbnails.map(thumb => (
          <a href={thumb.href} key={thumb.href}>
            <img src={thumb.image} />
          </a>
        ))}
      </div>
    );
  }

}
