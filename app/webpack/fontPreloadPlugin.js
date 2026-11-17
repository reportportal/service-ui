/*
 * Copyright 2026 EPAM Systems
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

const HtmlWebpackPlugin = require('html-webpack-plugin');

class FontPreloadPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('FontPreloadPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        'FontPreloadPlugin',
        (data, cb) => {
          const publicPath = data.publicPath === 'auto' ? '' : data.publicPath || '';
          const fontTags = Object.keys(compilation.assets)
            .filter((name) => name.endsWith('.woff2'))
            .map((name) => ({
              tagName: 'link',
              voidTag: true,
              meta: { plugin: 'FontPreloadPlugin' },
              attributes: {
                rel: 'preload',
                href: publicPath + name,
                as: 'font',
                type: 'font/woff2',
                crossorigin: 'anonymous',
              },
            }));
          data.assetTags.meta.unshift(...fontTags);
          cb(null, data);
        },
      );
    });
  }
}

module.exports = FontPreloadPlugin;
