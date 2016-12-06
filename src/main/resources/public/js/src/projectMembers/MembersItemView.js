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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');
    var ModalConfirm = require('modals/modalConfirm');
    var MemberService = require('projectMembers/MembersService');

    var config = App.getInstance();

    var MembersItemView = Epoxy.View.extend({
        tpl: 'tpl-project-members-item',
        className: 'row rp-table-row',

        bindings: {
            '[data-js-time-from-now]': 'text: lastLoginFromNow',
            '[data-js-time-exact]': 'text: lastLoginFormat',
            '[data-js-member-avatar]': 'attr: {src: imagePath}',
            '[data-js-member-name]': 'html: getFullName',
            '[data-js-member-login]': 'html: getLogin',
            '[data-js-member-you]': 'classes: {hide: not(isYou)}',
            '[data-js-member-admin]': 'classes: {hide: not(isAdmin)}',
            '[data-js-member-unassign]': 'classes: {disabled: not(canUnAssign)}, attr: {disabled: not(canUnAssign)}',
            '[data-js-select-roles]': 'classes: {hide: isAdmin}',
            '[data-js-admin-role]': 'classes: {hide: not(isAdmin)}',
            '[data-js-selected-role]': 'text: getProjectRole',
            '[data-js-dropdown-roles]': 'updateRoleDropDown: assigned_projects',
            '[data-js-button-roles] ': 'classes: {disabled: not(canChangeRole)}, attr: {disabled: not(canChangeRole)}'
        },

        computeds: {
            getFullName: {
                deps: ['full_name'],
                get: function(fullName) {
                    return this.searchString ? Util.textWrapper(fullName, this.searchString) : fullName;
                }
            },
            getLogin: {
                deps: ['userId'],
                get: function(userId) {
                    return this.searchString ? Util.textWrapper(userId, this.searchString) : userId;
                }
            },
            canUnAssign: {
                deps: ['isAdmin', 'userId', 'assigned_projects'],
                get: function(isAdmin, userId, assigned_projects) {
                    return !this.isPersonalProjectOwner() && !this.unassignedLock() && !isAdmin && config.userModel.hasPermissions();
                }
            },
            canChangeRole: {
                deps: ['isAdmin'],
                get: function(isAdmin) {
                    return this.validateForPermissions();
                }
            },
            getProjectRole: {
                deps: ['assigned_projects'],
                get: function(){
                    var assignedProjects = this.model.getAssignedProjects(),
                        projectId = this.appModel.get('projectId');
                    return assignedProjects[projectId].projectRole;
                }
            }
        },

        bindingHandlers: {
            updateRoleDropDown: {
                set: function($el, value) {
                    var assignedProjects = this.view.model.getAssignedProjects(),
                        projectId = this.view.appModel.get('projectId'),
                        role = assignedProjects[projectId].projectRole;
                    _.each($('a', $el), function(a){
                        var action = $(a).data('value') === role ? 'add' : 'remove';
                        $(a)[action+'Class']('active');
                    });
                }
            }
        },

        events: {
            'click [data-js-login-time]': 'toggleTimeView',
            'click [data-js-dropdown-roles] a': 'updateProjectRole',
            'click [data-js-member-unassign]': 'unAssignMember'
        },

        initialize: function (options) {
            this.searchString = options.searchString || '';
            this.roles = Util.getRolesMap();
            this.appModel = new SingletonAppModel();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {roles: this.roles}));
        },

        isPersonalProjectOwner: function(){
            var project = this.appModel.get('projectId'),
                isPersonalProject = this.appModel.isPersonalProject();
            return isPersonalProject && (project === this.model.get('userId') + '_personal');
        },

        unassignedLock: function(){
            var member = this.model.toJSON(),
                projectId = this.appModel.get('projectId');
            return Util.isUnassignedLock(member, member.assigned_projects[projectId]);
        },

        updateProjectRole: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            if ($el.hasClass('active') || $el.hasClass('disabled')) {
                return;
            }

            var newRole = $el.data('value'),
                userId = this.model.get('userId'),
                projectId = this.appModel.get('projectId'),
                assignedProjects = this.model.getAssignedProjects();

            assignedProjects[projectId].projectRole = newRole;

            MemberService.updateMember(newRole, userId, projectId)
                .done(function () {
                    this.model.setAssignedProjects(assignedProjects);
                    Util.ajaxSuccessMessenger('updateProjectRole', this.model.get('full_name') || this.model.get('userId'));
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateProjectRole");
                });
        },

        validateForPermissions: function(){
            return this.model.get('isAdmin') || config.userModel.hasPermissions();
        },

        unAssignMember: function(e){
            e.preventDefault();
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.unAssignMember,
                bodyText: Util.replaceTemplate(Localization.dialog.unAssignMember, this.model.get('userId').escapeHtml(), this.appModel.get('projectId')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.unassign,
            });
            modal.show()
                .done(function() {
                    return this.model.remove(this.appModel.get('projectId'));
                }.bind(this));
        },

        toggleTimeView: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget);
            $el.closest('[data-js-members-table]').toggleClass('show-from-now');
        },

        destroy: function(){

        }
    });

    return MembersItemView;

});