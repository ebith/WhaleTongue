const {spawn} = require('child_process');
const chokidar = require('chokidar');
const electron = require('electron-connect').server.create();

setTimeout(() => {
  electron.start();

  const watcher = chokidar.watch(['index.js', 'dist']);
  watcher.on('change', path => {
    spawn('yarn', ['run', 'xo'], {stdio: 'inherit'});
    if (path.includes('main.js')) {
      electron.restart();
    } else {
      // electron.reload();
    }
  });
}, 5000);
