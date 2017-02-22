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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Components = require('core/components');
    var App = require('app');
    var Localization = require('localization');
    var AdminService = require('adminService');

    var config = App.getInstance();

    var ContentView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.$header = options.header;
        },

        shellTpl: 'tpl-admin-content-shell',

        render: function () {
            this.$el.html(Util.templates(this.shellTpl));
            this.$body = $("#contentBody", this.$el);

            this.header = new Header({
                header: this.$header,
            }).render();

            this.renderBody();
            return this;
        },

        renderBody: function () {
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
            this.body = new SettingsPage({
                container: this.$body
            }).render();
        },

        destroy: function () {
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var Header = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
            this.currentPage = options.currentPage;
        },

        template: 'tpl-admin-settings-header',

        render: function () {
            this.$el.html(Util.templates(this.template, {
                currentPage: this.currentPage
            }));
            return this;
        }
    });

    var SettingsPage = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.container;
        },

        tpl: 'tpl-admin-settings-body',

        getSettings: function (callback) {
            var self = this;
            AdminService.getAdminSettings('default')
                .done(function (data) {
                    self.model = new EmailServerSettings(data.serverEmailConfig);
                    self.$el.html(Util.templates(self.tpl, {
                        emailConfig: data.serverEmailConfig,
                        settings: config.forAdminSettings
                    }));
                    self.$authBlock = $('.auth', self.$el);
                    self.bindValidators();
                });
        },

        events: {
            'click #submit-email-settings': 'submitEmailSettings',
            'click .dropdown-menu a': 'selectProp',
            'change [data-js-ssl-enabled]': 'toggleSSL',
            'change [data-js-tls-enabled]': 'toggleTLS'
        },

        toggleSSL: function(e){
            var $el = $(e.currentTarget);
            this.model.set('sslEnabled', $el.prop('checked'));
        },

        toggleTLS: function(e){
            var $el = $(e.currentTarget);
            this.model.set('starTlsEnabled', $el.prop('checked'));
        },

        selectProp: function (e) {
            e.preventDefault();
            var self = this;
            var link = $(e.target);
            var btn = link.closest('.open').find('.dropdown-toggle');
            var val = (link.data('value')) ? link.data('value') : link.text();
            var id = btn.attr('id');
            if (id === 'authorizationEnabled') {
                val = (val === 'ON');
                var blockAction = val ? 'show' : 'hide';
                this.$authBlock[blockAction]();
                if (val) {
                    self.model.set('authEnabled', true);
                } else {
                    self.model.set('authEnabled', false);
                    this.resetAuth();
                }
            }
            this.model.set(id, val);
            $('.select-value', btn).text(link.text());
        },
        resetAuth: function(){
            this.model.set('username', '');
            $('[data-js-username]', this.$el).val('');
            this.model.set('password', '');
            $('[data-js-password]', this.$el).val('');

        },
        submitEmailSettings: function () {
            var self = this;
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
                        var host = $("#host", self.$el);
                        var port = $("#port", self.$el);

                        host.val($.trim(host.val()));
                        port.val($.trim(port.val()));

                        Util.ajaxSuccessMessenger('setAdminSettings');
                    })
                    .fail(function (error) {
                        self.toggleErrorMessage('show', error);
                        //Util.ajaxFailMessenger(error, 'setAdminSettings');
                    });
            }
        },

        toggleErrorMessage: function(action, response){
            var $errorBlock = $('[data-js-connection-error]', this.$el),
                $errorMessage = $('[data-js-connection-message]', this.$el),
                message = Localization.failMessages.setAdminSettings,
                error = '';
            if(action == 'show') {
                $errorBlock.show();
                if (response) {
                    try {
                        error = JSON.parse(response.responseText);
                    } catch (e) {
                    }
                    if (error && error.message) {
                        message = '<strong>' + Localization.admin.emailError + '</strong> ' + error.message;
                    }
                }
                $errorMessage.html(message);
            }
            else {
                $errorBlock.hide();
                $errorMessage.html('');
            }
        },

        bindValidators: function () {
            Util.bootValidator($("#host", this.$el), [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'hostMatchRegex',
                    pattern: config.patterns.hostandIP
                }
            ]);
            Util.bootValidator($("#port", this.$el), [
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

        render: function () {
            this.getSettings();
            return this;
        }
    });

    var EmailServerSettings = Backbone.Model.extend({
        defaults: {},
        getEmailServerSettings: function () {
            var self = this;
            $('.form-control').each(function () {
                var $this = $(this);
                var id = $this.attr('id');
                self.set(id, $this.val());
            });
            var data = {
                authEnabled: this.get('authEnabled'),
                starTlsEnabled: this.get('starTlsEnabled'),
                sslEnabled: this.get('sslEnabled'),
                host: $.trim(this.get('host')),
                password: this.get('authEnabled') ? this.get('password'): '',
                port: $.trim(this.get('port')),
                protocol: $('.protocol').find('.select-value').text(),
                username: this.get('authEnabled') ? this.get('username') : ''
            };
            return data;
        }
    });

    return {
        ContentView: ContentView
    };
});
