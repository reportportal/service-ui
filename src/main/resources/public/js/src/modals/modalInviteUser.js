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

    require('validate');

    var config = App.getInstance();

    var ModalInviteUser = ModalView.extend({
        template: 'tpl-modal-invite-user',
        className: 'modal-invite-user',
        events: {
            'click [data-js-load]': 'onClickInvite',
            'click [data-js-ok]': 'onClickOk',
            'click [data-js-select-role-dropdown] a': 'selectRole'
        },
        bindings: {
            '[data-js-user]': 'value: user',
            '[data-js-user-project-role]': 'value: projectRole'
        },
        initialize: function(option) {
            this.appModel = new SingletonAppModel();
            this.model = new Epoxy.Model({
                user: '',
                default_project: this.appModel.get('projectId'),
                projectRole: config.defaultProjectRole
            });
            this.render();
        },
        onClickInvite: function() {
            if(this.$form.valid()) {
                this.inviteUser();
            }
        },
        onClickOk: function(){
            this.successClose();
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
            this.$form = $('[data-js-invite-user-form]', this.$el);
            this.$inviteBtn = $('[ data-js-load]', this.$el);
            this.$okBtn = $('[ data-js-ok]', this.$el);
            this.$cancelBtn = $('[data-js-cancel]', this.$el);
            this.$successFrom = $('[data-js-success-from]', this.$el);
        },
        setupValidation: function () {
            var self = this;
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = this.$form.validate({
                errorClass: 'has-error',
                label: $('[data-js-invite-user-form-group]'),
                rules: {
                    user: {
                        required: true
                    }
                },
                messages: {
                    user: {
                        required: Localization.validation.requiredDefault
                    }
                },
                ignore: 'input[id^="s2id"]',
                errorPlacement: function (error, element) {
                    error.appendTo($('[data-js-invite-user-form-error]', element.closest('[data-js-invite-user-form-group]')));
                },
                highlight: function (element, errorClass) {
                    console.log($(element).closest('[data-js-invite-user-form-group]'));
                    $(element).closest('[data-js-invite-user-form-group]').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('[data-js-invite-user-form-group]').removeClass(errorClass);
                }
            });
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
        getUserData: function(){
            var user = this.model.toJSON();

            return {
                default_project: user.default_project,
                email: user.user,
                projectRole: user.projectRole
            }
        },
        inviteUser: function (type) {
            var userData = this.getUserData();
            console.log('inviteUser: ', userData);
            this.showSuccess();
            return;
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
        },
        showSuccess: function(){
            this.$inviteBtn.addClass('hide');
            this.$cancelBtn.addClass('hide');
            this.$okBtn.removeClass('hide');
            this.$form.addClass('hide');
            this.$successFrom.removeClass('hide');
        }
    });

    return ModalInviteUser;
});