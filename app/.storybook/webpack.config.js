const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const getConfig = require('../webpack.config');
const baseConfig = getConfig();

module.exports = {
  plugins: baseConfig.plugins.filter((plugin) =>
    ['DefinePlugin', 'ProvidePlugin', 'MiniCssExtractPlugin'].includes(plugin.constructor.name),
  ),
  devtool: 'cheap-module-source-map',
  resolve: Object.assign({}, baseConfig.resolve, {
    alias: Object.assign({}, baseConfig.resolve.alias, {
      'storybook-decorators': path.resolve(__dirname, 'decorators'),
    }),
  }),
  module: {
    rules: baseConfig.module.rules,
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
};
