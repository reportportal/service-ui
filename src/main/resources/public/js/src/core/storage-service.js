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
    var App = require('app');

    var config = App.getInstance();
    var storage = window.localStorage || {};
    var sessionStorage = window.sessionStorage || {};

    var createUserConfig = function () {
        var project = config.project.projectId;
        var data = {};
        data[project] = {'activeDashboard': {}};
        storage.setItem(config.userModel.get('name'), JSON.stringify(data));
        return data;
    };

    var getUserConfig = function () {
        var data = JSON.parse(storage.getItem(config.userModel.get('name')));
        if (!data) {
            data = createUserConfig();
        }
        return data;
    };

    var setUserConfig = function (data) {
        storage.setItem(config.userModel.get('name'), JSON.stringify(data));
    };

    var getActiveDashboard = function () {
        var data = getUserConfig();
        return data[config.project.projectId] ? data[config.project.projectId].activeDashboard : {};
    };

    var getItemsCount = function (items) {
        var data = getUserConfig();
        return data[config.project.projectId] ? data[config.project.projectId][items] : null;
    };

    var setItemsCount = function (items, count) {
        var data = getUserConfig();
        if (!data[config.project.projectId]) {
            var c = {};
            c[items] = 50;
            data[config.project.projectId] = c;
        }
        data[config.project.projectId][items] = count;
        setUserConfig(data);
    };

    var setStartTimeMode = function (mode) {
        var data = getUserConfig();
        if (!data[config.project.projectId]) {
            data[config.project.projectId] = {};
        }
        data[config.project.projectId].startTimeMode = mode;
        setUserConfig(data);
    };

    var getStartTimeMode = function () {
        var data = getUserConfig();
        return data[config.project.projectId] ? data[config.project.projectId]['startTimeMode'] : null;
    };

    var setActiveDashboard = function (dashboard) {
        var data = getUserConfig();
        if (!data[config.project.projectId]) {
            data[config.project.projectId] = {activeDashboard: {}};
        }
        data[config.project.projectId].activeDashboard = dashboard;
        setUserConfig(data);
    };

    var setDirectLinkDashboard = function (dashboardId) {
        storage.setItem('directLinkDash', dashboardId);
    };

    var getDirectLinkDashboard = function () {
        return storage.getItem('directLinkDash');
    };

    var setDebugUser = function (debugUser) {
        var data = getUserConfig();
        if (!data[config.project.projectId]) {
            data[config.project.projectId] = {debugUser: {}};
        }
        data[config.project.projectId].debugUser = debugUser;
        setUserConfig(data);
    };

    var getDebugUser = function () {
        var data = getUserConfig();
        return data[config.project.projectId] ? data[config.project.projectId].debugUser : null;
    };

    var getCurrentLogin = function () {
        return storage.getItem('current_login');
    };

    var setCurrentLogin = function (login) {
        if (login) {
            storage.setItem('current_login', login);
        }
        // else {
        //   storage.removeItem('current_login');
        // }
    };

    var getBreadcrumbMode = function () {
        return storage.getItem('breadcrumb_mode');
    };

    var setBreadcrumbMode = function (mode) {
        if (mode) {
            storage.setItem('breadcrumb_mode', mode);
        } else {
            storage.removeItem('breadcrumb_mode');
        }
    };

    var getBtsCredentials = function () {
        var data = getUserConfig();
        var projectId = config.project.projectId;
        return data[projectId] ? data[projectId].bts : {};
    };

    var setBtsCredentials = function (options) {
        var data = getUserConfig();
        var projectId = config.project.projectId;
        if (!data[projectId]) {
            data[projectId] = {};
        }
        if (!data[projectId].bts) {
            data[projectId].bts = {};
        }
        data[projectId].bts[options.id] = options;
        setUserConfig(data);
    };

    var setPreconditionMethodsStatus = function (status) {
        var data = getUserConfig();
        var projectId = config.project.projectId;
        if (!data[projectId]) {
            data[projectId] = {};
        };
        data[projectId].preconditionMethodsStatus = status;
        setUserConfig(data);
    };

    var getPreconditionMethodsStatus = function () {
        var data = getUserConfig();
        var projectId = config.project.projectId;
        return data[projectId] ? data[projectId].preconditionMethodsStatus || 'show' : 'show';
    };

    var getSessionForProject = function () {
        var projectId = config.project.projectId;
        var data = JSON.parse(sessionStorage.getItem(projectId));
        if (!data) {
            data = {};
            data[projectId] = {};
        }
        return data;
    };

    var setSessionForProject = function (data) {
        var projectId = config.project.projectId;
        sessionStorage.setItem(projectId, JSON.stringify(data));
    };

    var updateDeletingLaunches = function (id, type) {
        var deletingLaunches = getDeletingLaunches();
        var projectId = config.project.projectId;
        var data = getSessionForProject();

        if (type == 'add') {
            deletingLaunches.push(id);
        } else {
            deletingLaunches = _.without(deletingLaunches, id);
        }
        if (!data[projectId].deletingLaunches) {
            data[projectId].deletingLaunches = []
        }
        data[projectId].deletingLaunches = deletingLaunches;
        setSessionForProject(data);
    };

    var getDeletingLaunches = function () {
        var data = getSessionForProject();
        var projectId = config.project.projectId;
        var deletingLaunches = data[projectId] && data[projectId].deletingLaunches
            ? data[projectId].deletingLaunches
            : [];
        return deletingLaunches;
    };

    return {
        getActiveDashboard: getActiveDashboard,
        setActiveDashboard: setActiveDashboard,
        setDebugUser: setDebugUser,
        getDebugUser: getDebugUser,
        getCurrentLogin: getCurrentLogin,
        setCurrentLogin: setCurrentLogin,
        getBreadcrumbMode: getBreadcrumbMode,
        setBreadcrumbMode: setBreadcrumbMode,
        getItemsCount: getItemsCount,
        setItemsCount: setItemsCount,
        getBtsCredentials: getBtsCredentials,
        setBtsCredentials: setBtsCredentials,
        getDirectLinkDashboard: getDirectLinkDashboard,
        setDirectLinkDashboard: setDirectLinkDashboard,
        setPreconditionMethodsStatus: setPreconditionMethodsStatus,
        getPreconditionMethodsStatus: getPreconditionMethodsStatus,
        updateDeletingLaunches: updateDeletingLaunches,
        getDeletingLaunches: getDeletingLaunches,
        setStartTimeMode: setStartTimeMode,
        getStartTimeMode: getStartTimeMode
    }
});
