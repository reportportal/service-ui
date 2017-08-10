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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var AdminService = require('adminService');
    var AdServerSettingsModel = require('adminServerSettings/authServerSettings/AdAuthServerSettingsModel');
    var config = App.getInstance();

    var AdAuthServerSettingsView = Epoxy.View.extend({

        className: 'ad-auth-config',

        template: 'tpl-ad-auth-config',

        events: {
            'click [data-js-submit-ad-auth-settings]': 'submitAuthSettings',
            'change [data-js-ad-enable]': 'enableSubmit',
            'keydown .rp-input': 'enableSubmit'
        },
        bindings: {
            '[data-js-ad-enable]': 'checked: adAuthEnabled',
            '[data-js-ad-enable-mobile]': 'html: getAdAuthState',
            '[data-js-ad-config]': 'classes: {hide: not(adAuthEnabled)}',
            '[data-js-domain]': 'value: trimValue(domain)',
            '[data-js-ldap-url]': 'value: trimValue(url)',
            '[data-js-base-dn]': 'value: trimValue(baseDn)',

            '[data-js-email]': 'value:  trimValue(email)',
            '[data-js-full-name]': 'value: trimValue(fullName)',
            '[data-js-photo]': 'value: trimValue(photo)'
        },
        bindingFilters: {
            trimValue: {
                get: function (value) {
                    return value.trim();
                },
                set: function (value) {
                    return value.trim();
                }
            }
        },
        computeds: {
            getAdAuthState: {
                deps: ['adAuthEnabled'],
                get: function (adAuthEnabled) {
                    if (adAuthEnabled) {
                        return 'ON';
                    }
                    return 'OFF';
                }
            }
        },

        initialize: function () {
            this.model = new AdServerSettingsModel();
            this.authType = config.authTypes.activeDirectory;
            this.getAuthSettings();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
            this.applyBindings();
        },
        getAuthSettings: function () {
            AdminService.getAuthSettings(this.authType)
                .done(function (data) {
                    this.model.set('adAuthEnabled', true);
                    this.updateModel(data);
                }.bind(this))
                .fail(function () {
                    this.model.set('adAuthEnabled', false);
                }.bind(this))
                .always(function () {
                    this.render();
                }.bind(this));
        },
        updateModel: function (settings) {
            this.model.set({
                domain: settings.domain,
                url: (settings.url) ? settings.url.split('ldap://')[1] : '',
                baseDn: settings.baseDn,
                email: (settings.synchronizationAttributes && settings.synchronizationAttributes.email) ? settings.synchronizationAttributes.email : '',
                fullName: (settings.synchronizationAttributes && settings.synchronizationAttributes.fullName) ? settings.synchronizationAttributes.fullName : '',
                photo: (settings.synchronizationAttributes && settings.synchronizationAttributes.photo) ? settings.synchronizationAttributes.photo : ''
            });
        },
        setupAnchors: function () {
            this.$domain = $('[data-js-domain]', this.$el);
            this.$url = $('[data-js-ldap-url]', this.$el);
            this.$baseDn = $('[data-js-base-dn]', this.$el);
            this.$email = $('[data-js-email]', this.$el);
        },
        bindValidators: function () {
            Util.hintValidator(this.$domain, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'domainMatchRegex',
                    pattern: config.patterns.domain
                }

            ]);
            Util.hintValidator(this.$url, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$baseDn, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$email, [
                {
                    validator: 'required'
                }
            ]);
        },
        submitAuthSettings: function (e) {
            var adAuthEnabled;
            e.preventDefault();
            $.each($('[data-js-ad-config] .rp-input', this.$el), function (key, input) {
                input.value = input.value.trim();
            });
            adAuthEnabled = this.model.get('adAuthEnabled');
            if (adAuthEnabled) {
                if (this.validate()) {
                    this.updateAuthSettings();
                }
            } else {
                this.deleteAuthSettings();
            }
        },
        validate: function () {
            this.$domain.trigger('validate');
            this.$url.trigger('validate');
            this.$baseDn.trigger('validate');
            this.$email.trigger('validate');
            return !(
                this.$domain.data('validate-error') ||
                this.$url.data('validate-error') ||
                this.$baseDn.data('validate-error') ||
                this.$email.data('validate-error')
            );
        },
        deleteAuthSettings: function () {
            AdminService.deleteAuthSettings(this.authType)
                .done(function () {
                    this.updateModel(this.model.defaults);
                    $('.validate-error', this.$el).removeClass('validate-error');
                    Util.ajaxSuccessMessenger('deleteOAuthSettings');
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'deleteOAuthSettings');
                });
        },
        updateAuthSettings: function () {
            var authData = {
                // required fields
                enabled: this.model.get('adAuthEnabled'),
                domain: this.model.get('domain'),
                baseDn: this.model.get('baseDn'),
                url: 'ldap://' + this.model.get('url'),
                synchronizationAttributes: {
                    email: this.model.get('email')
                }
            };
            // optional fields
            this.model.get('fullName') && (authData.synchronizationAttributes.fullName = this.model.get('fullName'));
            this.model.get('photo') && (authData.synchronizationAttributes.photo = this.model.get('photo'));

            AdminService.setAuthSettings(this.authType, authData)
                .done(function (data) {
                    this.updateModel(data);
                    $('.validate-error', this.$el).removeClass('validate-error');
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'setOAuthSettings');
                });
        },
        enableSubmit: function () {
            $('[data-js-submit-ad-auth-settings]', this.$el).attr('disabled', false);
        },
        onDestroy: function () {
            this.remove();
            delete this;
        }
    });

    return AdAuthServerSettingsView;
});
