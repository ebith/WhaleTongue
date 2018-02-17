const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = merge(base.config, {
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'electron-main',
  node: {
    __dirname: false
  }
});

base.option(module.exports);
