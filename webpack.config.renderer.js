const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.config.base.js');

module.exports = merge(base.config, {
  entry: './src/renderer.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: process.env.NODE_ENV === 'production' ? { minimize: true } : {} },
          { loader: 'sass-loader' },
        ]
      },
    ]
  }
});

base.option(module.exports);
