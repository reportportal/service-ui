/*
 * Copyright 2019 EPAM Systems
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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var ModalConfirm = require('modals/modalConfirm');
    var AdminService = require('adminService');
    var SamlServerSettingsModel = require('adminServerSettings/authServerSettings/SamlAuthServerSettingsModel');
    var SettingsSwitcherView = require('components/SettingSwitcherView');

    var config = App.getInstance();

    var SamlAuthServerSettingsView = Epoxy.View.extend({

        className: 'saml-auth-config',

        wrapperTpl: 'tpl-saml-auth-instances-wrapper',
        multiTpl: 'tpl-saml-auth-multi-selector',
        instanceTpl: 'tpl-saml-auth-instance',

        events: {
            'click [data-js-submit-saml-auth-settings]': 'submitAuthSettings',
            'click [data-js-edit-saml-auth-settings]': 'editAuthSettings',
            'click [data-js-delete-saml-auth-settings]': 'deleteAuthSettings',
            'click [data-js-cancel-saml-auth-settings]': 'cancelEditAuthProperties',

            'click .saml-instance': 'selectSamlInstance',
            'click [data-js-close-add-action]': 'discardAddNew'
        },
        bindings: {
            '[data-js-saml-enable]': 'checked: enabled',
            '[data-js-saml-enable-mobile]': 'html: getSamlAuthState',

            '[data-js-full-name-field]': 'classes: {hide: not(isFullNameAttributeMode)}',
            '[data-js-first-last-name-wrapper]': 'classes: {hide: isFullNameAttributeMode}',

            '[data-js-identity-provider-name-id]': 'value: trimValue(identityProviderNameId)',
            '[data-js-identity-provider-name]': 'value: trimValue(identityProviderName)',
            '[data-js-identity-provider-metadata-url]': 'value: trimValue(identityProviderMetadataUrl)',
            '[data-js-email-attribute]': 'value: trimValue(emailAttribute)',
            '[data-js-full-name-attribute]': 'value: trimValue(fullNameAttribute)',
            '[data-js-first-name-attribute]': 'value: trimValue(firstNameAttribute)',
            '[data-js-last-name-attribute]': 'value: trimValue(lastNameAttribute)'
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
            getSamlAuthState: {
                deps: ['enabled'],
                get: function (enabled) {
                    if (enabled) {
                        return 'ON';
                    }
                    return 'OFF';
                }
            }
        },

        initialize: function () {
            this.systems = [];
            this.authType = config.authTypes.saml;
            this.systemAt = 0;
            this.getAuthSettings();
        },

        render: function () {
            this.$el.html(Util.templates(this.wrapperTpl, {}));
            this.$instanceSamlHead = $('#instanceSamlHead', this.$el);
            this.$instanceSamlBody = $('#instanceSamlBody', this.$el);
            this.renderMultiSelector();
            this.renderInstance();
        },

        renderMultiSelector: function () {
            var systems;
            this.$instanceSamlHead.empty();
            systems = this.systems.length ? this.systems : [];
            this.$instanceSamlHead.html(Util.templates(this.multiTpl, {
                systems: systems,
                index: this.systemAt
            }));
            return true;
        },

        renderInstance: function () {
            var params = this.model.toJSON();
            this.$instanceSamlBody.empty();
            params.settings = this.settings;

            this.$instanceSamlBody.html(Util.templates(this.instanceTpl, params));
            this.modeSwitcher.activate();
            $('[data-js-name-mode-switcher]', this.$el).html(this.modeSwitcher.$el);
            this.listenTo(this.modeSwitcher.model, 'change:value', function () {
                this.setNameAttributeMode(this.getModeValue());
            });

            this.setupAnchors();
            this.bindValidators();
            this.applyBindings();
            this.setupValidityState(!this.systems.length);
        },

        setupAnchors: function () {
            this.$editBtn = $('[data-js-edit-saml-auth-settings]', this.$el);
            this.$deleteBtn = $('[data-js-delete-saml-auth-settings]', this.$el);
            this.$cancelBtn = $('[data-js-cancel-saml-auth-settings]', this.$el);
            this.$submitBtn = $('[data-js-submit-saml-auth-settings]', this.$el);
            this.$propertiesWrapper = $('#propertiesWrapper', this.$el);
            this.$nameModeSwitcher = $('[data-js-name-mode-switcher]', this.$el);

            this.$identityProviderName = $('[data-js-identity-provider-name]', this.$el);
            this.$identityProviderMetadataUrl = $('[data-js-identity-provider-metadata-url]', this.$el);
            this.$emailAttribute = $('[data-js-email-attribute]', this.$el);
            this.$fullNameAttribute = $('[data-js-full-name-attribute]', this.$el);
            this.$firstNameAttribute = $('[data-js-first-name-attribute]', this.$el);
            this.$lastNameAttribute = $('[data-js-last-name-attribute]', this.$el);
        },

        setupValidityState: function (isNew) {
            if (!isNew && !this.model.isEdit()) {
                this.$editBtn.show();
                this.$deleteBtn.show();
                this.$cancelBtn.hide();
                this.$submitBtn.hide();
                $('input', this.$propertiesWrapper).prop('disabled', true);
                this.$nameModeSwitcher.addClass('disabled');
            } else {
                this.$submitBtn.show();
                this.$editBtn.hide();
                this.$deleteBtn.hide();

                $('input', this.$propertiesWrapper).prop('disabled', false);
                this.$nameModeSwitcher.removeClass('disabled');
            }
        },

        editAuthSettings: function () {
            this.model.setupEdit();
            this.setupValidityState();
            this.$cancelBtn.show();
            this.$submitBtn.show();
        },

        cancelEditAuthProperties: function () {
            var isFullNameAttributeMode;
            this.model.cancelEdit();
            isFullNameAttributeMode = this.model.get('isFullNameAttributeMode');
            this.applyNameAttributesModeSwitcher(isFullNameAttributeMode ? 'FULL' : 'FIRST_LAST');
            this.renderInstance();
        },

        selectSamlInstance: function (e) {
            var $tab;
            var $parent;
            e.preventDefault();
            $tab = $(e.currentTarget);
            $parent = $tab.parent();

            if ($parent.hasClass('active') || $parent.hasClass('disabled')) {
                return false;
            }

            if ($tab.hasClass('add-new')) {
                $parent.closest('ul').find('.active').removeClass('active');
                $parent.addClass('disabled');
                $parent.closest('ul').find('.bts-name-new-project').addClass('active').addClass('activated');

                this.model = new SamlServerSettingsModel({ fullNameAttribute: ' ' });
                this.applyNameAttributesModeSwitcher('FULL');
                this.renderInstance();
                this.setupValidityState(true);
            } else {
                this.systemAt = $tab.data('index');
                this.model = new SamlServerSettingsModel(this.systems[this.systemAt]);
                this.renderMultiSelector();
                this.renderInstance();
            }
            return true;
        },

        discardAddNew: function (e) {
            var activeSystem = this.systems[this.systemAt];
            e.preventDefault();
            $(e.currentTarget).closest('li').removeClass('activated').removeClass('active');
            $(e.currentTarget).closest('ul')
                .find('[data-index=' + this.systemAt + ']')
                .parent()
                .addClass('active');
            $(e.currentTarget).closest('ul').find('.bts-instance-action').removeClass('disabled');

            this.model = new SamlServerSettingsModel(activeSystem);
            this.applyNameAttributesModeSwitcher((activeSystem && activeSystem.fullNameAttribute) ? 'FULL' : 'FIRST_LAST');
            this.renderInstance();
            e.stopPropagation();
        },

        deleteAuthSettings: function () {
            var self = this;
            var identityProviderName = this.model.get('identityProviderName');
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteSamlInstance,
                bodyText: Util.replaceTemplate(
                    Localization.dialog.deleteSamlInstance,
                    identityProviderName
                ),
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
                confirmFunction: function () {
                    return AdminService.deleteAuthSettings(self.authType, identityProviderName)
                        .done(function () {
                            var activeSystem;
                            var mode;
                            self.systems.splice(self.systemAt, 1);
                            if (self.systems.length) {
                                activeSystem = self.systems[0];
                                mode = (activeSystem && activeSystem.fullNameAttribute) ? 'FULL' : 'FIRST_LAST';
                                self.model = new SamlServerSettingsModel(activeSystem);
                            } else {
                                self.model = new SamlServerSettingsModel(
                                    { isFullNameAttributeMode: true }
                                );
                                mode = 'FULL';
                            }
                            self.systemAt = 0;
                            self.applyNameAttributesModeSwitcher(mode);
                            self.renderMultiSelector();
                            self.renderInstance();
                            Util.ajaxSuccessMessenger('deleteSamlInstance');
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, 'deleteSamlInstance');
                        });
                }
            });
            config.trackingDispatcher.trackEventNumber(402);
            $('[data-js-close]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(405);
            });
            $('[data-js-cancel]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(406);
            });
            modal.show();
        },

        submitAuthSettings: function () {
            if (this.validate()) {
                this.saveInstance();
            } else {
                $('input:visible, textarea:visible', this.$propertiesWrapper).trigger('validate');
            }
        },

        saveInstance: function () {
            var self = this;
            var samlInstanceData;
            var saveInstanceMessage;
            var isEditMode = this.model.get('mode') === 'edit';
            samlInstanceData = this.model.getSettings();

            AdminService.setAuthSettings(
                this.authType,
                samlInstanceData,
                samlInstanceData.identityProviderName
            )
                .done(function () {
                    if (isEditMode) {
                        self.systems[self.systemAt] = samlInstanceData;
                        saveInstanceMessage = 'updateSamlInstance';
                    } else {
                        self.systems.push(samlInstanceData);
                        self.systemAt = self.systems.length - 1;
                        saveInstanceMessage = 'addSamlInstance';
                    }
                    self.model.discardEdit();
                    self.applyNameAttributesModeSwitcher(samlInstanceData.fullNameAttribute ? 'FULL' : 'FIRST_LAST');
                    self.renderMultiSelector();
                    self.renderInstance();
                    Util.ajaxSuccessMessenger(saveInstanceMessage);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, saveInstanceMessage);
                });
        },

        bindValidators: function () {
            Util.hintValidator(this.$identityProviderName, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$identityProviderMetadataUrl, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$emailAttribute, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$fullNameAttribute, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$fullNameAttribute, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$firstNameAttribute, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$lastNameAttribute, [
                {
                    validator: 'required'
                }
            ]);
        },
        getAuthSettings: function () {
            AdminService.getAuthSettings(this.authType)
                .done(function (data) {
                    this.fetchSettingsSuccess(data);
                }.bind(this))
                .fail(function () {
                    this.applyNameAttributesModeSwitcher('FULL');
                }.bind(this))
                .always(function () {
                    this.render();
                }.bind(this));
        },

        applyNameAttributesModeSwitcher: function (value) {
            var self = this;

            this.modeSwitcher = new SettingsSwitcherView({ options: {
                isShortForm: false,
                items: [{ name: Localization.admin.fullNameAttributeMode, value: 'FULL' },
                    { name: Localization.admin.firstLastNameAttributeMode, value: 'FIRST_LAST' }],
                value: value
            } });

            _.each(self.modeSwitcher.model.get('items'), function (item, i) {
                if (item.value === value) {
                    self.modeSwitcher.model.set('value', i);
                }
            });
        },

        getModeValue: function () {
            var self = this;
            var option;
            _.each(this.modeSwitcher.model.get('items'), function (item, i) {
                if (i === self.modeSwitcher.model.get('value')) {
                    option = item;
                }
            });
            return option && option.value;
        },

        setNameAttributeMode: function (mode) {
            this.model.set({
                isFullNameAttributeMode: mode === 'FULL'
            });
        },

        fetchSettingsSuccess: function (systems) {
            var self = this;
            var activeSystem = {};
            _.each(Object.keys(systems), function (key) {
                self.systems.push(systems[key]);
            });
            if (this.systems[0]) {
                activeSystem = this.systems[0];
            }
            this.model = new SamlServerSettingsModel(activeSystem);
            this.applyNameAttributesModeSwitcher((activeSystem.fullNameAttribute) ? 'FULL' : 'FIRST_LAST');
        },

        updateModel: function (settings) {
            var data = {
                enabled: settings.enabled,
                identityProviderNameId: settings.identityProviderNameId,
                identityProviderName: settings.identityProviderName,
                identityProviderMetadataUrl: (settings.identityProviderMetadataUrl) ? settings.identityProviderMetadataUrl : '',
                emailAttribute: (settings.emailAttribute) ? settings.emailAttribute : '',
                fullNameAttribute: (settings.fullNameAttribute) ? settings.fullNameAttribute : '',
                firstNameAttribute: (settings.firstNameAttribute) ? settings.firstNameAttribute : '',
                lastNameAttribute: (settings.lastNameAttribute) ? settings.lastNameAttribute : ''
            };

            this.model.set(data);
        },
        validate: function () {
            var isFullNameAttributeMode = this.model.get('isFullNameAttributeMode');
            var nameAtrributesValidator;
            this.$identityProviderName.trigger('validate');
            this.$identityProviderMetadataUrl.trigger('validate');
            this.$emailAttribute.trigger('validate');
            if (isFullNameAttributeMode) {
                this.$fullNameAttribute.trigger('validate');
                nameAtrributesValidator = this.$fullNameAttribute.data('validate-error');
            } else {
                this.$firstNameAttribute.trigger('validate');
                this.$lastNameAttribute.trigger('validate');
                nameAtrributesValidator = this.$firstNameAttribute.data('validate-error') ||
                    this.$lastNameAttribute.data('validate-error');
            }
            return !(
                this.$identityProviderName.data('validate-error') ||
                this.$identityProviderMetadataUrl.data('validate-error') ||
                this.$emailAttribute.data('validate-error') ||
                nameAtrributesValidator
            );
        },
        onDestroy: function () {
            this.modeSwitcher && this.modeSwitcher.destroy();
            this.remove();
            delete this;
        }
    });

    return SamlAuthServerSettingsView;
});
