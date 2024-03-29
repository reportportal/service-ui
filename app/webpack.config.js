const { merge } = require('webpack-merge');
const baseConfig = require('./webpack/base.config');
const prodConfig = require('./webpack/prod.config');
const devConfig = require('./webpack/dev.config');
const sealightsConfig = require('./webpack/sealights.config');

module.exports = ({ NODE_ENV: mode } = {}) => {
  if (mode === 'development') {
    return merge(baseConfig, devConfig());
  }
  if (mode === 'sealights') {
    return sealightsConfig;
  }
  return merge(baseConfig, prodConfig);
};
