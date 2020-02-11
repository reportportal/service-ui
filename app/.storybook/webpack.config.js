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
const getConfig = require('../webpack.config');
const baseConfig = getConfig();

module.exports = async ({config}) => {

  return {
    ...config,
    plugins: [...config.plugins, ...baseConfig.plugins.filter((plugin) =>
      ['DefinePlugin', 'ProvidePlugin', 'MiniCssExtractPlugin'].includes(plugin.constructor.name),
    )],
    devtool: 'cheap-module-source-map',
    resolve: Object.assign({}, baseConfig.resolve, {
      alias: Object.assign({}, baseConfig.resolve.alias, {
        'storybook-decorators': path.resolve(__dirname, 'decorators'),
      }),
    }),
    module: {
      rules: [...baseConfig.module.rules, {
        test: /\.md$/,
        use: 'raw-loader',
      }],
    },
  };
};
