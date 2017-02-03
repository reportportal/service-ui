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

define(['app'], function (App) {
    'use strict';

    var config = App.getInstance();

    var getApiToken = function() {
        return '/uat/sso/me/apitoken';
    };
    
    var userLogout = function() {
          return '/uat/sso/me'
    };
    var userLogin = function(data) {
        return '/uat/sso/oauth/token?grant_type=password&username='+ data.login +'&password='+ data.password;
    };

    var getRegistryInfo = function() {
        return '/composite/info';
    };

    var getProjectBase = function () {
        return config.apiVersion + config.project.projectId || config.userModel.get('defaultProject');
    };

    var getChartProjectBase = function () {
        return config.apiVersion + 'project/' + (config.project.projectId || config.userModel.get('defaultProject'));
    };
    var getAvatar = function () {
        var d = new Date();
        return config.apiVersion + 'data/userphoto?v=' + d.getTime() + '&id=';
    };
    var getFilters = function (ids) {
        var idsString = ids.join(',');
        return getProjectBase() + "/filter/filters?ids=" + idsString;
    };
    var saveFilter = function (query) {
        if(query) {
            return getProjectBase() + '/filter' + query;
        }
        return getProjectBase() + '/filter';
    };
    var filterById = function (id) {
        return saveFilter() + "/" + id;
    };
    var filterNames = function () {
        return saveFilter() + '/names';
    };
    var filterNamesShared = function () {
        return filterNames() + '?is_shared=true';
    };
    var ownFilters = function () {
        return saveFilter() + '/own';
    };
    var sharedFilters = function () {
        return saveFilter() + '/shared';
    };

    var widgetNamesShared = function () {
        return getProjectBase() + '/widget/names/shared';
    };
    var widgetsShared = function () {
        return getProjectBase() + '/widget/shared';
    };
    var updateFilter = function (id) {
        return saveFilter() + '/' + id;
    };
    var filtersBase = function () {
        return "#" + config.project.projectId + "/filters";
    };
    var getPreferences = function () {
        var userAttr = config.userModel.toJSON();
        return config.apiVersion + "project/" + (config.project.projectId || userAttr.defaultProject) + "/preference/" + userAttr.name;
    };
    var getProject = function (id) {
        return config.projectUrl + (id || config.project.projectId || config.userModel.get('defaultProject'));
    };
    var launchesBase = function () {
        return "#" + config.project.projectId + "/launches";
    };
    var userDebugBade = function () {
        return "#" + config.project.projectId + "/userdebug";
    };
    var tabUrl = function (filtersUrl) {
        return launchesBase() + "/all?" + filtersUrl;
    };

    var getLaunchBase = function() {
        return getProjectBase() + '/launch';
    };
    var getLaunchMerge = function () {
        return getLaunchBase() + '/merge';
    };
    var getLaunchUpdate = function() {
        return getLaunchBase() + '/update';
    };
    var getLaunchStop = function() {
        return getLaunchBase() + '/stop';
    };

    var queryByTags = function (tags) {
        return getProjectBase() + '/launch/tags?filter.cnt.tags=' + encodeURIComponent(tags);
    };
    var queryByLaunchName = function (name) {
        return getProjectBase() + '/launch/names?filter.cnt.name=' + encodeURIComponent(name);
    };
    var userAutoCompleteUrl = function (term, mode) {
        return getProjectBase() + '/launch/owners?filter.cnt.user=' + encodeURI(term) + (mode ? '&mode=' + mode : '');
    };
    var autocompleteUserUrl = function(term){
        return config.apiVersion + 'project/' + config.project.projectId + '/usernames?filter.cnt.users=' + encodeURI(term);
    };
    var tagsLaunchAutoCompleteUrl = function (term, id) {
        return getProjectBase() + '/item/tags?launch=' + id.replace('all-cases-for-', '') + '&filter.cnt.tags=' + encodeURI(term);
    };
    var updateLaunchUrl = function (id) {
        return getProjectBase() + '/launch/' + id + '/update';
    };

    var deleteLaunchUrl = function (id) {
        return getProjectBase() + '/launch/' + id;
    };
    var updateTestItemUrl = function (id) {
        return getProjectBase() + '/item/' + id + '/update';
    };
    var deleteTestItemUrl = function (id) {
        return getProjectBase() + '/item/' + id;
    };
    var launchAnalyzeUrl = function (id) {
        return getProjectBase() + '/launch/' + id + '/analyze/history';
    };
    var launchMatchUrl = function (id) {
        return getProjectBase() + '/launch/' + id + '/analyze/single';
    };
    var launchFinishUrl = function (id) {
        return getProjectBase() + '/launch/' + id + '/stop';
    };
    var updateProject = function (id) {
        id = id || config.project.projectId;
        return config.apiVersion + 'project/' + id;
    };
    var updateEmailProjectSettings = function (id) {
        id = id || config.project.projectId;
        return config.apiVersion + 'project/' + id + '/emailconfig';
    };

    var createExternalSystem = function () {
        return getProjectBase() + "/external-system";
    };
    var updateExternalSystem = function (id) {
        return getProjectBase() + "/external-system/" + id;
    };
    var clearExternalSystem = function () {
        return getProjectBase() + "/external-system/clear";
    };
    var projectUsers = function (query) {
        return updateProject() + '/users' + (query ? '?page.page=1&page.size=50&page.sort=login,ASC&filter.cnt.name=' + query : '');
    };
    var userByEmail = function (query) {
        return updateProject() + '/users' + (query ? '?page.page=1&page.size=50&page.sort=login,ASC&filter.cnt.email=' + query : '');
    };
    var updateProjectUnassign = function (projectId) {
        return updateProject(projectId) + '/unassign';
    };
    var updateProjectAssign = function (projectId) {
        return updateProject(projectId) + '/assign';
    };
    var widget = function () {
        return getProjectBase() + '/widget';
    };
    var chart = function () {
        return getChartProjectBase() + '/widget';
    };
    var widgetById = function (id) {
        return widget() + "/" + id;
    };
    var chartById = function (id) {
        return chart() + "/" + id;
    };
    var widgetNames = function () {
        return getProjectBase() + '/widget/names/all';
    };
    var itemByKey = function (key) {
        return getProjectBase() + '/item/' + key;
    };
    var itemsByKeys = function (keys) {
        return getProjectBase() + '/item/items?ids=' + keys.join(',');
    };
    var loadHistory = function (id) {
        return getProjectBase() + '/item/history/?ids=' + id + '&history_depth=10';
    };
    var loadActivityItems = function (id) {
        return getProjectBase() + '/activity/item/' + id;
    };
    var dashboard = function () {
        return getProjectBase() + '/dashboard';
    };
    var dashboardById = function (id) {
        return dashboard() + '/' + id;
    };
    var dashboardShared = function () {
        return dashboard() + '/shared';
    };
    var redirectToDashboard = function (id) {
        return "#" + config.project.projectId + '/dashboard' + (id ? '/' + id : '');
    };
    var favorites = function () {
        return getProjectBase() + '/favorites';
    };
    var favoritesByResourceId = function (id) {
        return favorites() + '?resource_id=' + id + '&resource_type=DASHBOARD';
    };
    var compareByIds = function (ids) {
        return getProjectBase() + '/launch/compare?ids=' + ids;
    };
    var btsFields = function (id) {
        return getProjectBase() + '/external-system/' + id + '/fields-set?issuetype=BUG';
    };
    var postBug = function (id) {
        return getProjectBase() + '/external-system/' + id + '/ticket';
    };
    var loadBugs = function () {
        return itemBase() + '/issue/add';
    };
    var getBtsTicket = function (ticketId, systemId) {
        return getProjectBase() + "/external-system/" + systemId + "/ticket/" + ticketId;
    };
    var itemBase = function () {
        return getProjectBase() + "/item";
    };
    var historyGrid = function (ids, depth) {
        return itemBase() + "/history?ids=" + ids.toString() + "&history_depth=" + depth;
    };
    var historyGridUrl = function (ids, depth) {
        return window.location.hash + "/history?ids=" + ids.join(',') + "&history_depth=" + depth;
    };
    var adminProjectRoot = function () {
        return config.apiVersion + "project";
    };
    var adminProjectRootId = function (id) {
        return adminProjectRoot() + "/" + id;
    };

    var getAdminSettings = function (id) {
        return config.apiVersion + "settings/" + id;
    };

    var setAdminSettings = function (id) {
        return config.apiVersion + "settings/" + id +'/email';
    };

    var deleteEmailSettings = function(id){
        return config.apiVersion + "settings/" + id +'/email';
    };

    var adminAuthSettings = function(){
        return '/uat/settings/default/oauth/github';
    };

    var adminProjects = function (data) {
        return adminProjectRoot() + "/list" + (data ? data : '');
    };
    var adminProject = function (id) {
        return adminProjects() + "/" + id;
    };
    var addMemberUrl = function () {
        return config.apiVersion + "user";
    };
    var userUrl = function () {
        return addMemberUrl() + "/" + config.userModel.get('name');
    };
    var sendInviteUrl = function () {
        return config.apiVersion + 'user/bid';
    };
    var registerUserUrl = function (id) {
        return config.apiVersion + 'user/registration?uuid=' + id;
    };
    var validateRegisterBidUrl = function (id) {
        return config.apiVersion + 'user/registration?uuid=' + id;
    };

    var allUsersUrl = function (query) {
        if(query) return config.apiVersion + 'user/all?'+query;
        return config.apiVersion + 'user/all';
    };
    
    var searchUsersUrl = function(query) {
        var query = query;
        if(!query) query = {};
        if(!query.page) query.page = 1;
        if(!query.size) query.size = 10;
        var startUrl = config.apiVersion + 'user/';
        var sort = '';
        if(query.search){
            startUrl += 'search/' + query.search
            sort = '&page.sort=login,ASC';
        }else {
            startUrl += 'all';
            sort = '&page.sort=login,ASC';
        }
        return startUrl + '?page.page=' + query.page + '&page.size=' + query.size + sort;
    };

    var modifyUserUrl = function (id) {
        return config.apiVersion + 'user/' + id;
    };

    var userInfoValidation = function () {
        return config.apiVersion + 'user/registration/info';
    };

    var getProjectNames = function () {
        return adminProjectRoot() + "/names";
    };
    var getMembers = function (projectId, query) {
        return updateProject(projectId) + "/users" + query;
    };
    var getAssignableMembers = function (projectId, query) {
        return updateProject(projectId) + "/assignable" + query;
    };
    var getMembersTab = function (tab) {
        return "#" + config.project.projectId + "/members/" + tab;
    };
    var checkStatusUpdate = function (ids) {
        return getProjectBase() + "/launch/status?ids=" + ids;
    };

    var detailsInterval = function (id, value) {
        return "#administrate/project-details/" + id + "?interval=" + value;
    };
    var detailsIntervalCall = function (id, value) {
        return adminProject(id) + "?interval=" + value + "M";
    };

    var initPassChange = function () {
        return config.apiVersion + 'user/password/restore';
    };
    var submitPassReset = function (key) {
        key = key ? '/' + key : '';
        return config.apiVersion + 'user/password/reset' + key;
    };
    var submitPassChange = function () {
        return config.apiVersion + 'user/password/change';
    };
    var projectDetailsWidgets = function (project, id, interval) {
        return adminProjectRootId(project) + '/widget/' + id + '?interval=' + interval + 'M';
    };
    var forAllCases = function () {
        return '/launches/all/all-cases-for-';
    };
    var allCasesSortingFilter = function () {
        return '?page.page=1&page.sort=start_time,ASC&filter.eq.has_childs=false&';
    };
    var sortingFilter = function () {
        return '?page.page=1&page.sort=start_time,ASC&';
    };
    var getFile = function () {
        return getProjectBase() + '/data/';
    };
    var getFileById = function(dataId) {
        var token = config.userModel.get('token');
        var params = '';
        if(token) {
            params = '?access_token=' + token.split(' ')[1];
        }
        return getProjectBase() + '/data/' + dataId + params;
    };
    var uploadPhoto = function () {
        return config.apiVersion + 'data/photo';
    };
    var generateUUID = function () {
        return config.apiVersion + 'user/uuid';
    };
    var updateGitHubProfile  = function(){
        return '/uat/sso/me/github/synchronize';
    };
    var exportLaunchUrl = function (id, format) {
        return config.apiVersion + config.project.projectId + '/launch/' + id + '/report?view=' + (format || 'xls');
    };

    var getDefectTypes = function(projectId){
        return config.apiVersion + projectId + '/settings/';
    }
    
    var postDefectTypes = function(projectId){
        return config.apiVersion + projectId + '/settings/sub-type/';
    }
    var getExternalSystems = function() {
        return '/composite/extensions';
    };
    
    var getGridUrl = function (type, isDebug) {
        switch (type) {
            case 'suit':
            case 'test':
                type = 'item';
                break;
            case 'launch':
                type = isDebug ? (type + '/mode') : type;
                break;
            default :
                break;
        }
        return getProjectBase() + "/" + type;
    };
    var getLogsUrl = function() {
        return getProjectBase() + "/log";
    };

    var getLaunchItemUrl = function(type, id){
        return getGridUrl(type) + '/' + id;
    };

    var postDemoDataUrl = function(){
        return config.apiVersion + 'demo/' + config.project.projectId;
    };

    return {
        getApiToken: getApiToken,

        userLogout: userLogout,
        userLogin: userLogin,

        getRegistryInfo: getRegistryInfo,
        
        getAvatar: getAvatar,
        getProjectBase: getProjectBase,
        getChartProjectBase: getChartProjectBase,
        getFilters: getFilters,
        saveFilter: saveFilter,
        filterNames: filterNames,
        filterNamesShared: filterNamesShared,
        widgetNamesShared: widgetNamesShared,
        ownFilters: ownFilters,
        sharedFilters: sharedFilters,

        widgetsShared: widgetsShared,
        getPreferences: getPreferences,
        getProject: getProject,
        updateFilter: updateFilter,
        filtersBase: filtersBase,
        launchesBase: launchesBase,
        getLaunchStop: getLaunchStop,
        userDebugBade: userDebugBade,
        updateLaunchUrl: updateLaunchUrl,
        deleteLaunchUrl: deleteLaunchUrl,
        updateTestItemUrl: updateTestItemUrl,
        deleteTestItemUrl: deleteTestItemUrl,
        launchAnalyzeUrl: launchAnalyzeUrl,
        launchMatchUrl: launchMatchUrl,
        launchFinishUrl: launchFinishUrl,
        tabUrl: tabUrl,

        getLaunchBase: getLaunchBase,
        getMerge: getLaunchMerge,
        getLaunchUpdate: getLaunchUpdate,
        queryByTags: queryByTags,
        queryByLaunchName: queryByLaunchName,
        userAutoCompleteUrl: userAutoCompleteUrl,
        autocompleteUserUrl: autocompleteUserUrl,
        tagsLaunchAutoCompleteUrl: tagsLaunchAutoCompleteUrl,
        updateProject: updateProject,
        updateEmailProjectSettings: updateEmailProjectSettings,
        createExternalSystem: createExternalSystem,
        updateExternalSystem: updateExternalSystem,
        clearExternalSystem: clearExternalSystem,
        projectUsers: projectUsers,
        getBtsTicket: getBtsTicket,
        updateProjectUnassign: updateProjectUnassign,
        updateProjectAssign: updateProjectAssign,
        widget: widget,
        chart: chart,
        widgetById: widgetById,
        chartById: chartById,
        widgetNames: widgetNames,
        itemByKey: itemByKey,
        itemsByKeys: itemsByKeys,
        loadHistory: loadHistory,
        loadActivityItems: loadActivityItems,
        dashboard: dashboard,
        dashboardById: dashboardById,
        dashboardShared: dashboardShared,
        redirectToDashboard: redirectToDashboard,
        favorites: favorites,
        favoritesByResourceId: favoritesByResourceId,
        compareByIds: compareByIds,

        btsFields: btsFields,
        postBug: postBug,
        loadBugs: loadBugs,
        itemBase: itemBase,
        historyGrid: historyGrid,
        historyGridUrl: historyGridUrl,

        adminProjectRoot: adminProjectRoot,
        adminProjectRootId: adminProjectRootId,
        adminProjects: adminProjects,
        adminProject: adminProject,
        getAdminSettings: getAdminSettings,
        setAdminSettings: setAdminSettings,
        deleteEmailSettings: deleteEmailSettings,
        projectDetailsWidgets: projectDetailsWidgets,
        addMemberUrl: addMemberUrl,
        userUrl: userUrl,
        sendInviteUrl: sendInviteUrl,
        validateRegisterBidUrl: validateRegisterBidUrl,
        registerUserUrl: registerUserUrl,
        filterById: filterById,
        userInfoValidation: userInfoValidation,

        allUsersUrl: allUsersUrl,
        searchUsersUrl: searchUsersUrl,
        modifyUserUrl: modifyUserUrl,

        getProjectNames: getProjectNames,
        getMembers: getMembers,
        getAssignableMembers: getAssignableMembers,
        getMembersTab: getMembersTab,

        checkStatusUpdate: checkStatusUpdate,
        detailsInterval: detailsInterval,
        detailsIntervalCall: detailsIntervalCall,

        initPassChange: initPassChange,
        submitPassReset: submitPassReset,
        submitPassChange: submitPassChange,

        uploadPhoto: uploadPhoto,
        getFile: getFile,
        getFileById: getFileById,
        generateUUID: generateUUID,
        updateGitHubProfile: updateGitHubProfile,
        exportLaunchUrl: exportLaunchUrl,

        getDefectTypes: getDefectTypes,
        postDefectTypes: postDefectTypes,
        
        getGridUrl: getGridUrl,
        getLogsUrl: getLogsUrl,
        getLaunchItemUrl: getLaunchItemUrl,

        userByEmail:userByEmail,
        postDemoDataUrl: postDemoDataUrl,
        getExternalSystems: getExternalSystems,
        adminAuthSettings: adminAuthSettings

    };
});
