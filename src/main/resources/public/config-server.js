'use strict';

var path = require('path');

var publicPath = path.resolve('../../../../build/resources/main/public');
var proxyConfig = require('./config-proxy');

if(proxyConfig.path == '') {
    console.log('========== Specify the path for the proxy in the config-proxy.js file =========')
}

module.exports = {
    devServer: {
        contentBase: publicPath,
        https: false,
        host: '0.0.0.0',
        proxy: [
            {
                path: /^\/(composite|api|uat|ui).*/,
                target: proxyConfig.path,
                bypass: function (req, res, options) {
                    console.log('proxy url: ' + req.url);
                }
            },{
                path: /^(?!\/(composite|api|uat|ui)).*/,
                target: 'http:localhost:8080',
                bypass: function (req, res, options) {
                    console.log('resource url: ' + req.url);
                    if (!req.url.match(/\./)) {
                        return '/index.html';
                    }
                    return req.url;
                }
            }
        ]
    }
};
