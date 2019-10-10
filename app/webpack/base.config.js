const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: [path.resolve(__dirname, '../src/index.jsx')],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'app.[hash:6].js',
    publicPath: '',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.sass', '.scss', '.css'],
    alias: {
      components: path.resolve(__dirname, '../src/components'),
      controllers: path.resolve(__dirname, '../src/controllers'),
      common: path.resolve(__dirname, '../src/common'),
      pages: path.resolve(__dirname, '../src/pages'),
      store: path.resolve(__dirname, '../src/store'),
      routes: path.resolve(__dirname, '../src/routes'),
      layouts: path.resolve(__dirname, '../src/layouts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'url-loader',
        exclude: /\/*-inline.svg/,
        options: {
          limit: 1000,
          name: 'media/[name].[ext]',
        },
      },
      {
        test: /\/*-inline.svg/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new WebpackNotifierPlugin({ skipFirstNotification: true }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.tpl.html'),
      filename: 'index.html',
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      Utils: 'common/utils',
    }),
  ],
};
