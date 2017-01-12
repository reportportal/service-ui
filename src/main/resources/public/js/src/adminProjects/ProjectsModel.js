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
    var adminService = require('adminService');

    var config = App.getInstance();

    var ProjectsModel = Epoxy.Model.extend({
        defaults: {
            creationDate: 0,
            entryType: '',
            launchesQuantity: 0,
            usersQuantity: 0,
            projectId: ''
        },
        delete: function(){
            var id = this.get('projectId')
            return adminService.deleteProject(id)
                .done(function () {
                    var curProjects = config.userModel.get('projects');
                    delete curProjects[id];
                    config.userModel.set('projects', curProjects);
                    if(this.collection) {
                        this.collection.remove(this);
                    }
                    Util.ajaxSuccessMessenger("deleteProject");
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "deleteProject");
                });
        }
    });

    return ProjectsModel;

});