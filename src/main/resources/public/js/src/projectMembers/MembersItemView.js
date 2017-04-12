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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');
    var ModalConfirm = require('modals/modalConfirm');
    var MemberService = require('projectMembers/MembersService');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');

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
            '[data-js-member-admin]': 'classes: {hide: not(isAdmin), notlink: isYou}',
            '[data-js-member-unassign]': 'classes: {disabled: not(canUnAssign)}, attr: {disabled: not(canUnAssign), title: getUnAssignTitle}',
            '[data-js-select-roles]': 'classes: {hide: isAdmin}',
            '[data-js-admin-role]': 'classes: {hide: not(isAdmin)}',
            '[data-js-selected-role]': 'text: getProjectRole',
            '[data-js-member-role-mobile]': 'text: getProjectRole',
            '[data-js-dropdown-roles]': 'updateRoleDropDown: assigned_projects',
            '[data-js-button-roles] ': 'classes: {disabled: not(canChangeRole)}, attr: {disabled: not(canChangeRole)}',
            '[data-js-make-admin]': 'classes: {hide: hideMakeAdmin}'
        },
        computeds: {
            getFullName: {
                deps: ['full_name'],
                get: function (fullName) {
                    return this.searchString
                        ? Util.textWrapper(fullName, this.searchString)
                        : fullName;
                }
            },
            getUnAssignTitle: {
                deps: ['isYou', 'userId', 'assigned_projects'],
                get: function (isYou) {
                    var members = Localization.members;
                    if (this.isPersonalProjectOwner()) {
                        return members.unAssignTitlePersonal;
                    } else if (isYou) {
                        return members.unAssignTitleYou;
                    } else if (!this.validateForPermissions()) {
                        return members.unAssignTitleNoPermission;
                    } else if (this.unassignedLock()) {
                        return members.unAssignTitleExternal;
                    }
                    return members.unAssignTitle;
                }
            },
            getLogin: {
                deps: ['userId'],
                get: function (userId) {
                    return this.searchString ? Util.textWrapper(userId, this.searchString) : userId;
                }
            },
            canUnAssign: {
                deps: ['isYou', 'userId', 'assigned_projects'],
                get: function (isYou) {
                    return !this.isPersonalProjectOwner()
                        && !this.unassignedLock()
                        && !isYou && this.validateForPermissions();
                }
            },
            canChangeRole: {
                deps: ['isYou', 'assigned_projects'],
                get: function (isYou) {
                    return !isYou && this.validateForPermissions();
                }
            },
            getProjectRole: {
                deps: ['assigned_projects'],
                get: function () {
                    var assignedProjects = this.model.getAssignedProjects();
                    var projectId = this.appModel.get('projectId');
                    var roles = Util.getRolesMap();
                    return roles[assignedProjects[projectId].projectRole];
                }
            },
            hideMakeAdmin: {
                deps: ['isAdmin', 'isYou'],
                get: function (isAdmin, isYou) {
                    return isAdmin || isYou || !this.isAdminContext;
                }
            }
        },
        bindingHandlers: {
            updateRoleDropDown: {
                set: function ($el) {
                    var assignedProjects = this.view.model.getAssignedProjects();
                    var projectId = this.view.appModel.get('projectId');
                    var role = assignedProjects[projectId].projectRole;
                    _.each($('a', $el), function (a) {
                        var action = $(a).data('value') === role ? 'add' : 'remove';
                        $(a)[action + 'Class']('active');
                    });
                }
            }
        },
        events: {
            'click [data-js-login-time]': 'toggleTimeView',
            'click [data-js-dropdown-roles] a': 'updateProjectRole',
            'click [data-js-member-unassign]': 'unAssignMember',
            'click [data-js-member-admin]': 'confirmChangeAccountRole',
            'click [data-js-make-admin]': 'confirmChangeAccountRole'
        },
        initialize: function (options) {
            this.isAdminContext = options.isAdminContext;
            this.searchString = options.searchString || '';
            this.roles = Util.getRolesMap();
            this.appModel = new SingletonAppModel();
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl, { roles: this.roles }));
        },
        confirmChangeAccountRole: function (e) {
            var modal;
            e.preventDefault();
            if (!this.model.get('isYou')) {
                config.trackingDispatcher.trackEventNumber(463);
                modal = new ModalConfirm({
                    headerText: Localization.dialogHeader.changeRole,
                    bodyText: Util.replaceTemplate(Localization.dialog.changeRole, this.model.get('full_name') || this.model.get('userId')),
                    cancelButtonText: Localization.ui.cancel,
                    okButtonDanger: true,
                    okButtonText: Localization.dialog.changeRoleBtn,
                    confirmFunction: this.changeAccountRole.bind(this)
                });
                $('[data-js-close]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(472);
                });
                $('[data-js-cancel]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(473);
                });
                modal.show();
            }
        },
        changeAccountRole: function () {
            var userId = this.model.get('userId');
            var fullName = this.model.get('full_name');
            var newRole = this.model.get('userRole') === config.accountRolesEnum.user ? config.accountRolesEnum.administrator : config.accountRolesEnum.user;

            config.trackingDispatcher.trackEventNumber(474);
            return CallService.call('PUT', Urls.modifyUserUrl(userId), { role: newRole })
                .done(function () {
                    this.model.set('userRole', newRole);
                    Util.ajaxSuccessMessenger('changeRole', fullName || userId);
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'changeRole', fullName || userId);
                });
        },
        isPersonalProjectOwner: function () {
            var project = this.appModel.get('projectId');
            var isPersonalProject = this.appModel.isPersonalProject();
            return isPersonalProject && (project === this.model.get('userId') + '_personal');
        },
        unassignedLock: function () {
            var member = this.model.toJSON();
            var projectId = this.appModel.get('projectId');
            return Util.isUnassignedLock(member, member.assigned_projects[projectId]);
        },
        updateProjectRole: function (e) {
            var $el = $(e.currentTarget);
            var newRole;
            var userId;
            var projectId;
            var assignedProjects;

            e.preventDefault();
            if ($el.hasClass('active') || $el.hasClass('disabled')) {
                return;
            }

            config.trackingDispatcher.trackEventNumber(433);
            newRole = $el.data('value');
            userId = this.model.get('userId');
            projectId = this.appModel.get('projectId');
            assignedProjects = this.model.getAssignedProjects();
            assignedProjects[projectId].projectRole = newRole;
            MemberService.updateMember(newRole, userId, projectId)
                .done(function () {
                    this.model.setAssignedProjects(assignedProjects);
                    Util.ajaxSuccessMessenger('updateProjectRole', this.model.get('full_name') || this.model.get('userId'));
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectRole');
                });
        },
        validateForPermissions: function () {
            var userRole = config.userModel.getRoleForCurrentProject();
            var assignedProjects = this.model.getAssignedProjects();
            var projectId = this.appModel.get('projectId');
            var role = assignedProjects[projectId].projectRole;
            var userRoleIndex = _.indexOf(config.projectRoles, userRole);
            var memberRoleIndex = _.indexOf(config.projectRoles, role);
            return config.userModel.get('isAdmin') || (config.userModel.hasPermissions() && userRoleIndex >= memberRoleIndex);
        },
        unAssignMember: function (e) {
            var modal;
            config.trackingDispatcher.trackEventNumber(434);
            e.preventDefault();
            modal = new ModalConfirm({
                headerText: Localization.dialogHeader.unAssignMember,
                bodyText: Util.replaceTemplate(Localization.dialog.unAssignMember, this.model.get('userId').escapeHtml(), this.appModel.get('projectId')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.unassign
            });
            modal.show()
                .done(function () {
                    return this.model.unAssign(this.appModel.get('projectId'));
                }.bind(this));
        },
        toggleTimeView: function (e) {
            var $el = $(e.currentTarget);
            e.preventDefault();
            $el.closest('[data-js-members-table]').toggleClass('show-from-now');
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return MembersItemView;
});
