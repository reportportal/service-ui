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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Urls = require('dataUrlResolver');
    var CallService = require('callService');

    var call = CallService.call;

    var getProject = function (id) {
        return call('GET', Urls.adminProject(id));
    };

    var getProjectInfo = function () {
        return call('GET', Urls.getProject());
    };

    var getProjects = function (data) {
        return call('GET', Urls.adminProjects(data));
    };

    var deleteUser = function (id) {
        return call('DELETE', Urls.modifyUserUrl(id));
    };

    var createProject = function (name) {
        return call('POST', Urls.adminProjectRoot(), {
            projectName: name,
            entryType: 'INTERNAL'
        });
    };

    var deleteProject = function (id) {
        return call('DELETE', Urls.adminProjectRootId(id));
    };

    var getProjectNames = function () {
        return call('GET', Urls.getProjectNames());
    };

    var getAllUser = function (query) {
        return call('GET', Urls.allUsersUrl(query));
    };

    var getSearchUser = function (options) {
        return call('GET', Urls.searchUsersUrl(options))
    }

    var loadProjectDetailsWidgets = function (project, id, interval) {
        return call('GET', Urls.projectDetailsWidgets(project, id, interval));
    };

    var getAdminSettings = function (data) {
        return call('GET', Urls.getAdminSettings(data));
    };

    var setAdminSettings = function (data, id) {
        return call('PUT', Urls.setAdminSettings(id), data);
    };

    var loadProjectInfo = function (id, value) {
        //console.log(Urls.detailsIntervalCall(id, value));
        return call('GET', Urls.detailsIntervalCall(id, value));
        //var data = {
        //    launchesQuantity: 23,
        //    launchesAverage: 43534,
        //    usersQuantity: 345,
        //    uniqueTickets: 234234,
        //    launchesPerUser: [
        //        {fullName: "fg hsfldkgh sldkfg ", count: 23},
        //        {fullName: "fgsdfgsdfgsdfg sfg ", count: 23},
        //        {fullName: "sfdgsdfgsdgsfg ", count: 23},
        //        {fullName: "sfgsfdgsldkfg ", count: 23},
        //        {fullName: "fgsdfgsdfg26526546 kfg ", count: 23}
        //    ]
        //};
        //var d = $.Deferred();
        //setTimeout(function () {
        //    d.resolve(data);
        //}, 2000);
        //return d.promise();
    };

    return {
        getProject: getProject,
        getProjectInfo: getProjectInfo,
        getProjects: getProjects,
        deleteUser: deleteUser,
        createProject: createProject,
        deleteProject: deleteProject,
        getAdminSettings: getAdminSettings,
        setAdminSettings: setAdminSettings,
        getProjectNames: getProjectNames,
        getAllUser: getAllUser,
        getSearchUser: getSearchUser,
        loadProjectInfo: loadProjectInfo,
        loadProjectDetailsWidgets: loadProjectDetailsWidgets
    }
});
