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
    var Localization = require('localization');
    var App = require('app');
    var config = App.getInstance();

    var LoginRestoreView = Epoxy.View.extend({
        className:'login-restore-subpage',
        attributes: {'data-js-login-restore-subpage': ''},
        template: 'tpl-new-login-restore',

        bindings: {
            '[data-js-build-versions]': 'html: fullServicesHtml',
        },

        events: {
            'click [data-js-cancel-restore-btn]': 'onCloseForgotPass',
            'click [data-js-change-pass-btn]': 'onSubmitForm',
            'submit [data-js-restore-form]': 'onSubmitForm',
        },

        initialize: function () {
            this.render()
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
        },

        setupAnchors: function(){
            this.$restoreForm = $("[data-js-restore-form-wrapper]", this.$el);
            this.$submitRestore = $("[data-js-change-pass-btn]", this.$el);
            this.$email = $("[data-js-email]", this.$el);
        },

        bindValidators: function () {
            Util.hintValidator(this.$email, [
                {validator: 'matchRegex', type: 'emailMatchRegex', pattern: config.patterns.email, arg: 'i'}
            ]);
        },

        onCloseForgotPass: function () {
            this.trigger('closeForgotPass');
        },
        onSubmitForm: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.submitForgotPass();
        },
        submitForgotPass: function () {
            $('.rp-field', this.$el).find('input').trigger('validate');
            if ($('.validate-error', this.$el).length) return;

            var self = this;
            Service.initializePassChange(this.$email.val())
                .done(function () {
                    Util.ajaxSuccessMessenger('submitForgotPass', self.$email.val());
                    _.delay(self.onCloseForgotPass.bind(self), 700);
                })
                .fail(function (error) {
                    var type = error.responseText.indexOf('external user') > -1
                        ? 'submitForgotPassRestricted'
                        : 'submitForgotPass';

                    if (error.responseText.indexOf('40010') > -1 || error.responseText.indexOf(Localization.failMessages.serverNotConfigured) > -1) {
                        type = 'submitForgotPassBrokenConf';
                    }

                    Util.ajaxFailMessenger(null, type);
                });
        },
    });

    return LoginRestoreView;
});

