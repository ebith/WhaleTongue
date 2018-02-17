const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  config: {
    plugins: [],
    module: {
      rules: [
        {
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
                      electron: '1.8'
                    }
                  }
                ]
              ]
            }
          }
        }
      ]
    }
  },
  option: webpack => {
    if (process.env.NODE_ENV === 'production') {
      webpack.plugins.push(
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          uglifyOptions: { ecma: 8, compress: { drop_console: true } }
        })
      );
    } else {
      webpack.watch = true;
      webpack.watchOptions = {
        ignored: ['/node_modules/', '/dist/']
      };
    }
  }
};
