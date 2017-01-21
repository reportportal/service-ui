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
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var MembersService = require('projectMembers/MembersService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');

    var config = App.getInstance();

    var setupUserSearch = function ($el, options) {
        options = options || {};
        var appModel = new SingletonAppModel(),
            validateUserProject = function(user){
                var projectId = appModel.get('projectId'),
                    userProjects = _.keys(user.assigned_projects);
                return _.contains(userProjects, projectId);
            },
            remoteUsers = [];
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
                callback({id: element.val(), text: element.val()});
            },
            formatResultCssClass: function (state) {
                if (remoteUsers.length == 0) {
                    return 'no-exact-match-user';
                }
            },
            createSearchChoice: function (term, data) {
                if (_.filter(data, function (opt) {
                        return opt.text.localeCompare(term) === 0;
                    }).length === 0) {
                    if(Util.validateEmail(term)){
                        return {
                            id: term,
                            text: term
                        };
                    }
                    return null;
                }
            },
            formatResult: function(data)  {
                return Util.templates('tpl-user-search-result', {user: data, imagePath: Util.updateImagePath(Urls.getAvatar() + data.id)});
            },
            query: function (query) {
                MembersService.getSearchUser({search: query.term})
                    .done(function (response) {
                        var data = {results: []};
                        remoteUsers = [];
                        _.each(response.content, function (item) {
                            remoteUsers.push(item);
                            data.results.push({
                                id: item.userId,
                                text: item.userId,
                                name: item.full_name,
                                disabled: validateUserProject(item)
                            });
                        });
                        query.callback(data);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error);
                    });
            }
        });
    };

    return {
        setupUserSearch: setupUserSearch
    };
});