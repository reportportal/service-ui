/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Service = require('coreService');

    var SingletonURLParamsModel = require('model/SingletonURLParamsModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var SingletonAppStorage = require('storage/SingletonAppStorage');

    var LoginLoginView = require('login/loginLoginView');
    var LoginRestoreView = require('login/loginRestoreView');
    var LoginResetView = require('login/loginResetView');

    var TwitterNewsComponent = require('components/twitterNewsComponent/TwitterNewsComponent');

    var LoginView = Epoxy.View.extend({

        className: 'login-page',
        template: 'tpl-new-login',
        events: {
            'click [data-js-logo]': 'onClickLogo',
        },

        bindings: {
            '[data-js-build-versions]': 'html: fullServicesHtml',
        },

        initialize: function(options) {
            var self = this;

            this.viewModel = new SingletonRegistryInfoModel();
            this.storage = new SingletonAppStorage();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    blockTime: 0,
                }
            }));
            if (this.storage.getItem('login_block_time')) {
                var secondsFromLastBlocking = ((Date.now() - this.storage.getItem('login_block_time')) / 1000).toFixed();

                if (secondsFromLastBlocking <= 30) {
                    this.model.set('blockTime', 30 - secondsFromLastBlocking);
                    this.blockFormCountdown(30 - secondsFromLastBlocking);
                }
            }

            this.render();
            this.twitterComponent = new TwitterNewsComponent();
            $('[data-js-twitter-container]', this.$el).html(this.twitterComponent.$el);
            var urlModel = new SingletonURLParamsModel();

            if (urlModel.get('reset')) {
                Service.validateRestorationKey(urlModel.get('reset'))
                    .done(function (response) {
                        if (response.is) {
                            self.restoreKey = urlModel.get('reset');
                            self.openResetPassword();
                        } else {
                            self.showRestorationError();
                        }
                    })
                    .fail(function (error) {
                        self.showRestorationError();
                    });
            } else if (urlModel.get('errorAuth')) {
                Util.ajaxFailMessenger(null, null, urlModel.get('errorAuth'));
                this.openLogin();
            } else {
                this.openLogin();
            }
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.subviewContainer = $('[data-js-subpage-container]', this.$el);
        },

        openForgotPass: function () {
            if (this.loginSubView) {
                this.destroySubView();
            }
            this.loginSubView = new LoginRestoreView();
            this.listenTo(this.loginSubView, 'closeForgotPass', this.openLogin);
            this.subviewContainer.html(this.loginSubView.el);
        },
        openLogin: function () {
            if (this.loginSubView) {
                this.destroySubView();
            }
            this.loginSubView = new LoginLoginView({loginModel: this.model});
            this.listenTo(this.loginSubView, 'forgotPass', this.openForgotPass);
            this.listenTo(this.loginSubView, 'blockLoginForm', this.blockLoginForm);
            this.subviewContainer.html(this.loginSubView.el)
        },

        openResetPassword: function () {
            if (this.loginSubView) {
                this.destroySubView();
            }
            this.loginSubView = new LoginResetView({restoreKey: this.restoreKey});
            this.listenTo(this.loginSubView, 'closeResetPass', this.openLogin);
            this.subviewContainer.html(this.loginSubView.el);
        },
        onClickLogo: function() {
            window.open('http://reportportal.io/');
        },
        blockLoginForm: function () {
            var date = Date.now();
            this.storage.setItem('login_block_time', date)
            this.blockFormCountdown(30);
        },

        blockFormCountdown: function (seconds) {
            var time = seconds;
            var self = this;
            this.timer = setInterval(function () {
                time--;
                if (time < 0) {
                    clearInterval(self.timer);
                } else {
                    self.model.set('blockTime', time);
                }

            }, 1000)
        },

        destroySubView: function () {
            this.loginSubView.destroy();
            this.stopListening();
        },

        showRestorationError: function () {
            this.openLogin();
            Util.ajaxFailMessenger(null, 'restorationExpired');
        },

        onDestroy: function(){
            clearInterval(this.timer);
            this.twitterComponent && this.twitterComponent.destroy();
            this.remove();
        }
    });

    return LoginView;
});
