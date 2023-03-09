/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  entry: {
    polyfills: path.resolve(__dirname, '../src/common/polyfills.js'),
    main: path.resolve(__dirname, '../src/index.jsx'),
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].app.[hash:6].js',
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
      'react-intl': path.resolve(__dirname, '../node_modules/react-intl/dist/react-intl.js'), // https://github.com/formatjs/react-intl/issues/1499#issuecomment-570151879
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
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', path.resolve(__dirname, '../localization/messages')],
    }),
    new WebpackNotifierPlugin({ skipFirstNotification: true }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.tpl.html'),
      filename: 'index.html',
      favicon: path.resolve(__dirname, '../src/common/img/favicon.ico'),
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      Utils: 'common/utils',
    }),
    // new CircularDependencyPlugin({
    //   exclude: /a\.js|node_modules/,
    //   failOnError: false,
    //   allowAsyncCycles: false,
    //   cwd: process.cwd(),
    // }),
  ],
};
