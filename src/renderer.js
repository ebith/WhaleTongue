import React, { Component } from 'react';
import { render } from 'react-dom';
import Store from 'electron-store';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import Twitter from './lib/twitter';
import { Timeline } from './components/timeline';
import KeyBind from './keybind';
import './app.scss';
import { TweetModal } from './components/tweet-modal';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tweets: [],
      showModal: false,
    }

    this.keybind = new KeyBind(store.get('keyBind'), (event) => {
      switch(event) {
        case 'openTweetModal':
          this.setState({showModal: true});
          break;
      }
    });

    this.t = new Twitter(config);
    this.t.on('notice', msg => {
      let tweets = [msg].concat(this.state.tweets);
      this.setState({tweets});
    });
    this.t.on('tweet', tweet => {
      let tweets = [tweet].concat(this.state.tweets);
      if (tweets.length > 1000) { tweets.pop(); }
      this.setState({ tweets });
    });
    this.t.connect();

    // t.getLastStatus(config.screen_name, user => {
    //   console.log(user.status.text);
    // });
    this.t.getTimeline((timeline) => {
      this.setState({tweets: timeline});
    });
    // this.state = { tweets:
    //   require('../../statuses2.json').map(status => {
    //     return t.processStatus(status);
    //   })
    // };
  }

  closeModal() {
    this.setState({showModal: false});
  }

  updateStatus(text, callback) {
    this.t.updateStatus(text, callback);
  }

  render() {
    return (
      <Fabric>
        <TweetModal isOpen={this.state.showModal} onClose={this.closeModal.bind(this)}  onUpdateStatus={this.updateStatus.bind(this)} />
        <Timeline tweets={this.state.tweets} />
      </Fabric>
    );
  }
}

const store = new Store();

const config = {
  consumerKey: store.get('keys.consumer'),
  consumerSecret: store.get('keys.consumerSecret'),
  accessToken: store.get('tokens.access'),
  accessTokenSecret: store.get('tokens.accessSecret')
};

render(<App config={config} />, document.getElementById('root'));
