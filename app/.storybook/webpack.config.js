require('babel-register');
const path = require('path');
const config = require('../webpack.config.babel.js').default({
  dev: true,
  production: false,
  storybook: true,
});

module.exports = {
  plugins: config.plugins.filter((plugin) =>
    ['DefinePlugin', 'ProvidePlugin', 'MiniCssExtractPlugin'].includes(plugin.constructor.name)
  ),
  devtool: 'cheap-module-source-map',
  resolve: Object.assign({}, config.resolve, {
    alias: Object.assign({}, config.resolve.alias, {
      'storybook-decorators': path.resolve(__dirname, 'decorators'),
    }),
  }),
  module: {
    rules: config.module.rules,
  },
};
