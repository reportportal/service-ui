/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var MembersService = require('projectMembers/MembersService');
    var AdminService = require('adminService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var DropDownComponent = require('components/DropDownComponent');
    var Localization = require('localization');

    var config = App.getInstance();

    var ModalAddUser = ModalView.extend({
        template: 'tpl-modal-add-user',
        className: 'modal-add-user',
        events: {
            'click [data-js-load]': 'onClickLoad',
            'click [data-js-generate-password]': 'generatePassword',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-add-user]': 'blockModal'
        },
        blockModal: function(){
            this.disableHideBackdrop();
        },
        bindings: {
            '[data-js-user-login]': 'value: userId',
            '[data-js-user-password]': 'value: password',
            '[data-js-user-email]': 'value: email',
            '[data-js-user-full-name]': 'value: full_name',
            '[data-js-user-project]': 'value: default_project'
        },
        initialize: function (options) {
            this.type = options.type;
            this.appModel = new SingletonAppModel();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    userId: '',
                    password: '',
                    email: '',
                    full_name: '',
                    accountRole: config.defaultAccountRole,
                    default_project: '',
                    projectRole: config.defaultProjectRole
                }
            }))();
            this.render();
        },
        onClickLoad: function () {
            if (this.validate()) {
                this.addUser();
            }
        },
        onKeySuccess: function () {
            $('[data-js-load]', this.$el).focus();
            if (this.validate()) {
                this.addUser();
            }
        },
        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.add,
                    btnClass: 'rp-btn-submit',
                    label: 'data-js-load'
                }
            ];
            this.$el.html(Util.templates(this.template, {
                isUsers: this.isUsers(),
                footerButtons: footerButtons
            }));
            this.setupAnchors();
            this.setupDropDowns();
            this.bindValidators();
            if (this.isUsers()) {
                this.setupProjectSearch();
            }
        },
        isUsers: function () {
            return this.type === 'users';
        },
        setupAnchors: function () {
            this.$login = $('[data-js-user-login]', this.$el);
            this.$fullName = $('[data-js-user-full-name]', this.$el);
            this.$email = $('[data-js-user-email]', this.$el);
            this.$password = $('[data-js-user-password]', this.$el);
            this.$selectProject = $('[data-js-user-project]', this.$el);
        },
        setupDropDowns: function () {
            this.selectProjectRole = new DropDownComponent({
                data: _.map(config.projectRolesEnum, function (val) {
                    return { name: val, value: val };
                }),
                multiple: false,
                defaultValue: this.model.get('projectRole')
            });
            $('[data-js-project-role-dropdown]', this.$el).html(this.selectProjectRole.$el);
            this.listenTo(this.selectProjectRole, 'change', this.onChangeProjectRole);
            this.selectAccoutRole = new DropDownComponent({
                data: _.map(config.accountRolesEnum, function (val) {
                    return { name: val, value: val };
                }),
                multiple: false,
                defaultValue: this.model.get('accountRole')
            });
            $('[data-js-accout-role-dropdown]', this.$el).html(this.selectAccoutRole.$el);
            this.listenTo(this.selectAccoutRole, 'change', this.onChangeAccountRole);
        },
        onChangeProjectRole: function (val) {
            this.model.set('projectRole', val);
            this.disableHideBackdrop();
        },
        onChangeAccountRole: function (val) {
            var role = val === config.accountRolesEnum.administrator
                ? config.projectRolesEnum.project_manager
                : config.defaultProjectRole;
            this.model.set('accountRole', val);
            this.updateProjectRole(role);
            this.disableHideBackdrop();
        },
        updateProjectRole: function (role) {
            this.model.set('projectRole', role);
            this.selectProjectRole.activateItem(role);
        },
        bindValidators: function () {
            Util.hintValidator(this.$login, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'loginRegex',
                    pattern: config.patterns.login
                },
                {
                    validator: 'minMaxRequired',
                    type: 'loginRange',
                    min: config.forms.nameRange[0],
                    max: config.forms.nameRange[1]
                },
                {
                    validator: 'remoteLogin',
                    remote: true,
                    message: Localization.validation.registeredLogin,
                    type: 'remoteLogin'
                }
            ]);
            Util.hintValidator(this.$fullName, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'fullNameInfoRegex',
                    pattern: config.patterns.fullName
                },
                {
                    validator: 'minMaxRequired',
                    type: 'userName',
                    min: config.forms.fullNameRange[0],
                    max: config.forms.fullNameRange[1]
                }
            ]);
            Util.hintValidator(this.$email, [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    pattern: config.patterns.email
                },
                {
                    validator: 'remoteEmail',
                    remote: true,
                    message: Localization.validation.registeredEmail,
                    type: 'remoteEmail'
                }
            ]);
            Util.hintValidator(this.$password, [
                {
                    validator: 'required'
                },
                {
                    validator: 'minMaxRequired',
                    type: 'password',
                    min: config.forms.passwordRange[0],
                    max: config.forms.passwordRange[1]
                }
            ]);
        },
        setupProjectSearch: function () {
            var self = this;
            Util.setupSelect2WhithScroll(this.$selectProject, {
                multiple: false,
                min: config.forms.projectNameRange[0],
                minimumInputLength: config.forms.projectNameRange[0],
                maximumInputLength: config.forms.projectNameRange[1],
                placeholder: Localization.admin.enterProjectName,
                allowClear: true,
                initSelection: function (element, callback) {
                    callback({ id: element.val(), text: element.val() });
                },
                query: function (query) {
                    AdminService.getProjects(self.getSearchQuery(query.term))
                        .done(function (response) {
                            var data = { results: [] };
                            _.each(response.content, function (item) {
                                if (item.projectId !== self.model.get('default_project')) {
                                    data.results.push({
                                        id: item.projectId,
                                        text: item.projectId
                                    });
                                }
                            });
                            query.callback(data);
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error);
                        });
                }
            });
            Util.hintValidator(this.$selectProject, [
                {
                    validator: 'required'
                }
            ]);
            this.$selectProject.on('change', function () {
                this.$selectProject.trigger('validate');
                this.disableHideBackdrop();
            }.bind(this));
        },
        getSearchQuery: function (query) {
            return '?page.sort=name,asc&page.page=1&page.size=10&&filter.cnt.name=' + query;
        },
        generatePassword: function (e) {
            var pass;
            e.preventDefault();
            if (!$(e.target).hasClass('disabled')) {
                config.trackingDispatcher.trackEventNumber(480);
                pass = this.randomPassword();
                this.$password.val(pass);
                this.$password.trigger('validate');
                this.model.set('password', pass);
            }
            this.disableHideBackdrop();
        },
        validate: function () {
            var els = [
                this.$login, this.$fullName, this.$email, this.$password, this.$selectProject
            ];
            // TODO not use validate remote true
            if (!this.$login.data('validate-error') || !this.$email.data('validate-error')) {
                return false;
            }
            $('input', this.$el).trigger('validate');
            return !_.any(els, function (el) { return el.data('validate-error'); });
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(478);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(479);
        },
        randomPassword: function () {
            var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
            var passSize = 6;
            var pass = '';
            var i;
            var n;
            for (i = 0, n = chars.length; i < passSize; ++i) {
                pass += chars.charAt(Math.floor(Math.random() * n));
            }
            return pass;
        },
        getUserData: function () {
            var user = this.model.toJSON();
            return {
                default_project: this.isUsers() ? user.default_project : this.appModel.get('projectId'),
                login: user.userId,
                email: user.email,
                projectRole: user.projectRole,
                accountRole: this.isUsers() ? user.accountRole : config.defaultAccountRole,
                full_name: user.full_name,
                password: user.password
            };
        },
        addUser: function () {
            var userData = this.getUserData();
            this.showLoading();
            if (userData) {
                config.trackingDispatcher.trackEventNumber(481);
                MembersService.addMember(userData)
                    .done(function (data) {
                        var messages;
                        if (data.warning) {
                            messages = Localization.failMessages;
                            if (data.warning.indexOf(messages.serverNotConfigured) >= 0) {
                                Util.ajaxSuccessMessenger('addUserWithoutEmail');
                            } else {
                                Util.ajaxFailMessenger(null, 'addMember', data.warning);
                            }
                        } else {
                            Util.ajaxSuccessMessenger('addMember');
                        }
                        this.trigger('add:user');
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'addMember');
                    })
                    .always(function () {
                        this.successClose();
                    }.bind(this));
            }
        }
    });

    return ModalAddUser;
});
