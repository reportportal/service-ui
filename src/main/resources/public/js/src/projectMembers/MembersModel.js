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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var urls = require('dataUrlResolver');
    var CallService = require('callService');

    var config = App.getInstance();

    var MembersModel = Epoxy.Model.extend({
        defaults: {
            account_type: 'INTERNAL',
            assigned_projects: {},
            full_name: '',
            last_login: 0,
            photoId: '',
            photo_loaded: false,
            userId: '',
            userRole: 'USER'
        },
        computeds: {
            isAdmin: {
                deps: ['userRole'],
                get: function (userRole) {
                    return userRole === config.accountRolesEnum.administrator;
                }
            },
            isYou: {
                deps: ['userId'],
                get: function (userId) {
                    return userId === config.userModel.get('name');
                }
            },
            lastLoginFormat: {
                deps: ['last_login'],
                get: function (lastLogin) {
                    return Util.dateFormat(lastLogin);
                }
            },
            lastLoginFromNow: {
                deps: ['lastLoginFormat'],
                get: function (lastLoginFormat) {
                    return Util.fromNowFormat(lastLoginFormat);
                }
            },
            imagePath: {
                deps: ['userId'],
                get: function (userId) {
                    return Util.updateImagePath(urls.getAvatar() + userId);
                }
            }
        },
        getAssignedProjects: function(){
            try {
                return JSON.parse(this.get('assigned_projects'));
            } catch (err) {
                return {};
            }
        },
        setAssignedProjects: function(assigned_projects){
            this.set({assigned_projects: JSON.stringify(assigned_projects)});
        },
        getProjectRole: function(project){
            var projects = this.getAssignedProjects();
            return projects ? projects[project].projectRole : null;
        },
        setProjectRole: function(project, role){
            var projects = this.getAssignedProjects();
            if(projects){
                projects[project].projectRole = role;
            }
            this.setAssignedProjects(projects);
        },
        unAssign: function(projectId) {
            var memberId = this.get('userId');
            return CallService.call('PUT', urls.updateProjectUnassign(projectId), {userNames: [memberId]})
                .done(function() {
                    Util.ajaxSuccessMessenger("unAssignMember");
                    if(this.collection) {
                        this.collection.remove(this);
                    }
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "unAssignMember");
                });
        },
        delete: function(){
            var memberId = this.get('userId'),
                fullName = this.get('full_name');
            return CallService.call('DELETE', urls.modifyUserUrl(memberId))
                .done(function() {
                    Util.ajaxSuccessMessenger("deleteMember", fullName || memberId);
                    if(this.collection) {
                        this.collection.remove(this);
                    }
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "deleteMember");
                });
        }
    });

    return MembersModel;

});