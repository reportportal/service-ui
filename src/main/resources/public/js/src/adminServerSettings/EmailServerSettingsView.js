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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var AdminService = require('adminService');
    var EmailServerSettingsModel = require('adminServerSettings/EmailServerSettingsModel');
    var DropDownComponent = require('components/DropDownComponent');
    var Localization = require('localization');

    var config = App.getInstance();

    var EmailServerSettingsView = Epoxy.View.extend({

        template: 'tpl-email-server-settings',

        bindings: {
            '[data-js-server-enable]': 'checked: enableEmailServer',
            '[data-js-server-enable-mobile]': 'html: getState',
            '[data-js-server-config]': 'classes: {hide: not(enableEmailServer)}',
            '[data-js-server-host]': 'value: host',
            '[data-js-server-port]': 'value: port',
            '[dats-js-server-auth-config]': 'classes: {hide: not(authEnabled)}',
            '[data-js-server-username]': 'value: username',
            '[data-js-server-sender]': 'value: from',
            '[data-js-server-password]': 'value: password',
            '[data-js-server-tls]': 'checked: starTlsEnabled',
            '[data-js-server-ssl]': 'checked: sslEnabled'
        },

        computeds: {
            getState: {
                deps: ['enableEmailServer'],
                get: function (enableEmailServer) {
                    if (enableEmailServer) {
                        return 'ON';
                    }
                    return 'OFF';
                }
            }
        },

        events: {
            'click [data-js-submit-server-settings]': 'submitEmailSettings'
        },

        initialize: function (options) {
            this.model = new EmailServerSettingsModel();
            this.getSettings();
        },

        getSettings: function (callback) {
            AdminService.getAdminSettings('default')
                .done(function (data) {
                    this.serverSettings = data;
                    this.model.set(_.extend({enableEmailServer: !!data.serverEmailConfig}, data.serverEmailConfig));
                    this.render(data);
                    this.bindValidators();
                }.bind(this));
        },

        render: function (data) {
            this.$el.html(Util.templates(this.template, {
                emailConfig: data.serverEmailConfig,
                settings: config.forAdminSettings
            }));
            this.applyBindings();
            this.setupAnchors();
            this.setupSelectDropDown();
            this.bindValidators();
        },

        setupAnchors: function () {
            this.$host = $('[data-js-server-host]', this.$el);
            this.$port = $('[data-js-server-port]', this.$el);
            this.$user = $('[data-js-server-user]', this.$el);
            this.$sender = $('[data-js-server-sender]', this.$el);
            this.$password = $('[data-js-server-password]', this.$el);
            this.$errorBlock = $('[data-js-server-connection-error]', this.$el);
            this.$errorMessage = $('[data-js-server-connection-message]', this.$el);
        },

        setupSelectDropDown: function () {
            var settings = config.forAdminSettings,
                defaultAuth = [Localization.ui.on, Localization.ui.off];

            this.selectProtocol = new DropDownComponent({
                data: settings.protocol,
                multiple: false,
                defaultValue: this.model.get('protocol'),
            });
            $('[data-js-server-protocol]', this.$el).html(this.selectProtocol.$el);
            this.listenTo(this.selectProtocol, 'change', this.onChangeProtocol);

            this.authEnabled = new DropDownComponent({
                data: [{name: defaultAuth[0], value: defaultAuth[0]}, {name: defaultAuth[1], value: defaultAuth[1]}],
                multiple: false,
                defaultValue: this.model.get('authEnabled') ? defaultAuth[0] : defaultAuth[1],
            });
            $('[data-js-server-auth]', this.$el).html(this.authEnabled.$el);
            this.listenTo(this.authEnabled, 'change', this.onChangeAuth);
        },

        onChangeProtocol: function (val) {
            this.model.set('protocol', val);
        },

        onChangeAuth: function (val) {
            val = (val === 'ON');
            if (!val) {
                this.resetAuth();
            }
            this.model.set('authEnabled', val);
        },

        bindValidators: function () {
            Util.hintValidator(this.$host, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'hostMatchRegex',
                    pattern: config.patterns.hostandIP
                }
            ]);
            Util.hintValidator(this.$port, [
                {
                    validator: 'required'
                },
                {
                    validator: 'minMaxNumberRequired',
                    min: 1,
                    type: 'host',
                    max: 65535
                }
            ]);
        },

        resetAuth: function () {
            this.model.set('username', '');
            this.$user.val('');
            this.model.set('password', '');
            this.$password.val('');
        },

        deleteEmailSettings: function(){
            AdminService.deleteEmailSettings('default')
                .done(function(data){
                    this.model.set(this.model.defaults);
                    this.resetAuth();
                    this.selectProtocol.activateItem(config.forAdminSettings.defaultProtocol);
                    this.authEnabled.activateItem(Localization.ui.off);
                    Util.ajaxSuccessMessenger('deleteOAuthSettings');
                }.bind(this))
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'deleteOAuthSettings');
                });
        },

        submitEmailSettings: function(e){
            e.preventDefault();
            var enableEmailServer = this.model.get('enableEmailServer');
            if(!enableEmailServer){
                this.deleteEmailSettings();
            }
            else {
                this.updateEmailSettings();
            }
        },

        updateEmailSettings: function () {
            this.$host.trigger('validate');
            this.$port.trigger('validate');
            if ($('.validate-error', this.$el).length) return;

            var externalSystemData = this.model.getEmailServerSettings();
            this.toggleErrorMessage('hide');
            AdminService.setAdminSettings(externalSystemData, 'default')
                .done(function (response) {
                    Util.ajaxSuccessMessenger('setAdminSettings');
                })
                .fail(function (error) {
                    this.toggleErrorMessage('show', error);
                }.bind(this));
        },

        toggleErrorMessage: function (action, response) {
            var message = Localization.failMessages.setAdminSettings,
                error = '';
            if (action == 'show') {
                if (response) {
                    try {
                        error = JSON.parse(response.responseText);
                    } catch (e) {
                    }
                    if (error && error.message) {
                        message = '<strong class="connection-error-title"><i class="rp-icons rp-icons-warning"></i>' + Localization.admin.emailError + '</strong><br>' + error.message;
                    }
                }
                this.$errorMessage.html(message);
                this.$errorBlock.removeClass('hide');
            }
            else {
                this.$errorBlock.addClass('hide');
                this.$errorMessage.html('');
            }
        },

        destroy: function () {
            this.selectProtocol && this.selectProtocol.destroy();
            this.authEnabled && this.authEnabled.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return EmailServerSettingsView;

});
