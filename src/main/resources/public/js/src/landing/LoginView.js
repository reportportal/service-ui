/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
    var UserModel = require('model/UserModel');
    var Localization = require('localization');
    var Service = require('coreService');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var SingletonURLParamsModel = require('model/SingletonURLParamsModel');

    var config = App.getInstance();

    var LoginView = Backbone.Epoxy.View.extend({
        // className: 'block-login',
        el: '.block-login',
        tpl: 'tpl-login',
        tplRestore: 'tpl-login-restore',
        tplReset: 'tpl-login-reset',
        events: {
            'click #submit_user': 'submitForm',
            'click .close': 'hideError',
            'keyup #user_login': 'lookForEnter',
            'keyup #user_password': 'lookForEnter',
            'keyup #submit_user': 'lookForEnter',
            'submit .block-login-form': 'preventSubmit',

            'click #forgotPass': 'openForgotPass',
            'click #cancel_restore': 'closerForgotPass',
            'click #submit_restore:not([disabled])': 'submitForgotPass',

            'change #showPass': 'showPass',
            'click #backToLogin': 'closerResetPassword',
            'click #submit_change:not(.disabled)': 'submitChangePass'
        },
        bindings: {
            '[data-js-build-versions]': 'html: fullServicesHtml'
        },
        initialize: function (options) {
            this.user = new UserModel();
            this.listenTo(this.user, 'login::loader::hide', this.hideLoader);
            this.viewModel = new SingletonRegistryInfoModel();
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.setupAnchors();
            Util.setupBaronScroll($('#login-form', this.$el));
            var urlModel = new SingletonURLParamsModel();
            if (urlModel.get('reset')) {
                var self = this;
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
            } else if(urlModel.get('errorAuth')) {
                this.showError(urlModel.get('errorAuth'), false);
                urlModel.set('errorAuth', null);
            }
            return this;
        },
        preventSubmit: function (event) {
            event.preventDefault();
            return false;
        },
        showPass: function (e) {
            var action = $(e.currentTarget).is(':checked') ? 'text' : 'password';
            $("#reset-form form input.rp-input-auth", this.$el).attr('type', action);
        },
        openForgotPass: function () {
            //if(this.$email) {
            //    console.log($._data(this.$email[0], "events"));
            //}
            this.$loginForm.hide()
                .after(Util.templates(this.tplRestore));
            // this.hideError();
            this.$restoreForm = $("#restore-form", this.$el);
            this.$submitRestore = $("#submit_restore", this.$el);
            this.$email = $("#restore_email", this.$restoreForm);
            Util.bootValidator(this.$email, [
                {validator: 'matchRegex', type: 'emailMatchRegex', pattern: config.patterns.email, arg: 'i'}
            ]);
            var self = this;
            this.$email.on('validation::change', function (e, data) {
                data.valid
                    ? self.$submitRestore.removeAttr('disabled')
                    : self.$submitRestore.attr('disabled', 'disabled');
                self.targetEmail = data.value;
            });
        },
        submitForgotPass: function () {
            var self = this;
            Service.initializePassChange(this.targetEmail)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitForgotPass', self.targetEmail);
                    _.delay(self.closerForgotPass.bind(self), 700);
                })
                .fail(function (error) {
                    var type = error.responseText.indexOf('external user') > -1
                        ? 'submitForgotPassRestricted'
                        : 'submitForgotPass';

                    if (error.responseText.indexOf('40010') > -1) {
                        type = 'submitForgotPassBrokenConf';
                    };

                    Util.ajaxFailMessenger(null, type);
                });
        },
        submitChangePass: function () {
            var self = this;

            Service.submitPassReset(this.targetPass, this.restoreKey)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitChangePass');
                    _.delay(self.closerResetPassword.bind(self), 700);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'submitChangePass');
                });
        },
        closerForgotPass: function () {
            this.$restoreForm = $("#restore-form", this.$el);
            this.$loginForm = $('#login-form', this.$el);

            if (this.$restoreForm) {
                this.$restoreForm.hide().remove();
                this.$restoreForm = null;
                this.$loginForm.show();
                $('#user_login').focus();
                this.targetEmail = null;
                Util.hideMessage();
            }
        },
        openResetPassword: function () {
            this.$loginForm.hide()
                .after(Util.templates(this.tplReset));
            this.$resetForm = $("#reset-form", this.$el);
            this.$form = $(".rp-form-group:first", this.$resetForm);
            this.$submitReset = $("#submit_change", this.$el);
            // ui.ui.showLogin();
            Util.confirmValidator({holder: this.$form, min: 4, max: 25, firstCheckLength: true});
            var self = this;
            this.$form.on('validation::change', function (e, data) {
                var submitAction = data.valid ? 'remove' : 'add';
                self.targetPass = data.value;
                self.$submitReset[submitAction + "Class"]('disabled');
            });
        },
        closerResetPassword: function () {
            this.$resetForm = this.$resetForm || $("#reset-form", this.$el);
            this.$loginForm = this.$loginForm || $('#login-form', this.$el);

            if (this.$resetForm) {
                this.$resetForm.hide().remove();
                this.$resetForm = null;
                this.$loginForm.show();
                window.location.hash = window.location.hash.split(config.restorationStamp)[0];
                Util.hideMessage();
            }
        },
        lookForEnter: function (e) {
            if (e.keyCode === 13) {
                this.submitForm();
            }
        },
        toggle: function(){
            this.$el.toggleClass("block-login-show");
            $('#user_login', this.$el).focus();
        },
        show: function(){
            this.$el.addClass("block-login-show");
            $('#user_login', this.$el).focus();
        },
        hide: function(){
            this.$el.removeClass("block-login-show");
        },
        showRestorationError: function () {
            this.showError(Localization.validation.restorationExpired);
            window.location.hash = window.location.hash.split(config.restorationStamp)[0];
            // ui.ui.showLogin();
            this.restoreKey = null;
        },
        setupAnchors: function () {
            this.$loader = $('.loader:first', this.$el);
            this.$login = $('#user_login', this.$el);
            this.$pass = $('#user_password', this.$el);
            this.$errorBlock = $('.js-loginerror', this.$el);
            this.$errorText = $('#errorText', this.$el);
            this.$loginForm = $('#login-form', this.$el);
        },
        showLoader: function () {
            this.$loader.show();
        },
        hideLoader: function () {
            this.$loader.hide();
        },
        hideError: function () {
            this.$errorText.empty();
            this.$errorBlock.fadeOut(100);
        },
        submitForm: function () {
            var checkLogin = /^[A-Za-z0-9_]/,
                login = this.cutIfEmail(this.$login.val()),
                pass = this.$pass.val();

            if (!checkLogin.test(login)) {
                this.$login.focus();
                this.showError(Localization.ui.wrongcharacters);
                return false;
            } else if (login.length < 4 || login.length > 128) {
                this.$login.focus();
                this.showError(Localization.ui.wronglength);
                return false;
            }
            if (!pass) {
                this.$pass.focus();
                this.showError(Localization.forms.passwordEmpty);
                return false;
            }
            else if(pass.length < 4 || pass.length > 25){
                this.$pass.focus();
                this.showError(Localization.forms.passwordSize);
                return false;
            }
            this.hideError();
            this.showLoader();
            if (config.router) {
                config.router.navigate('login', {silent: true});
            }
            var self = this;
            this.user.login(login, pass)
                .fail(function(response){
                    if (response.status == 403) {
                        self.showBlockMessage();
                    /* OAuth Spec says wrong creds is 400 */
                    } else if (response.status == 400) {
                        self.showError(Localization.ui.wrongCredentials);
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
        showError: function (message, isHtml) {
            this.$loader.hide();
            var action = isHtml ? 'html' : 'text';
            this.$errorText[action](message);
            this.$errorBlock.fadeIn(100);
        },
        showBlockMessage: function () {
            var time = 30;
            var timer;
            var inputs = $('#user_login, #user_password, #submit_user, #submit_user_sso', this.$el);
            var self = this;
            var message = Localization.login.blockedLoginForm + ' <strong id="blockTimer">' + time + '</strong> ' + Localization.ui.sec + '.';
            inputs.attr('disabled', 'disabled');

            this.showError(message, true);

            timer = setInterval(function () {
                time--;
                $('#blockTimer', this.$el).text(time);
                if (time <= 0) {
                    clearTimeout(timer);
                    inputs.removeAttr('disabled');
                    self.hideError();
                }
            }, 1000);
        },
        destroy: function () {
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.$el.empty();
        }
    });

    return LoginView;

});