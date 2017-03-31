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
    var Localization = require('localization');
    var Service = require('coreService');
    var App = require('app');
    var config = App.getInstance();

    var LoginResetView = Epoxy.View.extend({
        className:'login-reset-subpage',
        attributes: {'data-js-login-reset-subpage': ''},
        template: 'tpl-new-login-reset',

        events: {
            'mousedown [data-js-toogle-visability]': 'showPass',
            'mouseleave [data-js-toogle-visability]': 'hidePass',
            'mouseup [data-js-toogle-visability]': 'hidePass',

            'touchstart [data-js-toogle-visability]': 'showPass',
            'touchend  [data-js-toogle-visability]': 'hidePass',
            'touchcancel  [data-js-toogle-visability]': 'hidePass',

            'validation:success .rp-input': 'checkFields',
            'click [data-js-reset-pass-btn]': 'onSubmitForm',
            'submit [data-js-reset-form]': 'onSubmitForm'
        },

        initialize: function (options) {
            this.restoreKey = options.restoreKey;
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
        },

        setupAnchors: function(){
           this.$pass = $('[data-js-password]', this.$el);
           this.$confirmPass = $('[data-js-password-confirm]', this.$el);
           this.$resetPassBtn = $('[data-js-reset-pass-btn]', this.$el)
        },

        bindValidators: function () {
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
            Util.hintValidator(this.$confirmPass, [
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

        checkFields: function () {
            if (this.$confirmPass.val() !== this.$pass.val() && this.$confirmPass.val() !== '') {
                this.$confirmPass.parent().addClass('validate-error').find('.validate-hint').addClass('show-hint').html(Localization.validation.confirmMatch);
            } else {
                this.$confirmPass.parent().removeClass('validate-error').find('.validate-hint').removeClass('show-hint');
            }
        },
        onSubmitForm: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.submitChangePass();
        },
        submitChangePass: function () {
            $('.rp-field', this.$el).find('input').trigger('validate');
            if ($('.validate-error', this.$el).length  || this.$confirmPass.val() !== this.$pass.val()) return;

            var self = this;

            Service.submitPassReset(this.$pass.val(), this.restoreKey)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitChangePass');
                    _.delay(self.closeResetPassword.bind(self), 700);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'submitChangePass');
                });
        },

        closeResetPassword: function () {
            this.trigger('closeResetPass');
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }

    });

    return LoginResetView;
});
