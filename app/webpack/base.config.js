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
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const pjson = require('../package.json');

module.exports = {
  entry: {
    polyfills: path.resolve(__dirname, '../src/common/polyfills.js'),
    main: path.resolve(__dirname, '../src/init.js'),
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].app.[contenthash:8].js',
    publicPath: 'auto',
    assetModuleFilename: 'media/[name][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.sass', '.scss', '.css'],
    alias: {
      components: path.resolve(__dirname, '../src/components'),
      componentLibrary: path.resolve(__dirname, '../src/componentLibrary'),
      controllers: path.resolve(__dirname, '../src/controllers'),
      common: path.resolve(__dirname, '../src/common'),
      pages: path.resolve(__dirname, '../src/pages'),
      store: path.resolve(__dirname, '../src/store'),
      routes: path.resolve(__dirname, '../src/routes'),
      layouts: path.resolve(__dirname, '../src/layouts'),
      analyticsEvents: path.resolve(__dirname, '../src/components/main/analytics/events/ga4Events'),
    },
    fallback: {
      path: require.resolve('path-browserify'),
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
        exclude: /\/*-inline.svg/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1000,
          },
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
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../localization/messages')],
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
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new ModuleFederationPlugin({
      name: 'main_app',
      exposes: {
        './FieldProvider': './src/components/fields',
        './FieldErrorHint': './src/components/fields/fieldErrorHint',
        './BigButton': './src/components/buttons/bigButton',
        './InputOutside': './src/components/inputs/inputOutside',
        './NavLink': './src/components/main/navLink',
        './FieldBottomConstraints': './src/components/fields/fieldBottomConstraints',
        './RegistrationPageSection': './src/pages/outside/registrationPage/registrationPageSection',
        './BlockHeader': './src/pages/outside/common/pageBlockContainer/blockHeader',
        './InputCheckbox': './src/components/inputs/inputCheckbox',
      },
      shared: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'default',
          singleton: true,
          requiredVersion: pjson.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: pjson.dependencies['react-dom'],
        },
        'react-redux': {
          singleton: true,
          requiredVersion: pjson.dependencies['react-redux'],
        },
        'react-intl': {
          singleton: true,
          requiredVersion: pjson.dependencies['react-intl'],
        },
        'redux-form': {
          singleton: true,
          requiredVersion: pjson.dependencies['redux-form'],
        },
        'redux-first-router': {
          singleton: true,
          requiredVersion: pjson.dependencies['redux-first-router'],
        },
        history: {
          singleton: true,
          requiredVersion: pjson.dependencies.history,
        },
        classnames: {
          singleton: true,
          requiredVersion: pjson.dependencies.classnames,
        },
        'prop-types': {
          singleton: true,
          requiredVersion: pjson.dependencies['prop-types'],
        },
        'react-tracking': {
          singleton: true,
          requiredVersion: pjson.dependencies['react-tracking'],
        },
        moment: {
          singleton: true,
          requiredVersion: pjson.dependencies.moment,
        },
        'html-react-parser': {
          singleton: true,
          requiredVersion: pjson.dependencies['html-react-parser'],
        },
        'fast-deep-equal': {
          singleton: true,
          requiredVersion: pjson.dependencies['fast-deep-equal'],
        },
        'react-copy-to-clipboard': {
          singleton: true,
          requiredVersion: pjson.dependencies['react-copy-to-clipboard'],
        },
      },
    }),
  ],
};
