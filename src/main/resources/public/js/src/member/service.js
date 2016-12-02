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
    var urls = require('dataUrlResolver');
    var CallService = require('callService');
    var App = require('app');

    var call = CallService.call;
    var config = App.getInstance();

    var getQueryString = function(query){
        if(!query) query = {};
        if(!query.page) query.page = 1;
        if(!query.size) query.size = 10;
        return '?page.page=' + query.page + '&page.size=' + query.size + '&page.sort=login,ASC';
    };

    var getMembers = function (projectId, query) {
        var queryString = getQueryString(query);
        if(query.search){
            queryString += '&filter.cnt.name=' + query.search;
        }
        return call('GET', urls.getMembers(projectId, queryString));
    };
    var getAssignableMembers = function (projectId, query) {
        var queryString = getQueryString(query);
        if(query.search){
            queryString += '&filter.cnt.name=' + query.search;
        }
        return call('GET', urls.getAssignableMembers(projectId, queryString));
    };

    // var clearMembersCache = function (projectId) {
    //     cacheService.clear('assigned'+projectId);
    //     cacheService.clear('assignable'+projectId);
    // };

    var unAssignMember = function (memberId, projectId) {
        // clearMembersCache(projectId);
        return call('PUT', urls.updateProjectUnassign(projectId), {userNames: [memberId]});
    };

    var updateMember = function (role, userId, projectId) {
        // cacheService.clear('assigned'+projectId);
        var data = {};
        data[userId] = role;
        return call('PUT', urls.updateProject(projectId), {users: data});
    };

    var assignMember = function (data, projectId) {
        // clearMembersCache(projectId);
        return call('PUT', urls.updateProjectAssign(projectId), {userNames: data});
    };

    var addMember = function (data) {
        return call('POST', urls.addMemberUrl(), data);
    };

    var inviteMember = function (data) {
        return call('POST', urls.sendInviteUrl(), data);
    };

    var registerUser = function (data, id) {
        return call('POST', urls.registerUserUrl(id), data, null, true);
    };

    var updateUser = function (data, id, projects) {
        // for (var i =0; i < projects.length; i++) {
        //     cacheService.clear('assigned'+projects[i]);
        // }
        return call('PUT', urls.modifyUserUrl(id), data);
    };

    var validateRegisterBid = function (id) {
        return call('GET', urls.validateRegisterBidUrl(id));
    };

    return {
        assignMember: assignMember,
        getMembers: getMembers,
        getAssignableMembers: getAssignableMembers,
        unAssignMember: unAssignMember,
        updateMember: updateMember,
        updateUser: updateUser,

        addMember: addMember,
        inviteMember: inviteMember,
        validateRegisterBid: validateRegisterBid,
        registerUser: registerUser
    }

});