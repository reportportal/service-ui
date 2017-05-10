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

    var Util = require('util');
    var _ = require('underscore');
    var MembersService = require('projectMembers/MembersService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var UserModel = require('model/UserModel');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');

    var setupUserSearch = function ($el, options) {
        var appModel = new SingletonAppModel();
        var projectConfig = appModel.get('configuration');
        var validateUserProject = function (user) {
            var answer = false;
            var projectId;
            var userProjects;
            var userId;
            if (user.assigned_projects) { // for admin part
                projectId = appModel.get('projectId');
                userProjects = _.keys(user.assigned_projects);
                answer = _.contains(userProjects, projectId);
            } else {
                userId = user.userId || user.id;
                _.each(appModel.get('users'), function (userInfo, id) {
                    if (id === userId) {
                        answer = true;
                        return false;
                    }
                });
            }
            return answer;
        };
        var validateForExternalUsers = function (user) {
            var answer = false;
            var isInternalProject = projectConfig && (projectConfig.entryType === 'INTERNAL' || projectConfig.entryType === 'PERSONAL');
            if (user.account_type !== 'INTERNAL' && !isInternalProject) {
                answer = true;
            }
            return answer;
        };
        var remoteUsers = [];
        Util.setupSelect2WhithScroll($el, {
            min: 1,
            minimumInputLength: 1,
            maximumInputLength: 256,
            maximumSelectionSize: 1,
            multiple: false,
            dropdownCssClass: 'rp-select2-user-search',
            allowClear: true,
            placeholder: Localization.members.enterLoginEmail,
            initSelection: function (element, callback) {
                callback({ id: element.val(), text: element.val() });
            },
            formatResultCssClass: function () {
                if (remoteUsers.length === 0) {
                    return 'no-exact-match-user';
                }
                return '';
            },
            createSearchChoice: function (term, data) {
                if (_.filter(data, function (opt) {
                    return opt.text.localeCompare(term) === 0;
                }).length === 0) {
                    if (Util.validateEmail(term) && !remoteUsers.length) {
                        return {
                            id: term,
                            text: term
                        };
                    }
                    return null;
                }
            },
            formatResult: function (data) {
                return Util.templates('tpl-user-search-result', {
                    user: data,
                    imagePath: Util.updateImagePath(Urls.getAvatar() + data.id)
                });
            },
            query: function (query) {
                var userModel = new UserModel();
                var getUserData = function (response) {
                    var data = { results: [] };
                    remoteUsers = [];
                    _.each(response.content, function (item) {
                        var isAddedUser = validateUserProject(item);
                        var isExternalUser = validateForExternalUsers(item);
                        var title = isAddedUser ? Localization.members.alredyAdded :
                            isExternalUser ? Util.replaceTemplate(Localization.members.externalUserAdded, item.account_type, projectConfig.entryType) : '';
                        remoteUsers.push(item);
                        data.results.push({
                            id: item.userId,
                            text: item.userId,
                            name: item.full_name,
                            disabled: isAddedUser || isExternalUser,
                            isExternalUser: isExternalUser,
                            isAddedUser: isAddedUser,
                            title: title
                        });
                    });
                    return data;
                };
                if (userModel.get('isAdmin')) {
                    MembersService.getSearchUser({ search: query.term })
                        .done(function (response) {
                            query.callback(getUserData(response));
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error);
                        });
                } else {
                    MembersService.getSearchUserSafe({ search: query.term })
                        .done(function (response) {
                            query.callback(getUserData(response));
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error);
                        });
                }
            }
        });
    };

    return {
        setupUserSearch: setupUserSearch
    };
});
