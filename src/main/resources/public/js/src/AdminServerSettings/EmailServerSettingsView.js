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
    var AdminService = require('adminService');
    var EmailServerSettingsModel = require('adminServerSettings/EmailServerSettingsModel');
    var Localization = require('localization');

    var config = App.getInstance();

    var EmailServerSettingsView = Epoxy.View.extend({

        template: 'tpl-email-server-settings',

        bindings: {
            '[data-js-server-enable]': 'checked: enableEmailServer',
            '[data-js-server-config]': 'classes: {hide: not(enableEmailServer)}',
            '[data-js-server-host]': 'value: host',
            '[data-js-server-protocol-name]': 'text: getProtocol',
            '[data-js-server-port]': 'value: port',
            '[dats-js-server-auth-name]': 'text: getAuth',
            '[dats-js-server-auth-config]': 'classes: {hide: not(authEnabled)}',
            '[data-js-server-username]': 'value: username',
            '[data-js-server-password]': 'value: password',
            '[data-js-server-tls]': 'checked: starTlsEnabled',
            '[data-js-server-ssl]': 'checked: sslEnabled'
        },

        computeds: {
            getProtocol: {
                deps: ['protocol'],
                get: function(protocol){
                    var p = _.find(config.forAdminSettings.protocol, function(prot){ return prot.value === protocol; });
                    return p.name;
                }
            },
            getAuth: {
                deps: ['authEnabled'],
                get: function(authEnabled){
                    var text = Localization.ui;
                    return authEnabled ? text.on : text.off;
                }
            }
        },

        events: {
            'click [data-js-submit-server-settings]': 'submitEmailSettings',
            'click [data-js-prop-dropdown] a': 'selectProp'
        },

        initialize: function(options){
            this.model = new EmailServerSettingsModel();
            this.getSettings();
        },

        getSettings: function (callback) {
            AdminService.getAdminSettings('default')
                .done(function (data) {
                    //console.log('getSettings: ', data);
                    this.serverSettings = data;
                    this.model.set(_.extend({enableEmailServer: !!data.serverEmailConfig}, data.serverEmailConfig));
                    this.render(data);
                    this.bindValidators();
                }.bind(this));
        },

        render: function(data){
            //console.log('render EmailServerSettingsView: ');
            this.$el.html(Util.templates(this.template, {
                emailConfig: data.serverEmailConfig,
                settings: config.forAdminSettings
            }));
            this.applyBindings();
            this.setupAnchors();
            this.bindValidators();
        },

        setupAnchors: function(){
            this.$host = $('[data-js-sever-host]', this.$el);
            this.$port = $('[data-js-server-port]', this.$el);
            this.$user = $('[data-js-server-user]', this.$el);
            this.$password = $('[data-js-server-password]', this.$el);
            this.$errorBlock = $('[data-js-server-connection-error]', this.$el);
            this.$errorMessage = $('[data-js-server-connection-message]', this.$el);
        },

        selectProp: function (e) {
            e.preventDefault();
            var link = $(e.target),
                val = (link.data('value')) ? link.data('value') : link.text(),
                btn = link.closest('.open').find('[data-js-select-prop]'),
                id = btn.data('id');

            if (id === 'authEnabled') {
                val = (val === 'ON');
                if(!val){
                    this.resetAuth();
                }
            }
            this.model.set(id, val);
        },

        bindValidators: function () {
            Util.bootValidator(this.$host, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'hostMatchRegex',
                    pattern: config.patterns.hostandIP
                }
            ]);
            Util.bootValidator(this.$port, [
                {
                    validator: 'required'
                },
                {
                    validator: 'minMaxNumberRequired',
                    min: 1,
                    type: 'host',
                    max: 65535
                }
            ], {
                userFilterDelay: 100
            });
        },

        resetAuth: function(){
            this.model.set('username', '');
            this.$user.val('');
            this.model.set('password', '');
            this.$password.val('');
        },

        submitEmailSettings: function () {
            var noErrors = true;
            var externalSystemData = this.model.getEmailServerSettings();

            $('.has-error').each(function () {
                var $this = $(this);
                var formControl = $this.find('.form-control');

                if (formControl.attr('id') == 'port' || formControl.attr('id') == 'host') {
                    noErrors = false;
                }
            });

            if (noErrors) {
                this.toggleErrorMessage('hide');
                AdminService.setAdminSettings(externalSystemData, 'default')
                    .done(function (response) {
                        Util.ajaxSuccessMessenger('setAdminSettings');
                    })
                    .fail(function (error) {
                        this.toggleErrorMessage('show', error);
                    }.bind(this));
            }
        },

        toggleErrorMessage: function(action, response) {
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

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return EmailServerSettingsView;

});