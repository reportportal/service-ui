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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Components = require('components');
    var urls = require('dataUrlResolver');
    var App = require('app');
    var Localization = require('localization');
    var Service = require('memberService');
    var Scrollable = require('scrollable');
    var SingletonAppModel = require('model/SingletonAppModel');

    require('validate');

    var config = App.getInstance();

    var ContentView = Backbone.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.vent = _.extend({}, Backbone.Events);
            this.subContext = options.subContext;
            this.$el = this.context.getMainView().$body;
        },
        render: function () {
            this.header = new Header({action: this.subContext, holder: this.context.getMainView().$header}).render();
            $("#headerBar").append(Util.templates(this.permissionsMapTpl, {
                btnVisible: {
                    btnPermissionMap: true,
                    btnProjectSettings: false,
                    btnProjectMembers: false
                }
            }));

            $("#headerBar [data-js-show-permissions-map]").click(this.onClickShowPermissionsMap);

            this.$el.html(Util.templates(this.membersNavigationTpl, {
                canManage: Util.canManageMembers(),
                query: this.subContext,
                hideAddBlock: true,
                projectId: config.project.projectId
            }));

            this.$assignedMembers = $("#assignedMembers", this.$el);
            this.$inviteMember = $("#inviteMember", this.$el);
            this.$assignMember = $("#assignMember", this.$el);

            this.renderPageView();
            return this;
        },
        permissionsMapTpl: 'tpl-permissions-map',
        membersNavigationTpl: 'tpl-members-navigation',
        events: {
            'click .tab': 'updateRoute',
            'click [data-js-show-permissions-map]': 'onClickShowPermissionsMap'
        },
        onClickShowPermissionsMap: function(e) {
            e.preventDefault();
            Util.getDialog({name: 'tpl-permissions-map-modal'})
                .modal('show');
        },
        updateRoute: function (e) {
            var el = $(e.currentTarget);
            var query = el.data('query');
            //url = urls.getMembersTab(query);
            if (el.parent().hasClass('active')) {
                return;
            }
            config.router.navigate(el.attr('href'), {silent: true});

            this.subContext = query;
            this.header.update(query);

            this.renderPageView();
        },
        renderPageView: function () {
            var pageView = this.getViewForPage();
            var data = this.getMembersDataObject();
            this.body && this.body.destroy();
            this.body = new pageView(data).render();
        },
        getMembersDataObject: function () {
            var data = {
                container: this.membersTab,
                // isDefaultProject: config.project.projectId === config.demoProjectName
            };
            if (this.subContext !== "invite") {
                data.projectId = config.project.projectId;
                data.user = config.userModel.toJSON();
                data.roles = config.projectRoles;
                data.memberAction = this.subContext === 'assign' ? 'assignMember' : 'unAssignMember';
                var currentUserRoleIndex = _.indexOf(config.projectRoles, config.userModel.get('projects')[config.project.projectId].projectRole);
                data.projectRoleIndex = Util.isAdmin(config.userModel.toJSON()) ? config.projectRoles.length + 1 : currentUserRoleIndex;
            }
            return data;
        },
        getViewForPage: function () {
            this.membersTab = null;
            switch (this.subContext) {
                case "invite":
                    this.membersTab = this.$inviteMember;
                    return MembersInvite;
                    break;
                case "assign":
                    this.membersTab = this.$assignMember;
                    return MembersViewAssign;
                    break;
                default:
                    this.membersTab = this.$assignedMembers;
                    return MembersView;
                    break;
            }
        },
        destroy: function () {
            this.header && this.header.destroy();
            this.body && this.body.destroy();
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    var Header = Components.BaseView.extend({
        tpl: 'tpl-members-header',
        initialize: function (options) {
            this.$el = options.holder;
            this.defaultAction = "assigned";
            this.action = options.action;
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl, {}));

            this.update(this.action);
            return this;
        },
        update: function (action) {
            $('.title-holder', this.$el).not(':first').hide();
            var selector = action || this.defaultAction;
            $('#' + selector + 'Title', this.$el).show();
        }
    });

    var MembersForms = Components.BaseView.extend({
        initialize: function (options) {
            this.$container = options.container;
            this.validator = null;
            this.pageType = '';
            this.isDefaultProject = options.isDefaultProject;
        },
        render: function () {
            var project = config.project.projectId || config.userModel.get('defaultProject'),
                role = config.userModel.get('projects')[project] || {};

            this.$container.empty().append(this.$el.html(Util.templates(this.formTpl, {
                roles: this.getRoles(),
                defaultProjectRole: config.defaultProjectRole,
                isLead: role.projectRole == config.projectRolesEnum.lead,
                memberOption: config.projectRolesEnum.project_manager,
                isDefaultProject: this.isDefaultProject
            })));
            this.setupAnchors();
            this.setupValidation();
            return this;
        },
        events: {
            'click .dropdown-menu a': 'selectRole'
        },
        selectRole: function (e) {
            e.preventDefault();
            var link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text();

            if (link.hasClass('disabled-option')) return;
            this.toggleIfAdminSelected(val);
            btn.attr('data-value', val);
            btn.data('value', val);
            $('.select-value', btn).text(link.text());
        },
        toggleIfAdminSelected: function (val) {
            if (Util.isAdmin({userRole: val})) {
                $('.admin-privileges', this.$el).show();
                this.$selectRole.length && this.$selectRole.attr('disabled', 'disabled');
                this.$selectRole.length && this.$selectRole.data('value', config.projectRoles[1]) && $('.select-value', this.$selectRole).text(config.projectRoles[1]);
            } else {
                $('.admin-privileges', this.$el).hide();
                this.$selectRole.length && this.$selectRole.removeAttr('disabled', 'disabled');
            }
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
        resetForm: function (form) {
            $('#' + form + 'Form', this.$el)[0].reset();
            this.validator && this.validator.reset();
            var defRole = config.projectRoles[1],
                roleField = $('#project_role', this.$el);
            roleField.attr('data-value', defRole);
            roleField.data('value', defRole);
            $('.select-value', roleField).text(defRole);
        },
        getbackUrl: function () {
            var hash = window.location.hash,
                arr = _.initial(hash.split('/'));
            return arr.join('/');
        },
        onSubmit: function (type) {
            var data = this.getData(),
                self = this;
            if (data) {
                Service[type](data)
                    .done(function (data) {
                        if (_.isFunction(self.showSuccess)) {
                            self.showSuccess(data);
                        } else {
                            self.resetForm(type);
                        }
                        Util.ajaxSuccessMessenger(type);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, type);
                    });
            }
        },
        getRoles: function () {
            var roles = config.projectRoles,
                project = config.project.projectId || config.userModel.get('defaultProject'),
                role = config.userModel.get('projects')[project] || {},
                projectRole = '';

            if (!_.isEmpty(role)) {
                projectRole = role.projectRole;
            }

            if (Util.isInPrivilegedGroup()) {
                return roles;
            } else {
                var inx = _.indexOf(projectRole) || 2;
                return roles.slice(0, inx);
            }
        },
        setupValidation: function () {
        },

        getData: function () {
        },

        setupAnchors: function () {
            this.$selectRole = $('#projectRole', this.$el);
        },
        destroy: function() {
            Util.clearMessage();
        }
    });

    var MembersAdd = MembersForms.extend({
        formTpl: 'tpl-members-add',
        confirmTpl: 'tpl-members-email-modal',
        confirmModal: 'tpl-confirm-addmember',
        emailTpl: 'tpl-user-send-email',
        events: {
            'click #generate_password': 'generatePassword',
            'click #cancelForm': 'resetForm',
            'click .dropdown-menu a': 'selectRole'
        },
        setupValidation: function () {
            var self = this;
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = $("#addMemberForm").validate({
                errorClass: 'has-error',
                label: $('.rp-form-group'),
                rules: {
                    username: {
                        required: true,
                        rangelength: config.forms.nameRange,
                        remote: this.remoteValidation(),
                        symbols: /^[0-9a-zA-Z-_]+$/
                    },
                    fullName: {
                        required: true,
                        rangelength: config.forms.fullNameRange,
                        symbols: /^[0-9a-zA-Zа-яА-Я-_. ]+$/
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
                submitHandler: function (form) {
                    self.onSubmit('addMember');
                },
                errorPlacement: function (error, element) {
                    error.appendTo($('.help-inline', element.closest('.rp-form-group')));
                },
                highlight: function (element, errorClass) {
                    $(element).closest('.rp-form-group').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('.rp-form-group').removeClass(errorClass);
                }
            });
        },
        setupAnchors: function () {
            MembersForms.prototype.setupAnchors.call(this);
            this.$addButton = $('#addUserButton', this.$el);
            this.$cancelButton = $('#cancelForm', this.$el);
            this.$success = $('#success-message', this.$el);
            this.$elements = $('.form-control, button.dropdown-toggle, #generate_password, .select2-control', this.$el);
            this.$password = $('#password', this.$el);
            this.$login = $('#username', this.$el);
        },
        showSuccess: function () {
            this.$addButton.attr('disabled', 'disabled').hide();
            this.$success.show();
            this.$cancelButton.removeAttr('disabled').show();
            _.each(this.$elements, function (o) {
                var el = $(o);
                if (el.is('a')) {
                    el.addClass('disabled');
                }
                else {
                    el.attr('disabled', 'disabled').prop('disabled', 'disabled');
                }
            });
        },
        resetForm: function (e) {
            e && e.preventDefault();
            MembersForms.prototype.resetForm.call(this, 'addMember');
            this.$addButton.removeAttr('disabled', 'disabled').show();
            this.$success.hide();
            this.$cancelButton.attr('disabled', 'disabled').hide();
            _.each(this.$elements, function (o) {
                var el = $(o);
                if (el.is('a')) {
                    el.removeClass('disabled');
                }
                else if(el.is('button.dropdown-toggle')) {
                    el.removeAttr('disabled').removeProp('disabled');
                    $('.admin-privileges', el.closest('.rp-form-group')).hide();
                    var def = el.data('defaultvalue');
                    if(def){
                        el.attr('data-value', def);
                        el.data('value', def);
                        $('.select-value', el).text(def);
                    }
                }
                else {
                    el.removeAttr('disabled').removeProp('disabled');
                    if (el.hasClass('select2-control')) {
                        $('#' + el.attr('id')).select2('data', null, false);
                    }
                }
            });
        },
        getData: function () {
            var project = config.project.projectId,
                email = $('#email', this.$el).val(),
                fullName = $('#fullName', this.$el).val(),
                projectRole = $('#projectRole', this.$el).data('value');
            return {
                default_project: project,
                login: this.$login.val(),
                email: email,
                projectRole: projectRole,
                accountRole: 'USER',
                full_name: fullName,
                password: this.$password.val()
            }
        },
        generatePassword: function (e) {
            e.preventDefault();
            if (!$(e.target).hasClass('disabled')) {
                this.$password.val(this.randomPassword());
                this.$password.valid && _.isFunction(this.$password.valid) && this.$password.valid();
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
        }
    });

    var MembersInvite = MembersForms.extend({
        formTpl: 'tpl-members-invite',
        getData: function () {
            var project = config.project.projectId,
                email = $('#email', this.$el).val(),
                projectRole = $('#projectRole', this.$el).data('value');
            return {
                default_project: project,
                email: email,
                role: projectRole
            }
        },
        setupValidation: function () {
            var self = this;
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = $("#inviteMemberForm").validate({
                errorClass: 'has-error',
                label: $('.rp-form-group'),
                rules: {
                    email: {
                        required: true,
                        email: true,
                        remote: this.remoteValidation()
                    }
                },
                messages: {
                    email: {
                        required: Localization.validation.requiredDefault,
                        email: Localization.validation.incorrectEmail,
                        remote: Localization.validation.registeredEmail
                    }
                },
                ignore: 'input[id^="s2id"]',
                submitHandler: function (form) {
                    self.onSubmit('inviteMember');
                },
                errorPlacement: function (error, element) {
                    error.appendTo($('.help-inline', element.closest('.rp-form-group')));
                },
                highlight: function (element, errorClass) {
                    $(element).closest('.rp-form-group').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('.rp-form-group').removeClass(errorClass);
                }
            });
        },
        events: {
            'click #cancelInvite': 'resetForm',
            'click .dropdown-menu a': 'selectRole'
        },
        resetForm: function (e) {
            e && e.preventDefault();
            MembersForms.prototype.resetForm.call(this, 'inviteMember');
            var el = $('.select2-control', this.$el);
            el.length && $('#' + el.attr('id')).select2('data', null, false);
            this.$projectRole.removeAttr('disabled').removeProp('disabled');
            var def = this.$projectRole.data('defaultvalue');
            if(def){
                this.$projectRole.attr('data-value', def);
                this.$projectRole.data('value', def);
                $('.select-value', this.$projectRole).text(def);
            }
            this.$inviteForm.show();
            this.$invite.show();
            this.$linkForm.hide();
            this.$cancel.hide();
            this.$inviteLink.val('');
            this.$inviteEmail.empty();
        },
        showSuccess: function (data) {
            var data = _.extend(data, this.getData());
            this.$inviteForm.hide();
            this.$invite.hide();
            this.$linkForm.show();
            this.$cancel.show();
            this.$inviteLink.val(data.backLink);
            this.$inviteEmail.text(data.email);
        },
        setupAnchors: function () {
            MembersForms.prototype.setupAnchors.call(this);
            this.$cancel = $('#cancelInvite', this.$el);
            this.$invite = $('#sendInvite', this.$el);
            this.$inviteForm = $('#inviteForm', this.$el);
            this.$linkForm = $('#linkForm', this.$el);
            this.$inviteLink = $('#inviteLink', this.$el);
            this.$inviteEmail = $('#inviteEmail', this.$el);
            this.$projectRole = $('#projectRole', this.$el);
        }
    });

    var MembersView = Components.BaseView.extend({
        searchString: '',
        total: 0,
        initialize: function (options) {
            this.projectId = options.projectId;
            this.$el = options.container;
            this.imageRoot = urls.getAvatar();
            this.user = options.user;
            this.roles = Util.getRolesMap();
            this.memberAction = options.memberAction;
            this.projectRoleIndex = options.projectRoleIndex;
            // this.isDefaultProject = options.isDefaultProject;
            this.isGrandAdmin = options.grandAdmin;
            this.pageType = 'PaginateProjectMembers_' + this.memberAction + '_' + this.projectId;
            this.appModel = new SingletonAppModel();
            if(options.project){
                this.appModel.set(options.project);
            }
        },
        shellTpl: 'tpl-members-shell',
        membersTpl: 'tpl-members-list',
        actionHeaderTpl: 'tpl-members-action-header',
        actionTpl: 'tpl-members-action',
        render: function () {
            //render shell
            this.$el.html(Util.templates(this.shellTpl, {
                actionTpl: this.actionHeaderTpl,
                grandAdmin: this.isGrandAdmin || false,
                projectId: this.projectId,
                util: Util,
            }));
            this.$members = $("#membersList", this.$el);
            this.$total = $(".rp-members-qty:first", this.$el);
            this.$memberFilter = $("#userFilter", this.$el);

            Util.bootValidator(this.$memberFilter, [{
                validator: 'minMaxNotRequired',
                type: 'memberName',
                min: 1,
                max: 128
            }]);

            this.paging = new Components.PagingToolbarSaveUser({
                el: $(".project_list_paginate", this.$el),
                model: new Backbone.Model(),
                pageType: this.pageType
            });
            this.listenTo(this.paging, 'page', this.onPage);
            this.listenTo(this.paging, 'count', this.onPageCount);
            var self = this;
            this.paging.ready.done(function(){
                self.searchString = '';
                // var userStorageData = self.paging.getSettingsStorageData();
                // if(userStorageData && userStorageData['filter.cnt.login']){
                //     self.searchString = decodeURIComponent(userStorageData['filter.cnt.login']);
                // }
                if(self.paging.urlModel.get('filter.cnt.login')) {
                    self.searchString = self.paging.urlModel.get('filter.cnt.login');
                }
                self.$memberFilter.val(self.searchString)
                self.prevVal = self.searchString;
                self.changeMembers();
            });
            return this;
        },
        onPage: function(page) {
            this.changeMembers();
        },
        onPageCount: function(size) {
            this.changeMembers();
        },
        changeMembers: function() {
            this.paging.render();
            this.loadMembers();
        },
        getMembers: function(projectId, query){
            return Service.getMembers(this.projectId, query);
        },
        loadMembers: function () {
            var self = this;
            var query = {
                search: encodeURIComponent(this.searchString),
                page: this.paging.model.get('number'),
                size: this.paging.model.get('size')
            };
            this.getMembers(this.projectId, query)
                .done(function (data) {
                    if(data.page.totalPages < data.page.number && data.page.totalPages != 0){
                        self.paging.trigger('page', data.page.totalPages);
                        return;
                    }
                    self.paging.model.set(data.page);
                    self.paging.render();
                    self.members = data.content ? data.content : data;
                    self.renderMembers();

                    self.$total.html(data.page.totalElements);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "loadMembers");
                    self.renderContent([], 'html');
                });
        },
        searchFilter: function (item, searchString) {
            if (!searchString) {
                return true;
            } else {
                var regex = new RegExp(searchString.escapeRE(), 'i');
                return regex.test(item.userId) || regex.test(item.email) || regex.test(item.full_name);
            }
        },
        canEdit: function (member, projectRole) {
            return !Util.isYou(member) && config.userModel.hasPermissions(projectRole);
        },
        unassignedLock: function () {
            var projectId = this.projectId;
            return function (member) {
                return Util.isUnassignedLock(member, member.assigned_projects[projectId]);
            }
        },
        getColorClass: function (member) {
            var color = "",
                projectOptions = member.assigned_projects[this.projectId];
            if (projectOptions) {
                color = (projectOptions.proposedRole === projectOptions.projectRole) ? 'btn-gray' : 'btn-orange';
            }
            return color;
        },
        isPersonalProjectOwner: function(){
            var project = this.appModel.get('projectId'),
                isPersonalProject = this.appModel.isPersonalProject();
            return function(user){
                return isPersonalProject && (project === user.userId + '_personal');
            }
        },
        renderMembers: function (members) {
            members = members || this.members;
            if(members) {
                this.removeScrollView();
                if (members.length > config.membersAtATime) {
                    this.scrollView = new Scrollable.View({
                        items: members,
                        renderFn: this.renderContent.bind(this),
                        holder: this.$members,
                        amount: config.membersAtATime,
                        trashHold: config.scrollTrackerTrashHold
                    }).render();
                } else {
                    this.renderContent(members, 'html');
                }

                this.$total.html(members.length);

                if (window.sessionStorage) {
                   var memberId = window.sessionStorage.getItem('activeMember');
                    if (memberId) {
                        $('[data-js-view-projects][data-id="' + memberId + '"]').click();
                    }
                }
            }
        },
        removeScrollView: function () {
            if (this.scrollView) {
                this.scrollView.destroy();
                this.scrollView = null;
                this.$members.off().empty();
            }
        },
        getRenderObject: function (members) {
            return {
                members: members,
                actionTpl: this.actionTpl,
                imageRoot: this.imageRoot,
                searchString: this.searchString,
                textWrapper: Util.textWrapper,
                roles: this.roles,
                projectId: this.projectId,
                util: Util,
                getColorClass: this.getColorClass,
                unassignedLock: this.unassignedLock(),
                isPersonalProjectOwner: this.isPersonalProjectOwner(),
                canEdit: this.canEdit,
                isGrandAdmin: this.isGrandAdmin,
                defaultRole: this.defaultRole,
                projectRoleIndex: this.projectRoleIndex,
                // isDefaultProject: this.isDefaultProject
            };
        },
        renderContent: function (members, action) {
            this.$members[action](Util.templates(this.membersTpl, this.getRenderObject(members)));
        },
        events: {
            'validation::change #userFilter': 'filterMembers',
            'click .project-roles': 'updateProjectRole',
            'click .member-action': 'applyMemberAction',
            'click .show-time': 'toggleTimeView',
            'click .change-role': 'changeRole'
        },
        toggleTimeView: function () {
            this.$members.toggleClass('exact-driven');
        },
        changeRole: function (e) {
            e.preventDefault();

            var el = $(e.currentTarget),
                id = '' + el.data('id'),
                index = -1,
                member = _.find(this.members, function (m, i) {
                        var valid = m.userId === id;
                        if (valid) {
                            index = i;
                        }
                        return valid;
                    }) || {};

            Util.confirmDeletionDialog({
                callback: function () {
                    var self = this,
                        newRole = member.userRole == config.accountRolesEnum.user
                            ? config.accountRolesEnum.administrator
                            : config.accountRolesEnum.user;
                    Service.updateUser({role: newRole}, member.userId, _.keys(member.assigned_projects))
                        .done(function () {                            
                            member.userRole = newRole;
                            var data = self.getRenderObject([member]);
                            el.closest('.rp-table-row').replaceWith(Util.templates(self.membersTpl, data));
                            Util.ajaxSuccessMessenger("changeRole", member.full_name || member.userId);
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, "changeRole", member.full_name || member.userId);
                        });

                }.bind(this),
                message: "changeRole",
                format: [member.full_name || member.userId]
            });
        },
        prevVal: '',
        filterMembers: function (e, data) {
            var changedVal = $(e.target).val() != this.prevVal;
            if (data.valid && changedVal) {
                this.paging.urlModel.set({'filter.cnt.login': data.value});
                this.searchString = data.value;
                this.paging.trigger('page', 1);
            }
            this.prevVal = $(e.target).val();
        },
        updateProjectRole: function (e) {
            e.preventDefault();

            var el = $(e.currentTarget);

            if (el.hasClass('active') || el.hasClass('disabled')) {
                return;
            }

            var newRole = el.data('value'),
                userId = '' + el.closest('.row').data('user'),
                btngroup = el.closest('.rp-btn-group'),
                button = $('.btn', btngroup),
                self = this;

            Service.updateMember(newRole, userId, this.projectId)
                .done(function () {
                    var member = _.find(self.members, function (m) {
                            return m.userId === userId;
                        }),
                        roles = member.assigned_projects[self.projectId];
                    roles.projectRole = newRole;

                    if (roles.proposedRole !== newRole) {
                        button.removeClass('btn-gray').addClass('btn-orange');
                    } else {
                        button.removeClass('btn-orange').addClass('btn-gray');
                    }

                    Util.flipActiveLi(el);
                    Util.ajaxSuccessMessenger('updateProjectRole', member.full_name || member.userId);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateProjectRole");
                });
        },
        applyMemberAction: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget),
                id = '' + el.data('id'),
                index = -1,
                member = _.find(this.members, function (m, i) {
                        var valid = m.userId === id;
                        if (valid) {
                            index = i;
                        }
                        return valid;
                    }) || {};

            Util.confirmDeletionDialog({
                callback: function () {
                    this.doAction(member, index, el);
                }.bind(this),
                message: this.memberAction,
                format: [member.full_name || member.userId, this.projectId]
            });
        },
        removeMember: function(index, el){
            var removeMember = this.members.splice(index, 1);
            this.loadMembers();
            this.trigger('user::action');
            return removeMember;
        },
        doAction: function (member, index, el) {
            var self = this;
            Service.unAssignMember(member.userId, self.projectId)
                .done(function () {
                    Util.ajaxSuccessMessenger("unAssignMember");
                    self.removeMember();
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "unAssignMember");
                });
        },
        destroy: function () {
            this.members = null;
            this.removeScrollView();
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    MembersView.extend = function (child) {
        var view = Backbone.View.extend.apply(this, arguments);
        view.prototype.events = _.extend({}, this.prototype.events, child.events);
        return view;
    };

    var MembersViewAssign = MembersView.extend({
        defaultRole: '',
        actionHeaderTpl: 'tpl-admin-members-assign-header',
        actionTpl: 'tpl-admin-members-assign-action',
        initialize: function (options) {
            this.defaultRole = options.roles[1];
            MembersView.prototype.initialize.call(this, options);
        },
        getMembers: function(projectId, query){
            return Service.getAssignableMembers(this.projectId, query);
        },
        canEdit: function () {
            return function (member) {
                return !Util.isYou(member);
            }
        },
        applyMemberAction: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget),
                id = '' + el.data('id'),
                index = -1,
                member = _.find(this.members, function (m, i) {
                    var valid = m.userId === id;
                    if (valid) {
                        index = i;
                    }
                    return valid;
                });
            var data = {};
            data[member.userId] = (member.selectedRole || this.defaultRole);
            this.doAction(data, index, el);
        },
        doAction: function (data, index, el) {
            var self = this;
            Service.assignMember(data, self.projectId)
                .done(function () {
                    var member = self.removeMember(index, el);
                    Util.ajaxSuccessMessenger("assignMember", member[0].full_name || member[0].userId);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "assignMember");
                });
        },
        updateProjectRole: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget),
                btn = el.closest('.rp-btn-group').find(".select-value:first");
            if (el.hasClass('active') || el.hasClass('disabled')) {
                return;
            }
            el.closest('ul').find('a').removeClass('active');
            el.addClass('active');
            btn.text(el.text());
            var member = _.find(this.members, {userId: '' + btn.data('id')});
            member['selectedRole'] = el.data('value');
        }
    });

    return {
        ContentView: ContentView,
        MembersView: MembersView,
        MembersAdd: MembersAdd,
        MembersInvite: MembersInvite,
        MembersViewAssign: MembersViewAssign
    };

});