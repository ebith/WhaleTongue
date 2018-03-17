module.exports = {
  js: {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/react',
          [
            '@babel/preset-env',
            {
              targets: {
                electron: '2.0',
              },
            },
          ],
        ],
      },
    },
  },
};
