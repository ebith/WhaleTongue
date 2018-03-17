import React, {Component} from 'react';
import {render} from 'react-dom';
import Store from 'electron-store';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import Twitter from './lib/twitter';
import {Timeline} from './components/timeline';
import KeyBind from './keybind';
import './app.scss'; // eslint-disable-line import/no-unassigned-import
import TweetModal from './components/tweet-modal';

const store = new Store();
const config = {
  consumerKey: store.get('keys.consumer'),
  consumerSecret: store.get('keys.consumerSecret'),
  accessToken: store.get('tokens.access'),
  accessTokenSecret: store.get('tokens.accessSecret'),
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      tweets: [],
      showModal: false,
    };

    this.keybind = new KeyBind(store.get('keyBind'), event => {
      switch (event) {
        case 'openTweetModal':
          this.setState({showModal: true});
          break;
        default:
      }
    });

    this.t = new Twitter(config);
    this.t.on('notice', msg => {
      this.setState(prevState => {
        const tweets = [msg].concat(prevState.tweets);
        if (tweets.length > 1000) {
          tweets.pop();
        }
        return {tweets};
      });
    });
    this.t.on('tweet', tweet => {
      this.setState(prevState => {
        const tweets = [tweet].concat(prevState.tweets);
        if (tweets.length > 1000) {
          tweets.pop();
        }
        return {tweets};
      });
    });
    this.t.connect();

    // T.getLastStatus(config.screen_name, user => {
    //   console.log(user.status.text);
    // });
    this.t.getTimeline(timeline => {
      this.setState({tweets: timeline});
    });
    // This.state = { tweets:
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
        <TweetModal
          isOpen={this.state.showModal}
          onClose={this.closeModal.bind(this)}
          onUpdateStatus={this.updateStatus.bind(this)}
        />
        <Timeline tweets={this.state.tweets} />
      </Fabric>
    );
  }
}

render(<App config={config} />, document.getElementById('root'));
