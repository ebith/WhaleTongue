const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.common.js');

module.exports = (env, argv) => ({
  entry: './src/renderer.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'electron-renderer',
  module: {
    rules: [
      common.js,
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: process.env.NODE_ENV === 'production' ? { minimize: true } : {}
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  },
});
