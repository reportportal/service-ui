const merge = require('webpack-merge');
const baseConfig = require('./webpack/base.config');
const prodConfig = require('./webpack/prod.config');
const devConfig = require('./webpack/dev.config');

module.exports = () => {
  const mode = process.env.NODE_ENV;
  if (mode === 'development') {
    return merge(baseConfig, devConfig());
  }
  return merge(baseConfig, prodConfig);
};
