const { spawn } = require('child_process');
const chokidar = require('chokidar');
const electron = require('electron-connect').server.create();

setTimeout(() => {
  electron.start();

  const watcher = chokidar.watch(['index.js', 'dist']);
  watcher.on('change', path => {
    // Const xo = spawn('xo', ['--fix', 'src/*.js', 'src/lib/*.js'], { stdio: 'inherit' });
    // xo.on('close', () => {
    //   spawn('prettier', ['--write', 'src/*.js', 'src/lib/*.js'], { stdio: 'inherit' });
    // });
    if (path.includes('main.js')) {
      electron.restart();
    } else {
      electron.reload();
    }
  });
}, 5000);
