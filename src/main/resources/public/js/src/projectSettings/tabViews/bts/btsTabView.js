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
    var _ = require('underscore');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var Service = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var ModalConfirm = require('modals/modalConfirm');
    var DropDownComponent = require('components/DropDownComponent');

    var config = App.getInstance();

    var BtsPropertiesModel = require('projectSettings/tabViews/bts/btsPropertiesModel');
    var BtsFieldsView = require('projectSettings/tabViews/bts/btsFieldsView');

    var BtsTabView = Epoxy.View.extend({
        defaultFields: null,

        className: 'bts-project-settings',

        wrapperTpl: 'tpl-bts-wrapper',
        instanceTpl: 'tpl-bts-instance',
        multiTpl: 'tpl-bts-multi-selector',
        authTpl: 'tpl-bts-auth-type',

        events: {
            'keyup .bts-property': 'updateModel',
            'blur .bts-property': 'updateModel',
            'click #submitBtsProperties': 'saveProperties',
            'click #editBtsProperties': 'editProperties',
            'click #deleteInstance': 'deleteInstance',
            'click #cancelBtsProperties': 'cancelEditProperties',

            'click .bts-instance': 'selectBtsInstance',
            'click .close-add-action': 'discardAddNew',

            'click #submitFields': 'submitFields',
            'click #updateFields': 'onClickUpdate',
            'click #cancelFields': 'cancelFieldsUpdate'
        },

        initialize: function () {
            var modelsData = [];
            this.dropdownComponents = [];
            this.appModel = new SingletonAppModel();
            this.settings = config.forSettings;
            this.access = Util.isInPrivilegedGroup();
            this.systems = this.appModel.get('configuration').externalSystem;
            _.each(this.systems, function (system) {
                return _.each(config.forSettings.btsList, function (btsItem) {
                    if (btsItem.name === system.systemType) {
                        modelsData.push(system);
                        return false;
                    }
                });
            });

            this.model = new BtsPropertiesModel(modelsData[0]);
            this.listenTo(this.model, 'change:fields', function () { config.trackingDispatcher.trackEventNumber(408); });
            this.systemAt = 0;
            this.render();
        },

        render: function () {
            var btsSwitcher;
            this.$el.html(Util.templates(this.wrapperTpl, {
                settings: this.settings,
                systemType: this.model.get('systemType'),
                access: this.access
            }));
            btsSwitcher = new DropDownComponent({
                data: _.map(this.settings.btsList, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('systemType')
            });
            $('[data-js-bts-switcher]', this.$el).html(btsSwitcher.$el);
            if (!this.access) {
                btsSwitcher.disabled();
            }
            this.listenTo(btsSwitcher, 'change', this.changeBts);
            this.dropdownComponents.push(btsSwitcher);

            this.$instanceHead = $('#instanceHead', this.$el);
            this.$instanceBoby = $('#instanceBody', this.$el);

            if (config.forSettings.btsList.length) {
                this.renderMultiSelector();
                this.renderInstance();
            } else {
                $('button', this.$el).prop({ disabled: 'disabled' });
                $('[data-js-no-bts-message]', this.$el).removeClass('hide');
            }

            return this;
        },

        renderMultiSelector: function () {
            var selectedSystemType;
            var systems;
            this.$instanceHead.empty();
            selectedSystemType = this.model.get('systemType');
            if (this.systemWithMultipleProjects(selectedSystemType)) {
                systems = (this.systems.length && selectedSystemType === this.systems[0].systemType)
                    ? this.systems
                    : [];
                this.$instanceHead.html(Util.templates(this.multiTpl, {
                    systems: systems,
                    index: this.systemAt,
                    access: this.access
                }));
                return true;
            }
            return false;
        },

        renderInstance: function () {
            var params = this.model.toJSON();
            var authTypeSelector;
            this.$instanceBoby.empty();
            params.access = this.access;
            params.settings = this.settings;
            params.projectType = this.model.isRally() ? 'projectId' : 'projectName';

            this.$instanceBoby.html(Util.templates(this.instanceTpl, params));

            authTypeSelector = new DropDownComponent({
                data: _.map(this.settings['bts' + this.model.get('systemType')].authorizationType, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('systemAuth')
            });
            $('li', authTypeSelector.$el).each(function (i, elem) {
                $(elem).attr('id', $('a', $(elem)).data('value'));
            });
            $('[data-js-dropdown]', authTypeSelector.$el).attr('id', 'systemAuth').attr('disabled', !this.access ? 'disabled' : '');
            $('[data-js-auth-type-selector]', this.$el).html(authTypeSelector.$el);
            this.listenTo(authTypeSelector, 'change', this.updateAuthType);
            this.dropdownComponents.push(authTypeSelector);

            this.setupAnchors();
            this.setAuthBlock(params);
            this.bindValidators();
            if (this.access) {
                this.setupValidityState();
            }
            this.renderFields();
        },

        validateForAuthenticationType: function () {
            if (Util.hasValidBtsSystem()) {
                this.model.set('systemAuth', this.settings['bts' + this.model.get('systemType')].authorizationType[0].value);
            }
        },

        systemWithMultipleProjects: function (system) {
            return (this.settings['bts' + system] && this.settings['bts' + system].multiple);
        },

        changeBts: function (val) {
            config.trackingDispatcher.trackEventNumber(398);
            this.validateBtsChange(val);
        },

        validateBtsChange: function (value) {
            var system = this.checkIfSystemDefined(value) ? this.systems[this.systemAt] : {
                systemType: value
            };
            this.model = new BtsPropertiesModel(system);
            this.validateForChangeBtsWarning();
            this.renderMultiSelector();
            this.renderInstance();
        },

        validateForChangeBtsWarning: function () {
            var action = this.systems.length && !this.model.get('id') ? 'show' : 'hide';
            this.$tbsChangeWarning[action]();
        },

        checkIfSystemDefined: function (val) {
            return _.any(this.systems, function (system) {
                return system.systemType === val;
            });
        },

        focusOnFields: function () {
            $('html, body').animate({
                scrollTop: this.$fieldsWrapper.offset().top
            }, 1000);
        },

        renderFields: function () {
            var self = this;
            if (this.model.get('id')) {
                if (self.model.get('fields').length) {
                    self.fieldsView && self.fieldsView.destroy();
                    self.fieldsView = new BtsFieldsView({
                        holder: self.$dynamicFieldsWrapper,
                        fields: self.model.get('fields'),
                        editable: true
                    }).render();
                    $('[data-js-bts-fields-wrapper]', this.$el).removeClass('edit-mode');
                    self.$fieldsWrapper.show();
                } else {
                    self.renderDefaultBtsFields();
                }
            }
        },
        onClickUpdate: function () {
            this.$fieldsWrapper.hide();
            this.renderDefaultBtsFields();
        },
        renderDefaultBtsFields: function () {
            var self = this;
            if (this.selectIssueType) {
                this.stopListening(this.selectIssueType);
                this.selectIssueType.destroy();
            }
            /*$('[data-js-issue-type-loader]', self.$el).show();*/
            this.fieldsView && this.fieldsView.destroy();
            /*Service.getBtsTypes(this.model.get('id')).done(function (types) {
                var defaultValue = types[0];
                var selectItem = _.find(self.model.get('fields'), {
                    id: 'issuetype'
                });
                if (selectItem) {
                    defaultValue = selectItem.value[0];
                }
                self.$fieldsWrapper.show();
                self.selectIssueType = new DropDownComponent({
                    data: _.map(types, function (type) {
                        return { name: type, value: type };
                    }),
                    defaultValue: defaultValue
                });
                $('[data-js-issue-type-select]', self.$el).html(self.selectIssueType.$el);
                self.listenTo(self.selectIssueType, 'change', self.loadDefaultBtsFields);
                self.loadDefaultBtsFields();
            }).always(function () {
                $('[data-js-issue-type-loader]', self.$el).hide();
            });*/
            this.selectIssueType = new DropDownComponent({
                data: [{
                    name: 'BUG', value: 'BUG'
                }],
                defaultValue: 'BUG'
            });
            $('[data-js-issue-type-select]', self.$el).html(self.selectIssueType.$el);
            self.loadDefaultBtsFields();


            /*$('[data-js-bts-fields-wrapper]', this.$el).addClass('edit-mode');*/
        },

        setupAnchors: function () {
            this.$tbsChangeWarning = $('#tbsChangeWarning', this.$el);
            this.$authDropDown = $('#systemAuth', this.$el);
            this.$authType = $('#authorizationType', this.$el);
            this.$fieldsLoader = $('#fieldsLoader', this.$el);

            this.$submitBlock = $('#submitPropertiesBlock', this.$el);
            this.$editBtn = $('#editBtsProperties', this.$el);
            this.$deleteBtn = $('#deleteInstance', this.$el);
            this.$cancelBtn = $('#cancelBtsProperties', this.$el);
            this.$propertiesWrapper = $('#propertiesWrapper', this.$el);
            this.$resetFieldsWarning = $('#resetFieldsWarning', this.$el);
            this.$externalSystemWarning = $('#externalError', this.$el);

            this.$fieldsWrapper = $('#fieldsWrapper', this.$el);
            this.$dynamicFieldsWrapper = $('#dynamicFields', this.$el);
            this.$fieldsControls = $('.fields-controls', this.$el);
            this.$updateFieldsBtn = $('#updateFields', this.$fieldsControls);
            this.$cancelFieldsBtn = $('#cancelFields', this.$fieldsControls);
        },

        discardAddNew: function (e) {
            e.preventDefault();
            $(e.currentTarget).closest('li').removeClass('activated').removeClass('active');
            $(e.currentTarget).closest('ul')
                .find('[data-index=' + this.systemAt + ']')
                .parent()
                .addClass('active');
            $(e.currentTarget).closest('ul').find('.bts-instance-action').removeClass('disabled');

            this.model = new BtsPropertiesModel(this.systems[this.systemAt]);
            this.renderInstance();
            e.stopPropagation();
        },

        selectBtsInstance: function (e) {
            var $tab;
            var $parent;
            var type;
            var url;
            e.preventDefault();
            $tab = $(e.currentTarget);
            $parent = $tab.parent();

            if ($parent.hasClass('active') || $parent.hasClass('disabled')) {
                return false;
            }

            if ($tab.hasClass('add-new')) {
                config.trackingDispatcher.trackEventNumber(400);
                $parent.closest('ul').find('.active').removeClass('active');
                $parent.addClass('disabled');
                $parent.closest('ul').find('.bts-name-new-project').addClass('active').addClass('activated');

                type = this.model.get('systemType');
                url = this.systems[0].url;

                this.model = new BtsPropertiesModel({
                    systemType: type,
                    url: url
                });
                this.renderInstance();
            } else {
                config.trackingDispatcher.trackEventNumber(399);
                this.systemAt = $tab.data('index');
                this.model = new BtsPropertiesModel(this.systems[this.systemAt]);
                this.renderMultiSelector();
                this.renderInstance();
            }
        },

        submitFields: function () {
            var result = [];
            var source = this.defaultFields ? this.defaultFields : this.model.get('fields');
            var field;
            config.trackingDispatcher.trackEventNumber(410);
            _.forEach(this.fieldsView.getDefaultValues(), function (val, key) {
                var value = val;
                field = _.find(source, {
                    id: key
                });
                if (field) {
                    if (field.fieldType === 'array') {
                        value = value.split(',');
                    } else {
                        value = [value];
                    }
                    field.value = value;
                    result.push(field);
                }
            });
            this.model.set('fields', result);
            this.saveProperties();
            this.systems[this.systemAt].fields = result;
        },

        loadDefaultBtsFields: function () {
            var self = this;
            config.trackingDispatcher.trackEventNumber(409);
            // this.$fieldsLoader.show();
            $('[data-js-issue-type-loader]', self.$el).show();
            this.fieldsView && this.fieldsView.destroy();
            this.fieldsView = new BtsFieldsView({
                holder: this.$dynamicFieldsWrapper,
                fields: [],
                editable: true
            });
            Service.getBtsFields(this.model.get('id'), this.selectIssueType.getValue())
                .done(function (data) {
                    self.$fieldsLoader.hide();

                    self.defaultFields = _.cloneDeep(data);
                    _.forEach(self.model.get('fields'), function (field) {
                        var item = _.find(data, {
                            id: field.id
                        });
                        if (item) {
                            if (item.id === 'issuetype') {
                                item.value = [self.selectIssueType.getValue()];
                            } else {
                                item.value = field.value;
                            }
                            item.checked = true;
                        }
                    });
                    self.fieldsView.update(data);

                    self.$updateFieldsBtn.hide();
                    $('[data-js-issue-type-loader]', self.$el).hide();
                    self.model.fieldsWereSelected() && self.$cancelFieldsBtn.show();

                    self.$fieldsWrapper.show();
                    self.$externalSystemWarning.hide();

                    self.focusOnFields();
                })
                .fail(function (error) {
                    self.handleBtsFailure(error);
                    self.$fieldsLoader.hide();
                });
        },

        cancelFieldsUpdate: function () {
            this.renderFields();
            this.$updateFieldsBtn.show();
            this.$cancelFieldsBtn.hide();
        },

        preventDefault: function (e) {
            e.preventDefault();
        },

        saveProperties: function () {
            if (this.model.isValid()) {
                config.trackingDispatcher.trackEventNumber(404);
                if (this.validateForSystemsClearance()) {
                    config.userModel.set('bts', null);
                    Service.clearExternalSystem()
                        .done(function () {
                            this.saveBts(true);
                        }.bind(this))
                        .fail(function () {
                            Util.ajaxSuccessMessenger('clearExternalSystem');
                        });
                } else {
                    this.saveBts();
                }
            } else {
                $('input:visible, textarea:visible', this.$propertiesWrapper).trigger('validate');
            }
        },

        saveBts: function (clear) {
            var self = this;
            var call;
            var externalSystemData;

            this.$fieldsLoader.show();

            if (clear) {
                while (this.systems.length) {
                    this.systems.pop();
                }
            }
            call = this.model.get('id') ? 'updateExternalSystem' : 'createExternalSystem';
            externalSystemData = this.model.getBtsSettings();
            if (this.checkIfLinkOrProjectNameChanged(externalSystemData)) {
                this.model.set('fields', []);
                externalSystemData.fields = [];
            }

            Service[call](externalSystemData)
                .done(function (response) {
                    self.setupValidityState();
                    self.$fieldsWrapper.show();
                    if (response.id) {
                        self.externalId = response.id;
                        self.updateCredentials(externalSystemData, response.id);
                        self.systems.push(externalSystemData);
                        self.systemAt = self.systems.length - 1;
                        self.renderMultiSelector();
                        externalSystemData.id = self.externalId;
                    } else {
                        _.merge(self.systems[self.systemAt], externalSystemData);
                        self.model.discardEdit();
                        externalSystemData.id = self.systems[self.systemAt].id;
                    }

                    self.appModel.setArr('externalSystem', self.systems);
                    self.renderInstance();
                    self.renderMultiSelector();
                    self.$tbsChangeWarning.hide();

                    if (call === 'updateExternalSystem') {
                        Util.addMessage({ clazz: 'success', message: response.msg });
                    }
                })
                .fail(function (error) {
                    self.handleBtsFailure(error);
                    self.$fieldsWrapper.hide();
                    self.$fieldsLoader.hide();
                })
                .always(function () {
                    self.model.get('fields').length && self.$fieldsLoader.hide();
                });
        },

        handleBtsFailure: function (error) {
            var response;
            var message = this.$externalSystemWarning.data('casual');

            try {
                response = JSON.parse(error.responseText); // expect JSON format
            } catch (e) {
                console.log(e);
            }
            if (response && response.message) {
                this.$externalSystemWarning.text(response.message).show();
                return;
            }
            if (error.status === 404) {
                message = 'Impossible interact with external system. External system with type JIRA is not deployed or not available';
            }

            if (error.status === 403) {
                message = Localization.failMessages.noPermissions;
            } else if (
                    error.responseText
                    && error.responseText.indexOf(this.settings.projectNotFoundPattern) !== -1
                ) {
                message = this.$externalSystemWarning.data('noproject').replace('%%%', this.model.get('project'));
            }
            if ((error.status === 400 || error.status === 409) && response.error_code === 4032) {
                message = response.message;
            }
            this.$externalSystemWarning.text(message).show();
        },

        updateCredentials: function (sys, id) {
            var system = sys;
            this.model.set('id', id);
            system.id = id;
            if (this.model.validForBasic()) {
                this.model.set('password', this.settings.defaultPassword);
                system.password = this.settings.defaultPassword;
            } else if (this.model.validForApiKey()) {
                system.accessKey = this.model.get('accessKey');
            }
        },

        validateForSystemsClearance: function () {
            return this.systems.length && this.model.get('systemType') !== this.systems[0].systemType;
        },

        deleteInstance: function () {
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteBts,
                bodyText: Util.replaceTemplate(Localization.dialog.deleteBts, this.model.get('systemType'), this.model.get('project')),
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
                confirmFunction: function () {
                    config.trackingDispatcher.trackEventNumber(407);
                    return Service.deleteExternalSystem(self.model.get('id'))
                        .done(function () {
                            var type;
                            self.systems.splice(self.systemAt, 1);
                            if (self.systems.length) {
                                self.model = new BtsPropertiesModel(self.systems[0]);
                            } else {
                                type = self.model.get('systemType');
                                self.model = new BtsPropertiesModel({
                                    systemType: type
                                });
                            }
                            if (self.systems.length > 0) {
                                self.appModel.setArr('externalSystem', [self.systems[0]]);
                            } else {
                                self.appModel.setArr('externalSystem', []);
                            }
                            self.systemAt = 0;
                            self.renderMultiSelector();
                            self.renderInstance();
                            self.setPristineBTSForm();
                            Util.ajaxSuccessMessenger('deleteBts');
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, 'deleteBts');
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

        setPristineBTSForm: function () {
            var defaultParam = config.forSettings.btsList[0].value;
            $('#btsSettings').find('#systemType').find('.select-value').text(defaultParam);
            this.renderMultiSelector();
            this.renderInstance();
        },

        checkIfLinkOrProjectNameChanged: function (system) {
            var current = _.find(this.systems, {
                id: system.id
            });
            return current && (current.url !== system.url || current.project !== system.project);
        },

        editProperties: function () {
            config.trackingDispatcher.trackEventNumber(401);
            this.model.setupEdit();
            this.setupValidityState();
            this.$cancelBtn.show();
        },

        cancelEditProperties: function () {
            var model = this.model.get('modelCache');
            var self = this;
            var type;
            config.trackingDispatcher.trackEventNumber(403);
            _.forEach(model.restorable, function (id) {
                $('#' + id, self.$propertiesWrapper).val(model[id]);
            });
            type = $('#' + model.systemAuth, this.$propertiesWrapper);
            type.closest('.dropdown-menu').find('.active').removeClass('active');
            type.addClass('active');
            $('#systemAuth', this.$el).find('.select-value').text(type.text());

            this.setAuthBlock(model);
            $('.has-error', this.$propertiesWrapper).removeClass('has-error');

            this.model.cancelEdit();
            this.$resetFieldsWarning.hide();
            this.setupValidityState();

            if (this.$externalSystemWarning.is(':visible')) {
                this.$externalSystemWarning.hide();
                this.$fieldsWrapper.show();
            }
        },

        updateModel: function (e) {
            var $el = $(e.currentTarget);
            var value = $el.val().trim();
            var id = $el.attr('id');
            var pass;
            if (value !== this.model.get(id)) {
                (id !== 'password') && $el.trigger('validate');
                value = $el.data('valid') ? value : '';
                if (this.model.isEdit() && this.checkIfCanResetFields(id)) {
                    this.model.fieldsWereSelected() && this.$resetFieldsWarning.show();
                    $('#username, #password, #accessKey', this.$el).val('');
                    this.model.set({
                        username: '',
                        password: '',
                        accessKey: ''
                    });
                }
                if (id === 'username') {
                    pass = $('#password', this.$propertiesWrapper);
                    if (pass.val() === this.settings.defaultPassword) {
                        pass.val('');
                        this.model.set('password', '');
                    }
                }
                this.model.set(id, value);
            }
        },

        bindValidators: function () {
            Util.bootValidator($('#url', this.$propertiesWrapper), [
                {
                    validator: 'required',
                    type: 'btsLink'
                },
                {
                    validator: 'matchRegex',
                    type: 'btsLinkRegex',
                    pattern: '(http|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?',
                    arg: 'i'
                }
            ]);
            Util.bootValidator($('#project', this.$propertiesWrapper), {
                validator: 'minMaxRequired',
                type: 'projectName',
                min: 1,
                max: 55
            });
            if (this.model.isRally()) {
                Util.bootValidator($('#accessKey', this.$propertiesWrapper), {
                    validator: 'required',
                    type: 'accessKey'
                });
            }
        },

        setupValidityState: function () {
            if (this.model.isValid() && !this.model.isEdit()) {
                this.$submitBlock.hide();
                this.$editBtn.show();
                this.$deleteBtn.show();
                $('input, textarea', this.$propertiesWrapper).prop('disabled', true);
                this.$authDropDown.prop('disabled', true);
            } else {
                this.$submitBlock.show();
                this.$editBtn.hide();
                this.$deleteBtn.hide();
                $('input, textarea', this.$propertiesWrapper).prop('disabled', false);
                this.$authDropDown.prop('disabled', false);
            }
        },

        setAuthBlock: function (args) {
            var data = args;
            data.access = this.access;
            data.hasPassword = !!this.model.get('id');
            data.defaultPassword = this.settings.defaultPassword;
            this.$authType.html(Util.templates(this.authTpl, data));
            if (this.model.validForBasic()) {
                Util.bootValidator($('#username', this.$propertiesWrapper), {
                    validator: 'required'
                });

                Util.bootValidator($('#password', this.$propertiesWrapper), {
                    validator: 'required'
                });
                if (this.model.isTFS()) {
                    Util.bootValidator($('#domain', this.$propertiesWrapper), {
                        validator: 'minMaxRequired',
                        type: 'tfsDomain',
                        min: 1,
                        max: 255
                    });
                }
            } else if (this.model.validForApiKey()) {
                Util.bootValidator($('#accessKey', this.$propertiesWrapper), {
                    validator: 'minMaxRequired',
                    type: 'apiKey',
                    min: 4,
                    max: 128
                });
            } else {
                Util.bootValidator($('#accessKey', this.$propertiesWrapper), {
                    validator: 'required'
                });
            }
        },

        updateAuthType: function (val) {
            this.model.set('systemAuth', val);
            this.setAuthBlock();
        },

        checkIfCanResetFields: function (id) {
            return id === 'url' || id === 'project';
        },

        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
            if (this.defaultFields) {
                this.defaultFields = null;
            }
            this.fieldsView && this.fieldsView.destroy();
        }
    });

    return BtsTabView;
});
