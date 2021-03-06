import {app, BrowserWindow, shell} from 'electron';
import path from 'path';
import libUrl from 'url';
import Store from 'electron-store';
import loadDevtool from 'electron-load-devtool';
import Auth from './auth';

let win;

app.commandLine.appendSwitch('enable-smooth-scrolling');

const store = new Store({
  defaults: {
    keys: {
      consumer: 'MCwckohMuzkDTOc2gT0t0WgNM',
      consumerSecret: 'gKnudp6Xo0FTPhnspM0J9w6oo6FOqA88jdSFp0bdEQxLCrWr8v',
    },
    bounds: {
      width: 400,
      height: 800,
    },
  },
});

const createWindow = () => {
  const {width, height, x, y} = store.get('bounds');
  win = new BrowserWindow({title: 'WhaleTongue', width, height, x, y});

  if (process.env.NODE_ENV === 'development') {
    loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
    win.webContents.openDevTools({mode: 'undock'});
  }

  win.setAlwaysOnTop(store.get('alwaysOnTop') || false);

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    const pathname = new libUrl.URL(url).pathname;
    if (/\.(jpg|png|gif|mp4)$/.test(pathname)) {
      const popup = new BrowserWindow({show: false});
      popup.once('ready-to-show', () => {
        popup.webContents.executeJavaScript(`
          const style = document.createElement('style');
          document.body.appendChild(style);
          document.styleSheets[0].insertRule('body { background-color: #f0f2f5 !important; }', 0);
        `);
        popup.show();
      });
      popup.webContents.on('cursor-changed', (event, type) => {
        if (type === 'zoom-out') {
          popup.webContents.executeJavaScript(
            `
            JSON.stringify(
              document.body.firstChild.naturalWidth ?
              { width: document.body.firstChild.naturalWidth, height: document.body.firstChild.naturalHeight } :
              { width: document.body.firstChild.videoWidth, height: document.body.firstChild.videoHeight }
            );
          `,
            value => {
              const size = JSON.parse(value);
              popup.setSize(size.width + 50, size.height + 50);
              popup.center();
            }
          );
        }
      });
      popup.loadURL(url);
      event.newGuest = popup;
    } else {
      shell.openExternal(url);
    }
  });

  ['resize', 'move'].forEach(event => {
    win.on(event, () => {
      store.set('bounds', win.getBounds());
    });
  });

  win.on('closed', () => {
    win = null;
  });

  win.loadURL(
    libUrl.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
};

app.on('ready', () => {
  const tokens = store.get('tokens');
  if (tokens) {
    createWindow();
  } else {
    // eslint-disable-next-line no-unused-vars
    const auth = new Auth(() => {
      createWindow();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
