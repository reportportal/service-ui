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
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = () => {
  if (!process.env.PROXY_PATH) {
    console.log('========== Specify the PROXY_PATH variable in the .env file =========');
    process.exit(1);
  }
  return {
    devtool: 'eval-sourcemap',
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.css$/,
          include: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.(sa|sc)ss$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                importLoaders: 1,
              },
            },
            'sass-loader',
            {
              loader: 'sass-resources-loader',
              options: {
                resources: path.resolve(__dirname, '../src/common/css/variables/**/*.scss'),
              },
            },
          ],
        },
      ],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    devServer: {
      contentBase: path.resolve(__dirname, '../build'),
      hot: true,
      historyApiFallback: true,
      https: false,
      host: '0.0.0.0',
      port: 3000,
      proxy: [
        {
          context: ['/composite', '/api/', '/uat/'],
          target: process.env.PROXY_PATH,
          bypass(req) {
            console.log(`proxy url: ${req.url}`);
          },
        },
      ],
    },
  };
};
