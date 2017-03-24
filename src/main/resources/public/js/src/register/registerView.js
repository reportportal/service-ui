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
    var Service = require('memberService');
    var CallService = require('callService');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');
    var UserModel = require('model/UserModel');
    var RegisterModel = require('register/registerModel');
    var config = App.getInstance();


    var RegisterView = Epoxy.View.extend({

        className: 'registration',
        template: 'tpl-register',
        messagesTpl: 'tpl-register-messages',

        bindings: {
            '[data-js-login]': 'value: login',
            '[data-js-name]': 'value: fullName',
            '[data-js-email]': 'value: email',
            '[data-js-password]': 'value: password'
        },

        events: {
            'submit [data-js-register-form]': 'onSubmitForm',
            'click [data-js-cancel]': 'resetForm',
            'click [data-js-register]': 'onSubmitForm',

            'mousedown [data-js-toogle-visability]': 'showPass',
            'mouseleave [data-js-toogle-visability]': 'hidePass',
            'mouseup [data-js-toogle-visability]': 'hidePass',

            'touchstart [data-js-toogle-visability]': 'showPass',
            'touchend  [data-js-toogle-visability]': 'hidePass',
            'touchcancel  [data-js-toogle-visability]': 'hidePass',

            'keyup [data-js-password-confirm]': 'checkFields',
            // 'validation:success [data-js-login]' : 'checkForLoginUniqueness'
        },

        initialize: function(options){
            this.id = options.uuid.slice(5, options.uuid.length);
            this.context = options.context;
            this.model = new RegisterModel();
            this.user = new UserModel();
            var self = this;
            Service.validateRegisterBid(this.id)
                .done(function(data){
                    if(data.isActive){
                        self.model.set('email', data.email);
                        self.render();
                    }
                    else {
                        self.showExpiredPage();
                    }
                })
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'validateRegisterBid');
                });
        },

        render: function(){
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
            this.applyBindings();
        },

        setupAnchors: function(){
            this.$login = $('[data-js-login]', this.$el);
            this.$name = $('[data-js-name]', this.$el);
            this.$email = $('[data-js-email]', this.$el);
            this.$password = $('[data-js-password]', this.$el);
            this.$confirmPassword = $('[data-js-password-confirm]', this.$el);
            this.$register = $('[data-js-register]', this.$el);
        },

        // checkForLoginUniqueness: function() {
        //     var self = this;
        //     CallService.call('GET', Urls.userInfoValidation() + '?username=' + this.$login.val())
        //         .done(function (data) {
        //             if (data.is) {
        //                 self.$login.parent().addClass('validate-error').find('.validate-hint').addClass('show-hint').html(Localization.validation.registeredLogin);
        //             }
        //         })
        //         .fail(function (error) {
        //
        //         });
        // },

        showExpiredPage: function(e) {
            e && e.preventDefault();
            this.$el.addClass('fail').append(Util.templates(this.messagesTpl));
        },

        checkFields: function () {
            if (this.$confirmPassword.val() !== this.$password.val() && this.$confirmPassword.val() !== '') {
                this.$confirmPassword.parent().addClass('validate-error').find('.validate-hint').addClass('show-hint').html(Localization.validation.confirmMatch);
            } else {
                this.$confirmPassword.parent().removeClass('validate-error').find('.validate-hint').removeClass('show-hint');
            }
        },

        bindValidators: function(){
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
            Util.hintValidator(this.$name, [
                {
                    validator: 'matchRegex',
                    type: 'fullNameInfoRegex',
                    pattern: config.patterns.fullName
                },
                {
                    validator: 'minMaxRequired',
                    type: 'userName',
                    min: 3,
                    max: 256
                }
            ]);
            Util.hintValidator(this.$password, [
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
            Util.hintValidator(this.$confirmPassword, [
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

        showPass: function (e) {
            $(e.currentTarget).addClass('show').siblings('.rp-input').attr('type', 'text');
        },

        hidePass: function (e) {
            $(e.currentTarget).removeClass('show').siblings('.rp-input').attr('type', 'password');
        },

        getData: function(){
            return {
                login: this.model.get('login'),
                email: this.model.get('email'),
                full_name: this.model.get('fullName'),
                password: this.model.get('password')
            }
        },
        onSubmitForm: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.registerMember();
        },
        registerMember: function() {
            $('.rp-field', this.$el).find('input').trigger('validate');
            if ($('.validate-error', this.$el).length) { return };

            var data = this.getData();
            var self = this;

            if (data) {
                Service.registerUser(data, this.id)
                    .done(function (response) {
                        self.context.destroyViews();
                    self.user.login(data.login, data.password).
                        done(function () {
                            Util.ajaxSuccessMessenger('registerMember');
                        }).fail(function () {
                            config.router.navigate('#login', {trigger: true});
                        });

                    })
                    .fail(function(error){
                        if(error.status == 409) {
                            self.$login.parent().addClass('validate-error');
                        }
                        Util.ajaxFailMessenger(error, 'registerMember');
                    });
            }
        },

        resetForm: function() {
            $('.rp-field', this.$el).removeClass('validate-error').find('input:enabled').val('');
            $('.validate-hint', this.$el).each(function (i, item) {
                $(item).removeClass('show-hint');
            });
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return RegisterView;
});
