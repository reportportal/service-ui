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

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var MembersService = require('projectMembers/MembersService');
    var AdminService = require('adminService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');
    var UserSearchComponent = require('components/UserSearchComponent');

    require('validate');

    var config = App.getInstance();

    var ModalInviteUser = ModalView.extend({
        template: 'tpl-modal-invite-user',
        className: 'modal-invite-user',
        events: {
            'click [data-js-load]': 'onClickInvite',
            'click [data-js-ok]': 'onClickOk',
            'click [data-js-select-role-dropdown] a': 'selectRole',
            'focus [data-js-invite-link]': 'selectLink',
            'click [data-js-copy-link]': 'copyLink'
        },
        bindings: {
            '[data-js-user]': 'value: user',
            '[data-js-user-project]': 'value: default_project',
            '[data-js-user-project-role-text]': 'text: getProjectRole'
        },
        computeds: {
            getProjectRole: {
                deps: ['projectRole'],
                get: function(projectRole) {
                    var roles = Util.getRolesMap();
                    return roles[projectRole];
                }
            }
        },
        initialize: function(options) {
            this.type = options.type;
            this.appModel = new SingletonAppModel();
            this.model = new Epoxy.Model({
                user: '',
                default_project: '',
                projectRole: config.defaultProjectRole
            });
            this.render();
        },
        onKeySuccess: function() {
            $('[data-js-load]', this.$el).trigger('click');
        },
        onClickInvite: function() {
            if(this.$form.valid()) {
                if(Util.validateEmail(this.model.get('user'))){
                    this.inviteUser();
                }
                else {
                    this.assignUser();
                }
            }
        },
        onClickOk: function(){
            this.successClose();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                roles: Util.getRolesMap(),
                canSelectRole: this.canSelectRole.bind(this),
                isUsers: this.isUsers()
            }));
            this.setupAnchors();
            this.setupValidation();
            this.setupUserSearch();
            this.setupProjectSearch();
        },
        isUsers: function(){
            return this.type == 'users';
        },
        canSelectRole: function(role){
            var user = config.userModel,
                userRole = user.getRoleForCurrentProject(),
                userRoleIndex = _.indexOf(config.projectRoles, userRole),
                roleIndex = _.indexOf(config.projectRoles, role),
                isAdmin = user.get('isAdmin');
            return isAdmin || (user.hasPermissions() && userRoleIndex >= roleIndex);
        },
        setupAnchors: function(){
            this.$form = $('[data-js-invite-user-form]', this.$el);
            this.$inviteBtn = $('[ data-js-load]', this.$el);
            this.$okBtn = $('[ data-js-ok]', this.$el);
            this.$cancelBtn = $('[data-js-cancel]', this.$el);
            this.$successFrom = $('[data-js-success-from]', this.$el);
            this.$usersField = $('[data-js-user]', this.$el);
            this.$inviteLink = $('[data-js-invite-link]', this.$el);
            this.$selectProject = $('[data-js-user-project]', this.$el);
        },
        setupUserSearch:function() {
            var self = this;
            if(!this.isUsers()) {
                UserSearchComponent.setupUserSearch(self.$usersField);
                self.$usersField.on('change', function () {
                    self.$usersField.valid && _.isFunction(self.$usersField.valid) && self.$usersField.valid();
                });
            }
            else {
                self.$usersField.addClass('rp-input-default rp-width-100 form-control');
                self.$usersField.rules('add', {
                    email: true,
                    remote: this.remoteValidation(),
                    messages: {
                        email: Localization.validation.incorrectEmail,
                        remote: Localization.validation.registeredEmail
                    }
                });
            }
        },
        remoteValidation: function () {
            return {
                type: "GET",
                url:
                    Urls.userInfoValidation(),
                data: {},
                dataFilter: function (response) {
                    var data = JSON.parse(response);
                    return !data.is;
                }
            }
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
                    $(element).closest('[data-js-invite-user-form-group]').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('[data-js-invite-user-form-group]').removeClass(errorClass);
                }
            });
            if(this.isUsers()){
                this.addProjectValidation();
            }
        },
        addProjectValidation: function () {
            this.$selectProject.rules('add', {
                required: true,
                messages: {
                    required: Localization.validation.requiredDefault
                }
            });
            this.$selectProject.on('change', function () {
                this.$selectProject.valid && _.isFunction(this.$selectProject.valid) && this.$selectProject.valid();
            }.bind(this));
        },
        selectRole: function (e) {
            e.preventDefault();
            var link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text();

            if (link.hasClass('disabled-option')) return;
            this.model.set('projectRole', val);
        },
        setupProjectSearch:function() {
            var self = this;
            Util.setupSelect2WhithScroll(this.$selectProject, {
                multiple: false,
                min: config.forms.projectNameRange[0],
                minimumInputLength: config.forms.projectNameRange[0],
                maximumInputLength: config.forms.projectNameRange[1],
                placeholder: Localization.admin.enterProjectName,
                allowClear: true,
                initSelection: function (element, callback) {
                    callback({id: element.val(), text: element.val()});
                },
                query: function (query) {
                    AdminService.getProjects(self.getSearchQuery(query.term))
                        .done(function (response) {
                            var data = {results: []}
                            _.each(response.content, function (item) {
                                if(item.projectId !== self.model.get('default_project')) {
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
        },
        getSearchQuery: function(query){
            return '?page.sort=name,asc&page.page=1&page.size='+ config.autocompletePageSize +'&filter.cnt.name=' + query;
        },
        selectLink: function(e){
            e.preventDefault();
            $(e.currentTarget).select();
        },
        copyLink: function(e){
            e.preventDefault();
            this.$inviteLink.select();
            try {
                document.execCommand('copy');
            } catch (err) {}
        },
        getUserData: function(){
            var user = this.model.toJSON();
            return {
                default_project: this.isUsers() ? user.default_project : this.appModel.get('projectId'),
                email: user.user,
                role: user.projectRole
            }
        },
        assignUser: function(){
            var userData = this.getUserData();
            if (userData) {
                var data = {};
                data[userData.email] = userData.role;
                this.showLoading();
                MembersService.assignMember(data, userData.default_project)
                    .done(function () {
                        Util.ajaxSuccessMessenger("assignMember", userData.email);
                        this.trigger('add:user');
                        this.successClose();
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "assignMember");
                    })
                    .always(function(){
                        this.hideLoading();
                    }.bind(this));
            }
        },
        inviteUser: function () {
            var userData = this.getUserData();
            if (userData) {
                this.showLoading();
                MembersService.inviteMember(userData)
                    .done(function (data) {
                        this.showSuccess(data);
                        Util.ajaxSuccessMessenger('inviteMember');
                    }.bind(this))
                    .fail(function (responce) {
                        var messages = Localization.failMessages,
                            error;
                        if (responce) {
                            try {
                                error = JSON.parse(responce.responseText);
                            } catch (e) {}
                        }
                        if(error && (error.error_code == 40305 || error.message.indexOf(messages.serverNotConfigured) >=0)){
                            Util.ajaxFailMessenger(null, 'inviteMember', messages.impossibleInvite);
                        }
                        else {
                            Util.ajaxFailMessenger(responce, 'inviteMember');
                        }
                    })
                    .always(function(){
                        this.hideLoading();
                    }.bind(this));
            }
        },
        showSuccess: function(data){
            this.$inviteLink.val(data.backLink);
            this.$inviteBtn.addClass('hide');
            this.$cancelBtn.addClass('hide');
            this.$okBtn.removeClass('hide');
            this.$form.addClass('hide');
            this.$successFrom.removeClass('hide');
            $('[data-js-email]', this.$successFrom).text(this.model.get('user'));
        }
    });

    return ModalInviteUser;
});
