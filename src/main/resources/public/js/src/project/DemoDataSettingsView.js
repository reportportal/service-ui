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
    var Util = require('util');
    var Components = require('components');
    var App = require('app');
    var Service = require('coreService');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();

    var DemoDataSettingsView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.holder;
        },
        events: {
            'click [data-js-demo-data-submit]': 'submitSettings',
            'input [data-js-demo-data-postfix]': 'validate',
        },
        tpl: 'tpl-project-settings-demo-data',
        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.setupAnchors();
            this.initValidators();
            return this;
        },
        setupAnchors: function(){
            this.$submitSettings = $('[data-js-demo-data-submit]', this.$el);
            this.$postfixInput = $('[data-js-demo-data-postfix]', this.$el);
        },
        toggleDisableForm: function(disable){
            this.$postfixInput.prop('disabled', disable);
            this.$submitSettings.prop('disabled', disable);
        },
        initValidators: function () {
            var self = this;
            Util.bootValidator(this.$postfixInput, [
                {
                    type: 'postfix',
                    validator: 'minMaxRequired',
                    min: 1,
                    max: 90
                }
            ]);
        },
        validate: function(){
            this.$postfixInput.trigger('validate');
            return this.$postfixInput.data('valid');

        },
        showFormError: function(error){
            var response = null,
                message = '';
            if (error) {
                try {
                    response = JSON.parse(error.responseText);
                } catch (e) {
                    message = Localization.failMessages.defaults;
                }
                if(error.status === 409){
                    message = Localization.project.posfixUniq;
                }
                else {
                    if (response && response.message) {
                        if(response.message.indexOf("You couldn't create the duplicate") >=0){
                            message = Localization.project.posfixUniq;
                        }
                        else {
                            message = response.message.replace('{}', '');
                        }
                    }
                }
            }
            var form = this.$postfixInput.closest('.rp-form-group');
            form.addClass('has-error');
            $('.help-inline', form).text(message);
        },
        hideFormError: function(){
            var form = this.$postfixInput.closest('.rp-form-group');
            form.removeClass('has-error');
            $('.help-inline', form).text('');
        },
        submitSettings: function (e) {
            if (!this.validate()) {
                return;
            }
            this.hideFormError();
            var postfix = this.$postfixInput.val(),
                data = {
                    "isCreateDashboard": "true",
                    "postfix": postfix
                };

            this.toggleDisableForm(true);
            Service.generateDemoData(data)
                .done(function (response) {
                    this.$postfixInput.val('');
                    Util.ajaxSuccessMessenger('generateDemoData');
                }.bind(this))
                .fail(function (error) {
                    this.showFormError(error);
                    Util.ajaxFailMessenger(error);
                }.bind(this))
                .always(function(){
                    this.toggleDisableForm(false);
                }.bind(this));

        },
        destroy: function () {
            Components.RemovableView.prototype.destroy.call(this);
        }
    });

    return DemoDataSettingsView;
});
