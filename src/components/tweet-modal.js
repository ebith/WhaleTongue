import React, { Component } from 'react';
import { parseTweet } from 'twitter-text';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export const TweetModal = ({isOpen, onClose, onUpdateStatus}) => {
  const check = (text) => {
    const result = parseTweet(text);
    if (!result.valid) {
      return 'too long';
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      onUpdateStatus(event.target.value, () => { onClose(); });
    } else if (event.key === 'Escape') {
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onDissmiss={onClose} containerClassName="tweet-modal">
      <TextField label="What's happening?" multiline rows={ 4 } onGetErrorMessage={ check } validateOnLoad={ false }  onKeyDown={handleKeyDown} value="" />
    </Modal>
  );
}
