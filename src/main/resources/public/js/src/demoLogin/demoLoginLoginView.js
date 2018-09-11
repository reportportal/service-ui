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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');
    var App = require('app');
    var config = App.getInstance();
    var UserModel = require('model/UserModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var LoginLoginAuthButtonView = require('login/LoginLoginAuthButtonView');


    var DemoLoginLoginView = Epoxy.View.extend({

        className: 'login-login-subpage',
        attributes: { 'data-js-login-login-subpage': '' },
        template: 'tpl-demo-login-login',

        events: {
            'click [data-js-login-btn]': 'onSubmitForm',
            'submit [data-js-login-login-form]': 'onSubmitForm',

            'mousedown [data-js-toggle-visability]': 'showPassword',
            'mouseup [data-js-toggle-visability]': 'hidePassword',
            'mouseleave [data-js-toggle-visability]': 'hidePassword',

            'touchstart [data-js-toggle-visability]': 'showPassword',
            'touchend  [data-js-toggle-visability]': 'hidePassword',
            'touchcancel  [data-js-toggle-visability]': 'hidePassword',

            'focus .rp-input': 'unHighlight'
        },

        initialize: function (options) {
            this.oAuthButtons = [];
            this.loginModel = options.loginModel;
            this.listenTo(this.loginModel, 'change:blockTime', this.blockForm);
            this.user = new UserModel();
            this.registryModel = new SingletonRegistryInfoModel();
            this.render();
            this.blockForm();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.renderOAuth();
            this.setupAnchors();
            this.bindValidators();
        },
        renderOAuth: function () {
            var self = this;
            _.each(this.registryModel.get('authExtensions'), function (value) {
                var view = new LoginLoginAuthButtonView(value);
                self.oAuthButtons.push(view);
                $('[data-js-oauth-container]', self.$el).append(view.$el);
            });
            if (this.oAuthButtons.length) {
                $('[data-js-oauth-login]', this.$el).removeClass('hide');
            }
        },
        setupAnchors: function () {
            this.$login = $('[data-js-login]', this.$el);
            this.$pass = $('[data-js-password]', this.$el);
            this.$loginBtn = $('[data-js-login-btn]', this.$el);
            this.$loginForm = $('[data-js-login-login-form]', this.$el);
            this.$errorBlock = $('[data-js-error-block]', this.$el);
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

        showPassword: function (e) {
            $(e.currentTarget).addClass('show');
            this.$pass.attr('type', 'text');
        },

        hidePassword: function (e) {
            $(e.currentTarget).removeClass('show');
            this.$pass.attr('type', 'password');
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.login();
        },
        login: function () {
            var self = this;
            var login;
            var pass;
            $('.rp-field', this.$el).find('input').trigger('validate');
            if ($('.validate-error', this.$el).length) return;
            login = this.cutIfEmail(this.$login.val());
            pass = encodeURIComponent(this.$pass.val());
            if (config.router) {
                config.router.navigate('login', { silent: true });
            }
            this.user.login(login, pass)
                .done(function () {

                })
                .fail(function (response) {
                    if (response.status === 403) {
                        self.trigger('blockLoginForm');
                        /* OAuth Spec says wrong creds is 400 */
                    } else if (response.status === 400
                        && JSON.parse(response.responseText).error_code === 4003) {
                        self.$loginForm.addClass('bad-credentials');
                    }
                });
        },

        cutIfEmail: function (login) {
            if (Util.validateEmail(login)) {
                return login.slice(0, login.indexOf('@'));
            }
            return login;
        },

        blockForm: function () {
            var time = this.loginModel.get('blockTime');
            var message;
            if (time && time <= 30) {
                message = Localization.login.blockedLoginForm + ' <strong data-js-block-timer>' +
                    time + '</strong> ' + Localization.ui.sec + '.';

                this.$errorBlock.removeClass('hide');
                this.$login.prop('disabled', true);
                this.$pass.prop('disabled', true);
                this.$loginBtn.prop('disabled', true);

                $('[data-js-error-message]', this.$el).html(message);
            }
            if (time <= 0) {
                this.$errorBlock.addClass('hide');
                this.$login.prop('disabled', false);
                this.$pass.prop('disabled', false);
                this.$loginBtn.prop('disabled', false);
            }
        },

        unHighlight: function () {
            this.$loginForm.removeClass('bad-credentials');
        },

        onDestroy: function () {
            this.remove();
        }
    });

    return DemoLoginLoginView;
});
