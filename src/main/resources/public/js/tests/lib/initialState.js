define(function(require, exports, module) {
    var $ = require('jquery');
    var App = require('app');
    var UserModel = require('model/UserModel');
    var Router = require('router');

    var config = App.getInstance();

    var initAuthUser = function() {
        config.userModel = new UserModel({
            auth: true,
            user_login: 'default',
        });
        config.router = new Router.Router();
    }

    return {
        initAuthUser: initAuthUser
    }
});