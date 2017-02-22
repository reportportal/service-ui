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
    var ModalConfirm = require('modals/modalConfirm');
    var MemberService = require('projectMembers/MembersService');

    var config = App.getInstance();

    var ProjectsItemView = Epoxy.View.extend({

        tplList: 'tpl-projects-item-list',
        tplTable: 'tpl-projects-item-table',

        bindings: {
            '[data-js-project-name]': 'html: getProjectName, attr: {href: getProjectDetailsUrl}',
            '[data-js-project-name-label]': 'classes: {nameLabel: isNew}',
            '[data-js-project-new]': 'classes: {hide: not(isNew)}',
            '[data-js-project-users]': 'html: getUsersQuantity',
            '[data-js-project-launches]': 'html: getLaunchesQuantity',
            '[data-js-project-last-run]': 'text: getLastRun',
            '[data-js-settings-link]': 'attr: {href: getSettingsUrl}',
            '[data-js-members-link]': 'attr: {href: getMembersUrl}',
            '[data-js-go-to-project]': 'classes: {hide: not(assignToProject)}, attr: {href: openProjectUrl}',
            '[data-js-assign-to-project]': 'classes: {hide: assignToProject}',
            '[data-js-delete-project]': 'classes: {hide: not(canDeleteProject)}',
        },

        computeds: {
            getProjectName: {
                deps: ['projectId'],
                get: function(projectId){
                    return this.wrapSearchResult(projectId);
                }
            },
            getUsersQuantity: {
                deps: ['usersQuantity'],
                get: function(usersQuantity){
                    var view = this.filterModel.get('viewType');
                    return '<strong>' + usersQuantity + '</strong> ' +
                        (view != "table" ? (usersQuantity == 1 ? Localization.admin.usersQuantitySingular : Localization.admin.usersQuantity) : "");
                }
            },
            getLaunchesQuantity: {
                deps: ['launchesQuantity'],
                get: function(launchesQuantity){
                    var view = this.filterModel.get('viewType');
                    return '<strong>' + launchesQuantity + '</strong> ' +
                        (view != "table" ? (launchesQuantity == 1 ? Localization.admin.launchesQuantitySingular : Localization.admin.launchesQuantity) : "");
                }
            },
            getLastRun: {
                deps: ['lastRun'],
                get: function(lastRun){
                    return Localization.admin.lastRunPrefix + ' ' + (lastRun ? Util.daysFromNow(lastRun) : Localization.admin.lastRunSuffix);
                }
            },
            getProjectDetailsUrl: {
                deps: ['projectId'],
                get: function(projectId){
                    return '#administrate/project-details/' + projectId;
                }
            },
            openProjectUrl: {
                deps: ['projectId'],
                get: function(projectId){
                    return '#' + projectId;
                }
            },
            getSettingsUrl: {
                deps: ['projectId'],
                get: function(projectId){
                    return '#administrate/project-details/' + projectId + '/settings';
                }
            },
            getMembersUrl: {
                deps: ['projectId'],
                get: function(projectId){
                    return '#administrate/project-details/' + projectId + '/members';
                }
            },
            isNew: {
                deps: ['creationDate'],
                get: function(creationDate){
                    return Util.daysBetween(new Date(), new Date(creationDate)) <= 7;
                }
            },
            assignToProject: {
                deps: ['projectId'],
                get: function(projectId){
                    var projects= config.userModel.get('projects');
                    return !!projects[projectId];
                }
            },
            canDeleteProject: {
                deps: ['entryType'],
                get: function(entryType){
                    return !(this.isDeleteLock() || this.isPersonalProject(entryType));
                }
            }
        },

        events: {
            'click [data-js-delete-project]': 'deleteProject',
            'click [data-js-assign-to-project]': 'assignAdminToProject'
        },

        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.render();
        },

        render: function () {
            var tpl = this.getViewTemplate();
            this.$el.addClass(this.getViewClass()).html(Util.templates(tpl, {}));
        },

        getViewClass: function(){
            return this.filterModel.get('viewType') == 'table' ? 'project-table-row project-item' : 'project-list-row project-item';
        },

        getViewTemplate: function(){
            return this.filterModel.get('viewType') == 'table' ? this.tplTable : this.tplList;
        },

        wrapSearchResult: function(str){
            var search = this.filterModel.get('search');
            return search ? Util.textWrapper(str, search) : str;
        },

        isPersonalProject: function(entryType){
            return entryType === 'PERSONAL';
        },

        isDeleteLock: function () {
            var project = this.model.toJSON();
            return Util.isDeleteLock(project);
        },

        assignAdminToProject: function (e) {
            e.preventDefault();
            var id = this.model.get('projectId'),
                data = {},
                defaultRole = config.projectRoles[1];

            data[config.userModel.get('name')] = defaultRole;
            MemberService.assignMember(data, id)
                .done(function () {
                    config.userModel.get('projects')[id] = {projectRole: defaultRole};
                    $('[data-js-assign-to-project]', this.$el).addClass('hide');
                    $('[data-js-go-to-project]', this.$el).removeClass('hide');
                    Util.ajaxSuccessMessenger("assignYourSelf", (id + '').toUpperCase());
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "assignYourSelf");
                });
        },

        deleteProject: function(e){
            e.preventDefault();
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteProject,
                bodyText: Util.replaceTemplate(Localization.dialog.deleteProject, this.model.get('projectId')),
                confirmText: Localization.dialog.msgDeleteProject,
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
                confirmFunction: function(){
                    return this.model.delete();
                }.bind(this)
            });
            modal.show();
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ProjectsItemView;

});