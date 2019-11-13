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

require('babel-register');
const path = require('path');
const config = require('../webpack.config.babel.js').default({
  dev: true,
  production: false,
  storybook: true,
});

module.exports = {
  plugins: config.plugins.filter((plugin) =>
    ['DefinePlugin', 'ProvidePlugin', 'ExtractTextPlugin'].includes(plugin.constructor.name)
  ),
  devtool: 'cheap-module-source-map',
  resolve: Object.assign({}, config.resolve, {
    alias: Object.assign({}, config.resolve.alias, {
      'storybook-decorators': path.resolve(__dirname, 'decorators'),
    }),
  }),
  module: {
    rules: config.module.loaders,
  },
};
