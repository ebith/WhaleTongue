const path = require('path');
const common = require('./webpack.config.common.js');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'electron-main',
  node: {
    __dirname: false,
  },
  module: {
    rules: [common.js],
  },
};
