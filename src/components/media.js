import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlayCircle from '@fortawesome/fontawesome-free-regular/faPlayCircle';
import OgpThumbnail from './ogp-thumbnail';

export const Media = ({entities}) => {
  const twimg = Boolean(entities.media);
  const urls = entities.urls ? entities.urls.length > 0 : false;
  return (
    <div>
      {twimg && <TwitterMedia entities={entities} />}
      {!twimg && urls && <ExternalMedia entities={entities} />}
      {!twimg && urls && <OgpThumbnail entities={entities} />}
    </div>
  );
};
Media.propTypes = {
  entities: PropTypes.object.isRequired,
};

export const TwitterMedia = ({entities}) => {
  const media = entities.media.map(entity => {
    let linkUrl;
    let type;
    switch (entity.type) {
      case 'animated_gif':
      case 'video':
        entity.video_info.variants.sort((a, b) => {
          if (!a.bitrate) {
            return 1;
          }
          if (!b.bitrate) {
            return -1;
          }
          return b.bitrate - a.bitrate;
        });
        type = 'media-video';
        linkUrl = entity.video_info.variants[0].url;
        break;
      case 'photo':
        type = 'media-photo';
        linkUrl = entity.media_url_https;
        break;
      default:
    }
    const mediaUrl = `${entity.media_url_https}:thumb`;

    return (
      <a key={entity.id_str} className={type} href={linkUrl}>
        <img src={mediaUrl} />
        <Overlay type={type} />
      </a>
    );
  });
  return <div className="tweet-media">{media}</div>;
};
TwitterMedia.propTypes = {
  entities: PropTypes.object.isRequired,
};

export const ExternalMedia = ({entities}) => {
  const media = [];
  for (const entity of entities.urls) {
    if (/\.(jpg|png|gif)$/.test(entity.expanded_url)) {
      media.push(
        <a key={entity.display_url} href={entity.expanded_url}>
          <img src={entity.expanded_url} />
        </a>
      );
    }
  }
  if (media.length > 0) {
    return <div className="external-media">{media}</div>;
  }
  return null;
};
ExternalMedia.propTypes = {
  entities: PropTypes.object.isRequired,
};

const Overlay = ({type}) => {
  switch (type) {
    case 'media-video':
      return <FontAwesomeIcon icon={faPlayCircle} size="lg" />;
    default:
      return null;
  }
};
