import { BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import Store from 'electron-store';
import { OAuth } from 'oauth';

export default class Auth {
  constructor(callback) {
    const store = new Store();

    const keys = store.get('keys');
    const oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      keys.consumer,
      keys.consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );
    oauth.getOAuthRequestToken((err, requestToken, requestTokenSecret) => {
      const url = `https://api.twitter.com/oauth/authorize?force_login=true&oauth_token=${requestToken}`;
      const win = this.createWindow();
      shell.openExternal(url);

      ipcMain.on('PIN', (event, pin) => {
        if (pin.length > 6) {
          oauth.getOAuthAccessToken(requestToken, requestTokenSecret, pin.trim(), (err, accessToken, accessTokenSecret, results) => {
            store.set('tokens', { access: accessToken, accessSecret: accessTokenSecret });
            store.set('user_id', results.user_id);
            store.set('screen_name', results.screen_name);
            win.close();
            callback();
          });
        } else {
          // Error
        }
      });
    });
  }
  createWindow() {
    let win = new BrowserWindow({ width: 200, height: 100 });
    win.on('closed', () => {
      win = null;
    });
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dialog.html'),
        protocol: 'file:',
        slashes: true
      })
    );
    return win;
  }
}
