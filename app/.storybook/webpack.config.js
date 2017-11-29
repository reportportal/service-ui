require('babel-register');
const config = require('../webpack.config.babel.js').default({
  dev: true,
  production: false,
  storybook: true,
});

module.exports = {
  plugins: config.plugins.filter(
    (plugin) => ['DefinePlugin', 'ProvidePlugin', 'ExtractTextPlugin'].includes(plugin.constructor.name)
  ),
  devtool: 'cheap-module-source-map',
  resolve: config.resolve,
  module: {
    rules: config.module.loaders
  }
}
