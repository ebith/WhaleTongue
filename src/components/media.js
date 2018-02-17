import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlayCircle from '@fortawesome/fontawesome-free-regular/faPlayCircle';

export const Media = ({ entities }) => {
  if (!entities.media) {
    return null;
  }
  const media = entities.media.map(entity => {
    let linkUrl, type;
    switch (entity.type) {
      case 'animated_gif':
      case 'video':
        entity.video_info.variants.sort((a,b) =>{
          return a.bitrate - b.bitrate;
        });
        type = 'media-video';
        linkUrl = entity.video_info.variants[entity.video_info.variants.length - 1].url;
        break;
      case 'photo':
        type = 'media-photo';
        linkUrl = entity.media_url_https;
    }
    const mediaUrl = `${entity.media_url_https}:thumb`;

    return (
      <a href={linkUrl} key={entity.id_str} className={type}>
        <img src={mediaUrl} />
        <Overlay type={type} />
      </a>
    );
  });
  return (
    <div className="tweet-media">
      {media}
    </div>
  );
};

export const ExternalMedia = ({ entities }) => {
  if (!entities.urls) {
    return null;
  }
  const media = entities.urls.map((entity, index) => {
    if (/\.(jpg|png|gif)$/.test(entity.expanded_url)) {
      return (
        <a href={entity.expanded_url} key={index}>
          <img src={entity.expanded_url} />
        </a>
      );
    }
  });
  if (media.length > 0) {
    return (
      <div className="external-media">
        {media}
      </div>
    );
  } else {
    return null;
  }
}

const Overlay = ({type}) => {
  switch(type) {
    case 'media-video':
      return (
        <FontAwesomeIcon icon={faPlayCircle} size='lg' />
      );
      break;
    default:
      return null;
  }
}
