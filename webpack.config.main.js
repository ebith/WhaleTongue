const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.common.js');

module.exports = (env, argv) => ({
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'electron-main',
  node: {
    __dirname: false
  },
  module: {
    rules: [
      common.js,
    ]
  },
});
