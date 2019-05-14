const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
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
          test: /\.(sa|sc|c)ss$/,
          use: [
            'css-hot-loader',
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
            'postcss-loader',
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
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../localization/messages')],
      }),
    ],
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
