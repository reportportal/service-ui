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
    var App = require('app');
    var config = App.getInstance();
    var UserModel = require('model/UserModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');


    var LoginLoginView = Epoxy.View.extend({

        className:'login-login-subpage',
        attributes: {'data-js-login-login-subpage': ''},
        template: 'tpl-new-login-login',

        bindings: {
            '[data-js-github-login]': 'classes: {hide: validateGitHubAuth}',
            '[data-js-github-login-btn]': 'attr: {disabled: validateGitHubAuth}',
        },

        events: {
            'click [data-js-login-btn]': 'login',
            'mousedown [data-js-toggle-visability]': 'showPassword',
            'mouseup [data-js-toggle-visability]': 'hidePassword',
            'mouseout [data-js-toggle-visability]': 'hidePassword',
            'validation:success .rp-input': 'checkLoginFields',
            'click [data-js-github-login-btn]': 'gitHubLogin',
            'click [data-js-forgot-pass]': 'onForgotPass',
        },

        computeds: {
            validateGitHubAuth: {
                deps: ['authExtensions'],
                get: function(authExtensions){
                    return !_.contains(authExtensions, 'github');
                }
            }
        },

        initialize: function () {
            this.user = new UserModel();
            this.viewModel = new SingletonRegistryInfoModel();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
        },

        setupAnchors: function(){
            this.$login = $('[data-js-login]', this.$el);
            this.$pass = $('[data-js-password]', this.$el);
            this.$loginBtn = $('[data-js-login-btn]', this.$el);
            this.$loginForm = $('[data-js-login-form-wrapper]', this.$el);
        },

        bindValidators: function () {
            Util.hintValidator(this.$login, [

                {
                    validator: 'matchRegex',
                    type: 'loginRegex',
                    pattern: config.patterns.login
                },
                {
                    validator: 'minMaxRequired',
                    type: 'login',
                    min: 1,
                    max: 128
                }
            ]);
            Util.hintValidator(this.$pass, [
                {
                    validator: 'matchRegex',
                    type: 'originalPassRegex',
                    pattern: config.patterns.originalPass
                },
                {
                    validator: 'minMaxRequired',
                    type: 'password',
                    min: 4,
                    max: 25
                }
            ]);
        },

        gitHubLogin: function () {
            window.location = window.location.protocol + '//' + window.location.host + '/uat/sso/login/github';
        },

        showPassword: function () {
            $('.visability-toggler', this.$el).addClass('show');
            this.$pass.attr('type', 'text');
        },

        hidePassword: function () {
            $('.visability-toggler', this.$el).removeClass('show');
            this.$pass.attr('type', 'password');
        },

        login: function () {
            $('.rp-field', this.$el).find('input').trigger('validate');
            if ($('.validate-error', this.$el).length) return;

            var login = this.cutIfEmail(this.$login.val()),
                pass = this.$pass.val();

            if (config.router) {
                config.router.navigate('login', {silent: true});
            }
            var self = this;
            this.user.login(login, pass)
                .done(function () {
                    $('.js-header, .js-sidebar').removeClass("hide");
                })
                .fail(function(response){
                    if (response.status == 403) {
                        self.showBlockMessage();
                        /* OAuth Spec says wrong creds is 400 */
                    } else if (response.status == 400) {
                        //self.showError(Localization.ui.wrongCredentials);
                    } else if (response.status == 500 && JSON.parse(response.responseText).error_code === 5000) {
                        $('.rp-field', self.$el).each(function (i, item) {
                            $(item).addClass('validate-error');
                        });
                    }
                });
        },

        cutIfEmail: function (login) {
            if (Util.validateEmail(login)) {
                var n = login.indexOf('@');
                return login.slice(0, n);
            }
            return login;
        },

        checkLoginFields: function () {
            if (!this.isFormReady()) {
                this.$loginBtn.addClass('disabled');
                return;
            }
            this.$loginBtn.removeClass('disabled');
        },

        isFormReady: function () {
            var ready = true;
            $('.rp-input', this.$el).each(function (i, item) {
                if ($(item).val() === '' || $(item).parent().hasClass('validate-error')) {
                    ready = false;
                }
            });
            return ready;
        },

        onForgotPass: function () {
          this.trigger('forgotPass');
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return LoginLoginView;
});
