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
    var Localization = require('localization');
    var AdminService = require('adminService');
    var LdapServerSettingsModel = require('adminServerSettings/authServerSettings/LdapAuthServerSettingsModel');
    var DropDownComponent = require('components/DropDownComponent');

    var config = App.getInstance();

    var LdapAuthServerSettingsView = Epoxy.View.extend({

        className: 'ldap-auth-config',

        template: 'tpl-ldap-auth-config',

        events: {
            'click [data-js-submit-ldap-auth-settings]': 'submitAuthSettings',
            'change [data-js-ldap-enable]': 'enableSubmit',
            'keydown .rp-input': 'enableSubmit',
            'keydown [data-js-manager-dn]': 'enableUserSearchFilterField',
            'keydown [data-js-manager-password]': 'enableUserSearchFilterField'
        },
        bindings: {
            '[data-js-ldap-enable]': 'checked: ldapAuthEnabled',
            '[data-js-ldap-enable-mobile]': 'html: getLdapAuthState',
            '[data-js-ldap-config]': 'classes: {hide: not(ldapAuthEnabled)}',
            '[data-js-ldap-url]': 'value: trimValue(url)',
            '[data-js-base-dn]': 'value: trimValue(baseDn)',
            '[data-js-user-dn-pattern]': 'value: trimValue(userDnPattern)',
            '[data-js-user-search-filter]': 'value: trimValue(userSearchFilter)',
            '[data-js-group-search-base]': 'value: trimValue(groupSearchBase)',
            '[data-js-group-search-filter]': 'value: trimValue(groupSearchFilter)',
            '[data-js-password-attribute]': 'value: trimValue(passwordAttribute)',
            '[data-js-manager-dn]': 'value: trimValue(managerDn)',
            '[data-js-manager-password]': 'value: trimValue(managerPassword)',

            '[data-js-email]': 'value: trimValue(email)',
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
            getLdapAuthState: {
                deps: ['ldapAuthEnabled'],
                get: function (ldapAuthEnabled) {
                    if (ldapAuthEnabled) {
                        return 'ON';
                    }
                    return 'OFF';
                }
            }
        },

        initialize: function () {
            this.model = new LdapServerSettingsModel();
            this.authType = config.authTypes.ldap;
            this.getAuthSettings();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupEncTypeDropDown();
            this.setupAnchors();
            this.bindValidators();
            this.applyBindings();
        },
        setupAnchors: function () {
            this.$url = $('[data-js-ldap-url]', this.$el);
            this.$baseDn = $('[data-js-base-dn]', this.$el);
            this.$email = $('[data-js-email]', this.$el);
        },
        bindValidators: function () {
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
        getAuthSettings: function () {
            AdminService.getAuthSettings(this.authType)
                .done(function (data) {
                    this.model.set('ldapAuthEnabled', true);
                    this.updateModel(data);
                }.bind(this))
                .fail(function () {
                    this.model.set('ldapAuthEnabled', false);
                }.bind(this))
                .always(function () {
                    this.render();
                    if (this.model.get('passwordEncoderType') === 'disabled') {
                        $('[data-js-password-attribute]', this.$el).val('').attr('disabled', 'disabled');
                    }
                    if (!(this.model.get('managerDn') || this.model.get('managerPassword'))) {
                        $('[data-js-user-search-filter]', this.$el).val('').attr('disabled', 'disabled');
                    }
                }.bind(this));
        },
        updateModel: function (settings) {
            this.model.set({
                url: (settings.url) ? settings.url.split('ldap://')[1] : '',
                baseDn: settings.baseDn,
                userDnPattern: (settings.userDnPattern) ? settings.userDnPattern : '',
                userSearchFilter: (settings.userSearchFilter) ? settings.userSearchFilter : '',
                groupSearchBase: (settings.groupSearchBase) ? settings.groupSearchBase : '',
                groupSearchFilter: (settings.groupSearchFilter) ? settings.groupSearchFilter : '',
                passwordAttribute: (settings.passwordAttribute) ? settings.passwordAttribute : '',
                managerDn: (settings.managerDn) ? settings.managerDn : '',
                managerPassword: (settings.managerPassword) ? settings.managerPassword : '',
                passwordEncoderType: (settings.passwordEncoderType) ? settings.passwordEncoderType : 'disabled',
                email: (settings.synchronizationAttributes && settings.synchronizationAttributes.email) ? settings.synchronizationAttributes.email : '',
                fullName: (settings.synchronizationAttributes && settings.synchronizationAttributes.fullName) ? settings.synchronizationAttributes.fullName : '',
                photo: (settings.synchronizationAttributes && settings.synchronizationAttributes.photo) ? settings.synchronizationAttributes.photo : ''
            });
        },
        setupEncTypeDropDown: function () {
            this.encTypeSelector = new DropDownComponent({
                data: [
                    { name: Localization.ui.no.toUpperCase(), value: 'disabled' },
                    { name: 'PLAIN', value: 'PLAIN' },
                    { name: 'SHA', value: 'SHA' },
                    { name: 'LDAP_SHA', value: 'LDAP_SHA' },
                    { name: 'MD4', value: 'MD4' },
                    { name: 'MD5', value: 'MD5' }
                ],
                multiple: false,
                defaultValue: this.model.get('passwordEncoderType') ? this.model.get('passwordEncoderType') : 'disabled'
            });
            $('[data-js-pass-enc-type-dropdown]', this.$el).html(this.encTypeSelector.$el);
            this.listenTo(this.encTypeSelector, 'change', function (val) {
                if (val === 'disabled') {
                    $('[data-js-password-attribute]', this.$el).val('').attr('disabled', 'disabled');
                } else {
                    $('[data-js-password-attribute]', this.$el).attr('disabled', false);
                }
                this.model.set('passwordEncoderType', val);
                this.enableSubmit();
            });
        },
        submitAuthSettings: function (e) {
            var ldapAuthEnabled;
            e.preventDefault();
            $.each($('[data-js-ldap-config] .rp-input', this.$el), function (key, input) {
                input.value = input.value.trim();
            });
            ldapAuthEnabled = this.model.get('ldapAuthEnabled');
            if (ldapAuthEnabled) {
                if (this.validate()) {
                    this.updateAuthSettings();
                }
            } else {
                this.deleteAuthSettings();
            }
        },
        validate: function () {
            this.$url.trigger('validate');
            this.$baseDn.trigger('validate');
            this.$email.trigger('validate');
            return !(
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
                    this.encTypeSelector.activateItem('disabled');
                    this.encTypeSelector.trigger('change', 'disabled');
                    $('[data-js-user-search-filter]', this.$el).val('').attr('disabled', 'disabled');
                    Util.ajaxSuccessMessenger('deleteOAuthSettings');
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'deleteOAuthSettings');
                });
        },
        updateAuthSettings: function () {
            var authData = {
                // required fields
                enabled: this.model.get('ldapAuthEnabled'),
                baseDn: this.model.get('baseDn'),
                url: 'ldap://' + this.model.get('url'),
                synchronizationAttributes: {
                    email: this.model.get('email')
                }
            };
            // optional fields
            this.model.get('userDnPattern') && (authData.userDnPattern = this.model.get('userDnPattern'));
            this.model.get('userSearchFilter') && (authData.userSearchFilter = this.model.get('userSearchFilter'));
            this.model.get('groupSearchBase') && (authData.groupSearchBase = this.model.get('groupSearchBase'));
            this.model.get('groupSearchFilter') && (authData.groupSearchFilter = this.model.get('groupSearchFilter'));
            this.model.get('passwordAttribute') && (authData.passwordAttribute = this.model.get('passwordAttribute'));
            this.model.get('managerDn') && (authData.managerDn = this.model.get('managerDn'));
            this.model.get('managerPassword') && (authData.managerPassword = this.model.get('managerPassword'));
            (this.model.get('passwordEncoderType') !== 'disabled') && (authData.passwordEncoderType = this.model.get('passwordEncoderType'));
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
            $('[data-js-submit-ldap-auth-settings]', this.$el).attr('disabled', false);
        },
        enableUserSearchFilterField: function () {
            $('[data-js-user-search-filter]', this.$el).attr('disabled', false);
        },
        onDestroy: function () {
            this.encTypeSelector && this.encTypeSelector.destroy();
            this.remove();
            delete this;
        }
    });

    return LdapAuthServerSettingsView;
});
