const path = require('path');
const common = require('./webpack.config.common.js');

module.exports = {
  devtool: 'cheap-module-source-map', // 【ChromeExtension】 'unsafe-eval' エラーの解決方法 - 人生dat落ち - http://eiua-memo.tumblr.com/post/172719308488/chromeextension-unsafe-eval-%E3%82%A8%E3%83%A9%E3%83%BC%E3%81%AE%E8%A7%A3%E6%B1%BA%E6%96%B9%E6%B3%95
  entry: './src/renderer.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'electron-renderer',
  module: {
    rules: [
      common.js,
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: process.env.NODE_ENV === 'production' ? {minimize: true} : {},
          },
          {loader: 'sass-loader'},
        ],
      },
    ],
  },
};
