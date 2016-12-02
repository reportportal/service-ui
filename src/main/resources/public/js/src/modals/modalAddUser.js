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
define(function (require, exports, module) {
    'use strict';

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var MembersService = require('projectMembers/MembersService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var urls = require('dataUrlResolver');
    var Localization = require('localization');
    var MembersModel = require('projectMembers/MembersModel');

    require('validate');

    var config = App.getInstance();

    var ModalAddUser = ModalView.extend({
        template: 'tpl-modal-add-user',
        className: 'modal-add-user',
        events: {
            'click [data-js-load]': 'onClickLoad',
            'click [data-js-generate-password]': 'generatePassword',
            'click [data-js-select-role-dropdown] a': 'selectRole'
        },
        bindings: {
            '[data-js-user-login]': 'value: userId',
            '[data-js-user-password]': 'value: password',
            '[data-js-user-email]': 'value: email',
            '[data-js-user-full-name]': 'value: full_name',
            '[data-js-user-project-role]': 'value: projectRole'
        },
        initialize: function(option) {
            this.appModel = new SingletonAppModel();
            this.model = new Epoxy.Model({
                userId: '',
                password: '',
                email: '',
                full_name: '',
                accountRole: 'USER',
                default_project: this.appModel.get('projectId'),
                projectRole: config.defaultProjectRole
            });
            this.render();
        },
        onClickLoad: function() {
            if(this.$form.valid()) {
                this.addUser();
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                roles: Util.getRolesMap(),
                defaultProjectRole: config.defaultProjectRole,
            }));
            this.setupAnchors();
            this.setupValidation();
        },
        setupAnchors: function(){
            this.$password = $('[data-js-user-password]', this.$el);
            this.$form = $('[data-js-add-user-form]', this.$el);
        },
        setupValidation: function () {
            var self = this;
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = this.$form.validate({
                errorClass: 'has-error',
                label: $('[data-js-add-user-form-group]'),
                rules: {
                    username: {
                        required: true,
                        rangelength: config.forms.nameRange,
                        remote: this.remoteValidation(),
                        symbols: config.patterns.symbolsLogin
                    },
                    fullName: {
                        required: true,
                        rangelength: config.forms.fullNameRange,
                        symbols: config.patterns.symbolsFullName
                    },
                    email: {
                        required: true,
                        email: true,
                        remote: this.remoteValidation()
                    },
                    password: {
                        required: true,
                        rangelength: config.forms.passwordRange
                    }
                },
                messages: {
                    username: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.loginSize,
                        remote: Localization.validation.registeredLogin,
                        symbols: Localization.validation.projectNameRegex
                    },
                    fullName: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.fullNameSize,
                        symbols: Localization.validation.fullNameRegex
                    },
                    email: {
                        required: Localization.validation.requiredDefault,
                        email: Localization.validation.incorrectEmail,
                        remote: Localization.validation.registeredEmail
                    },
                    password: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.passwordSize
                    }
                },
                ignore: 'input[id^="s2id"]',
                errorPlacement: function (error, element) {
                    error.appendTo($('[data-js-add-user-form-error]', element.closest('[data-js-add-user-form-group]')));
                },
                highlight: function (element, errorClass) {
                    console.log($(element).closest('[data-js-add-user-form-group]'));
                    $(element).closest('[data-js-add-user-form-group]').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('[data-js-add-user-form-group]').removeClass(errorClass);
                }
            });
        },
        remoteValidation: function () {
            return {
                type: "GET",
                url: urls.userInfoValidation(),
                data: {},
                dataFilter: function (response) {
                    var data = JSON.parse(response);
                    return !data.is;
                }
            }
        },
        selectRole: function (e) {
            e.preventDefault();
            var link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text();

            if (link.hasClass('disabled-option')) return;
            btn.attr('value', val);
            $('.select-value', btn).text(link.text());
        },
        generatePassword: function (e) {
            e.preventDefault();
            if (!$(e.target).hasClass('disabled')) {
                var pass = this.randomPassword();
                this.$password.val(pass);
                this.$password.valid && _.isFunction(this.$password.valid) && this.$password.valid();
                this.model.set('password', pass);
            }
        },
        randomPassword: function () {
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
                passSize = 6,
                pass = '';
            for (var i = 0, n = chars.length; i < passSize; ++i) {
                pass += chars.charAt(Math.floor(Math.random() * n));
            }
            return pass;
        },
        getUserData: function(){
            var user = this.model.toJSON();
            return {
                default_project: user.default_project,
                login: user.userId,
                email: user.email,
                projectRole: user.projectRole,
                accountRole: user.accountRole,
                full_name: user.full_name,
                password: user.password
            }
        },
        addUser: function (type) {
            var userData = this.getUserData();
            if (userData) {
                MembersService.addMember(userData)
                    .done(function (data) {
                        this.trigger('add:user');
                        this.successClose();
                        Util.ajaxSuccessMessenger(type);
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, type);
                    });
            }
        }
    });

    return ModalAddUser;
});