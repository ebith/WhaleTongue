import React from 'react';
import PropTypes from 'prop-types';
import {parseTweet} from 'twitter-text';
import {Modal} from 'office-ui-fabric-react/lib/Modal';
import {TextField} from 'office-ui-fabric-react/lib/TextField';

const TweetModal = ({isOpen, onClose, onUpdateStatus}) => {
  const check = text => {
    const result = parseTweet(text);
    if (!result.valid && result.permillage > 1000) {
      return 'too long';
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && event.ctrlKey) {
      onUpdateStatus(event.target.value, () => {
        onClose();
      });
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onDissmiss={onClose} containerClassName="tweet-modal">
      <TextField
        label="What's happening?"
        multiline
        rows={4}
        onGetErrorMessage={check}
        validateOnLoad={false}
        onKeyDown={handleKeyDown}
      />
    </Modal>
  );
};

TweetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
};

export default TweetModal;
