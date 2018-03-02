import React, { Component } from 'react';
import { render } from 'react-dom';
import Store from 'electron-store';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { Timeline } from './components/timeline';
import KeyBind from './keybind';
import './app.scss';

class App extends Component {
  render() {
    return (
      <Fabric>
        <Timeline config={this.props.config} />
      </Fabric>
    );
  }
}

const store = new Store();

const keybind = new KeyBind(store.get('keyBind'));

const config = {
  consumerKey: store.get('keys.consumer'),
  consumerSecret: store.get('keys.consumerSecret'),
  accessToken: store.get('tokens.access'),
  accessTokenSecret: store.get('tokens.accessSecret')
};

render(<App config={config} />, document.getElementById('root'));
