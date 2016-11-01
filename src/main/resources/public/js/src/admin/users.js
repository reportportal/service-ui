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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Components = require('components');
    var Util = require('util');
    var App = require('app');
    var Service = require('adminService');
    var Main = require('mainview');
    var urls = require('dataUrlResolver');
    var Filter = require('filters');
    var Member = require('member');
    var memberService = require('memberService');
    var Localization = require('localization');
    var CoreService = require('coreService');

    require('select2');

    var config = App.getInstance();

    var ContentView = Components.BaseView.extend({

        initialize: function (options) {
            this.$el = options.el;
            this.action = options.action;
            this.queryString = options.queryString;
        },

        shellTpl: 'tpl-admin-content-shell',

        getViewForPage: function (options) {
            var key = options.action;
            switch (key) {
                case "add":
                    return addUser;
                    break;
                case "invite":
                    return inviteUser;
                    break;
                default:
                    break;
            }
        },

        render: function () {

            this.$el.html(Util.templates(this.shellTpl));
            this.$header = $("#contentHeader", this.$el);
            this.$body = $("#contentBody", this.$el);

            this.header = new Header({
                header: this.$header,
                action: this.action
            }).render();

            this.renderBody();

            return this;
        },

        update: function () {
            this.renderBody();
        },

        renderBody: function () {
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
            if (this.action) {
                var pageView = this.getViewForPage({action: this.action});
                this.body = new pageView({
                    container: this.$body,
                    action: this.action,
                    queryString: this.queryString
                }).render();
            } else {
                this.body = new MembersViewAdmin({
                    container: this.$body,
                    userId: config.userModel.get('name'),
                    roles: config.projectRoles,
                    memberAction: 'deleteUser',
                    grandAdmin: true
                }).render();
            }
        },

        destroy: function () {
            this.header && this.header.destroy();
            this.body && this.body.destroy();
            Components.BaseView.prototype.destroy.call(this);
            if (window.sessionStorage) {
                window.sessionStorage.removeItem('activeMember');
            }
        }
    });

    var Header = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
            this.action = options.action;
        },

        tpl: 'tpl-admin-users-header',

        render: function () {
            this.$el.html(Util.templates(this.tpl, {action: this.action}));
            return this;
        }
    });

    var addUser = Member.MembersAdd.extend({
        initialize: function (options) {
            Member.MembersAdd.prototype.initialize.call(this, options);
            this.pageType = 'users';
        },

        render: function () {
            this.$container.empty().append(this.$el.html(Util.templates(this.formTpl, {
                type: this.pageType,
                roles: this.getRoles(),
                defaultAccountRole: config.defaultAccountRole,
                defaultProjectRole: config.defaultProjectRole,
                accountRoles: config.accountRoles
            })));
            this.setupAnchors();
            getProjects($('#project', this.$el));
            this.setupValidation();
            setupProjectsSearch($('#project', this.$el));
            return this;
        },

        getData: function () {
            var data = Member.MembersAdd.prototype.getData.call(this);
            var project = $('#project').select2('data');
            var accountRole = $('#accountRole').data('value');

            data.default_project = project ? project.id : null;
            data.accountRole = accountRole;
            return data;
        },

        setupAnchors: function () {
            Member.MembersAdd.prototype.setupAnchors.call(this);
            this.$project = $('#project', this.$el);
        },

        setupValidation: function () {
            Member.MembersAdd.prototype.setupValidation.call(this);
            addProjectValidation(this.$project);
        }
    });

    var inviteUser = Member.MembersInvite.extend({
        render: function () {
            this.$container.empty().append(this.$el.html(Util.templates(this.formTpl, {
                type: 'users',
                roles: this.getRoles(),
                defaultProjectRole: config.defaultProjectRole
            })));
            this.setupAnchors();
            getProjects($('#project', this.$el));
            setupProjectsSearch($('#project', this.$el));
            this.setupValidation();
            return this;
        },

        getData: function () {
            var data = Member.MembersInvite.prototype.getData.call(this);
            var project = $('#project').select2('data');
            data.default_project = project ? project.id : null;
            return data;
        },

        setupAnchors: function () {
            Member.MembersInvite.prototype.setupAnchors.call(this);
            this.$project = $('#project', this.$el);
        },

        setupValidation: function () {
            Member.MembersInvite.prototype.setupValidation.call(this);
            addProjectValidation(this.$project);
        }
    });

    var userProjectList = Components.BaseView.extend({
        initialize: function (options) {
            this.$after = options.container;
            this.user = options.user;
        },

        tpl: 'tpl-user-projects',

        render: function () {
            this.$after.after(this.$el.html(Util.templates(this.tpl, {})));
        }
    });

    var getProjects = function (el, excludeHash) {
        Service.getProjectNames()
            .done(function (data) {
                data = data.sort(function (a, b) {
                    if (a > b) return 1;
                    if (a < b) return -1;
                    return 0;
                });
                _.each(data, function (project) {
                    if (excludeHash && excludeHash[project]) {
                        return;
                    }
                    el.append('<option value="' + project + '">' + project + '</option>');
                });
            })
            .fail(function (error) {

            });
    };

    var setupProjectsSearch = function (el) {
        Util.setupSelect2WhithScroll(el, {
            placeholder: Localization.forms.selectProject,
            allowClear: true
        });
    };

    var addProjectValidation = function (el) {
        el.rules('add', {
            required: true,
            messages: {
                required: Localization.validation.requiredDefault
            }
        });
        el.on('change', function () {
            el.valid && _.isFunction(el.valid) && el.valid();
        });
    };

    var MembersViewAdmin = Member.MembersView.extend({

        actionHeaderTpl: 'tpl-admin-all-members-action-header',
        actionTpl: 'tpl-admin-all-members-action',

        events: {
            'click [data-js-view-projects]': 'viewMemberProjects'
        },

        initialize: function (options) {
            Member.MembersView.prototype.initialize.call(this, options);
            this.pageType = 'PaginateAdminMembers';
        },

        viewMemberProjects: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var userId = '' + el.data('id');
            var member = _.find(this.members, {userId: userId});

            if (el.hasClass('active')) {
                this.assignProjectClear();
                if (window.sessionStorage) {
                    window.sessionStorage.removeItem('activeMember');
                }
            } else {
                this.assignProjectClear();
                if (window.sessionStorage) {
                    window.sessionStorage.setItem('activeMember', userId);
                }
                el.addClass('active');
                var editor = $("<div class='col-sm-12' />").appendTo(el.closest('.row'));
                this.assignProject = new AssignProjectView({
                    container: editor,
                    member: member,
                    roles: this.roles,
                    defaultRole: config.projectRoles[1],
                    defaultProject: member.default_project
                }).render();
            }
        },

        assignProjectClear: function () {
            if (this.assignProject) {
                this.assignProject.$el.closest('.row').find('.active').removeClass('active');
                this.assignProject.destroy();
            }
        },

        getMembers: function (projectId, query) {
            return this.getAllCall = Service.getSearchUser(query)
        },

        doAction: function (member, index, el) {
            var self = this;
            Service.deleteUser(member.userId)
                .done(function () {
                    self.members.splice(index, 1);
                    self.changeMembers();
                    Util.ajaxSuccessMessenger("deleteMember", member.full_name || member.userId);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "deleteMember");
                });
        },

        destroy: function () {
            if (this.getAllCall) {
                this.getAllCall.abort();
            }
            Member.MembersView.prototype.destroy.call(this);
        }
    });

    var AssignProjectView = Components.RemovableView.extend({
        $addRow: null,
        $assignBtn: undefined,

        initialize: function (options) {
            this.$el = options.container;
            this.member = options.member;
            this.roles = options.roles;
            this.defaultRole = options.defaultRole;
            this.defaultProject = options.defaultProject;
        },

        tpl: "tpl-admin-member-projects",
        assignTpl: "tpl-admin-assign-project",

        render: function () {
            var self = this;
            CoreService.getUserAssignedProjects(this.member.userId)
                .done(function (assignedProjects) {
                    // object to array for sort
                    var assignedProjectsArray = [];
                    for (var key in assignedProjects) {
                        assignedProjectsArray.push({key: key, value: assignedProjects[key]});
                    }
                    assignedProjectsArray.sort(function (a, b) {
                        if (a.key > b.key) {
                            return 1;
                        }
                        if (a.key < b.key) {
                            return -1;
                        }
                        return 0;
                    });
                    self.member.assigned_projects = assignedProjects;
                    self.member.assigned_projects_array = assignedProjectsArray;
                    self.$el.html(Util.templates(self.tpl, {
                        member: self.member,
                        roles: self.roles,
                        defaultProject: self.defaultProject,
                        unassignedLock: Util.isUnassignedLock,
                        isPersonalProjectOwner: self.isPersonalProjectOwner(),
                        isAdmin: Util.isAdmin
                    }));
                    self.$addRow = $(".add-row", self.$el);
                });
            return this;
        },

        events: {
            'click .roles-option': 'updateRole',
            'click .unassign-member': 'unAssignMember',
            'click .add-project': 'addProject',
            'click .roles-option-empty': 'handleDropDown',
            'click .assign-member': 'assignMember',
            'select2-selecting #projectId': 'projectSelected'
        },
        isPersonalProjectOwner: function(){
            return function(user, project){
                var projectId = project.key,
                    isPersonal = project.value.entryType == 'PERSONAL';
                return isPersonal && (projectId === user.userId + '_personal');
            }
        },
        handleDropDown: function (e) {
            e.preventDefault();
            this.$assignBtn.data('role', $(e.currentTarget).data('value'));
            Util.flipActiveLi($(e.currentTarget));
        },

        updateRole: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);

            if (el.hasClass('active')) {
                return;
            }

            var newRole = el.data('value');
            var selected = el.closest('.rp-btn-group').find('.select-value');
            var self = this;
            memberService.updateMember(newRole, this.member.userId, selected.data('project'))
                .done(function () {
                    Util.flipActiveLi(el);
                    self.updateMySelf(self.member.userId);
                    //remove, because data load from server
                    // self.member.assigned_projects[selected.data('project')].projectRole = newRole;
                    Util.ajaxSuccessMessenger('updateProjectRole', self.member.full_name || self.member.userId);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateProjectRole");
                });
        },

        unAssignMember: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var projectId = el.data('project');
            Util.confirmDeletionDialog({
                callback: function () {
                    var self = this;
                    memberService.unAssignMember(self.member.userId, projectId)
                        .done(function () {
                            self.updateMySelf(self.member.userId);
                            //remove, because data load from server
                            //delete self.member.assigned_projects[projectId];
                            el.closest('.row').fadeOut('slow');
                            Util.ajaxSuccessMessenger("unAssignMember");
                        })
                        .fail(function (error) {
                            var errorObj = JSON.parse(error.responseText);
                            errorObj.message = 'User "' + errorObj.message.split("'")[1] + '" not found in database';
                            error.responseText = JSON.stringify(errorObj);
                            Util.ajaxFailMessenger(error, "unAssignMember");
                        });
                }.bind(this),
                message: 'unAssignMember',
                format: [this.member.full_name || this.member.userId, projectId]
            });
        },

        addProject: function (e) {
            e.preventDefault();
            this.$addRow.before(Util.templates(this.assignTpl, {
                roles: this.roles,
                defaultRole: this.defaultRole,
                isAdmin: Util.isAdmin(this.member)
            }));
            this.$assignBtn = $(".assign-member:first", this.$el);
            var projects = $('#projectId', this.$el);
            getProjects(projects, this.member.assigned_projects);
            setupProjectsSearch(projects);
            this.$addRow.hide();
        },

        assignMember: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var projectRole = el.data('role') || this.defaultRole;
            var projectId = el.data('project');
            var data = {};
            if (el.attr('disabled')) {
                return;
            }
            data[this.member.userId] = projectRole;
            var self = this;
            memberService.assignMember(data, projectId)
                .done(function () {
                    //remove, because data load from server
                    //self.member.assigned_projects[projectId] = {projectRole: projectRole};
                    self.$addRow = null;
                    self.$assignBtn = null;
                    self.updateMySelf(self.member.userId);
                    self.render();
                    Util.ajaxSuccessMessenger("assignMember", self.member.full_name || self.member.userId);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "assignMember");
                });
        },

        updateMySelf: function (userId) {
            if (userId === config.userModel.get('name')) {
                config.userModel.updateInfo();
            }
        },

        projectSelected: function (e) {
            this.$assignBtn.removeAttr('disabled').data('project', e.val);
        }
    });

    return {
        ContentView: ContentView
    };
});
