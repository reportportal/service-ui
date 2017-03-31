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

    var Epoxy = require('backbone-epoxy');
    var _ = require('underscore');
    var Util = require('util');
    var App = require('app');
    var Service = require('coreService');
    var Localization = require('localization');

    var config = App.getInstance();
    var SingletonAppModel = require('model/SingletonAppModel');
    var UserModel = require('model/UserModel');

    var LaunchSuiteStepItemModel = Epoxy.Model.extend({
        defaults: {
            approximateDuration: 0,
            description: '',
            id: '',
            isProcessing: false,
            isShared: false,
            mode: '',
            name: '',
            number: 0,
            owner: '',
            start_time: 0,
            end_time: 0,
            statistics: {
                defects: {},
                executions: {},
            },
            status: '',
            tags: '',
            type: '',

            //test step append
            has_childs: true,
            issue: '',

            select: false,
            invalidMessage: '',

            // append keys
            // level: '',
            parent_launch_owner: null,
            parent_launch_status: null,
            parent_launch_isProcessing: null,
            parent_launch_investigate: null,
        },
        computeds: {
            launch_owner: {
                deps: ['owner', 'parent_launch_owner'],
                get: function (owner, parent_launch_owner) {
                    return parent_launch_owner || owner;
                }
            },
            launch_status: {
                deps: ['status', 'parent_launch_status'],
                get: function (status, parent_launch_status) {
                    return parent_launch_status || status;
                }
            },
            launch_isProcessing: {
                deps: ['isProcessing', 'parent_launch_isProcessing'],
                get: function (isProcessing, parent_launch_isProcessing) {
                    if (parent_launch_isProcessing != null) {
                        return parent_launch_isProcessing;
                    }
                    return isProcessing;
                }
            },
            launch_toInvestigate: {
                deps: ['parent_launch_investigate', 'statistics'],
                get: function(parentLaunchInvestigate, statistics) {
                    if(parentLaunchInvestigate != null) {
                        return parentLaunchInvestigate;
                    }
                    var statistics = this.get('statistics');
                    if(statistics && statistics.defects && statistics.defects.to_investigate) {
                        return statistics.defects.to_investigate.total;
                    }
                    return 0;
                }
            },
            url: {
                deps: ['id', 'has_childs'],
                get: function (id, has_childs) {
                    if (has_childs) {
                        return window.location.hash.split('?')[0] + '/' + id;
                    }
                    return '';
                }
            },
            clearUrl: {
                deps: ['url'],
                get: function(url) {
                    return url.split('|')[0];
                }
            },
            numberText: {
                deps: ['number'],
                get: function (number) {
                    if (!number) {
                        return ''
                    }
                    return ' #' + number;
                }
            },
            sortTags: {
                deps: ['tags'],
                get: function () {
                    return _.sortBy(this.getTags(), function (t) {
                        return t.toUpperCase() === 'BUILD' || t.indexOf('uild') !== -1;
                    });
                }
            },
            startFormat: {
                deps: ['start_time'],
                get: function (startTime) {
                    return Util.dateFormat(startTime)
                }
            },
            startFromNow: {
                deps: ['startFormat'],
                get: function (startFormat) {
                    return Util.fromNowFormat(startFormat)
                }
            },
            formatEndTime: {
                deps: ['end_time'],
                get: function (endTime) {
                    return Util.dateFormat(endTime, true);
                }
            },
        },
        initialize: function() {
            this.validate = this.getValidate();
            this.listenTo(this, 'change:description change:tags', _.debounce(this.onChangeItemInfo, 10));
            this.appModel = new SingletonAppModel();
            this.userModel = new UserModel();
        },
        restorePath: function() {
            this.initComputeds();
        },
        getIssue: function () {
            try {
                return JSON.parse(this.get('issue'));
            } catch (err) {
                return {};
            }
        },
        setIssue: function (issue) {
            this.set({issue: JSON.stringify(issue)});
        },
        getTags: function () {
            try {
                return JSON.parse(this.get('tags'));
            } catch (err) {
                return [];
            }
        },
        setTags: function (tags) {
            this.set({issue: JSON.stringify(tags)});
        },
        getValidate: function () {
            var self = this;
            var isAdminLeadProjectMenedger = function() {
                return ( self.userModel.get('isAdmin') ||
                    self.userModel.getRoleForCurrentProject() == config.projectRolesEnum.lead ||
                    self.userModel.getRoleForCurrentProject() == config.projectRolesEnum.project_manager)
            };
            var result = {
                edit: function() {
                    if (self.get('launch_owner') != config.userModel.get('name') &&
                        !isAdminLeadProjectMenedger()) {
                        return 'You are not a launch owner';
                    }
                    return '';
                },
                merge: function () {
                    if (self.get('launch_owner') != config.userModel.get('name') &&
                        !isAdminLeadProjectMenedger()) {
                        return 'You are not a launch owner';
                    }
                    if (self.get('launch_status') == 'IN_PROGRESS') {
                        return 'Launch should not be in the status IN PROGRESS';
                    }
                    if (self.get('launch_isProcessing')) {
                        return 'Launch should not be processing by Auto Analysis';
                    }
                    return ''
                },
                changeMode: function () {
                    if (self.get('launch_owner') != config.userModel.get('name') &&
                        !isAdminLeadProjectMenedger()) {
                        return 'You are not a launch owner';
                    }
                    return ''
                },
                forceFinish: function() {
                    if (self.get('status') != 'IN_PROGRESS') {
                        return 'Launch is already finished';
                    }
                    if (self.get('launch_owner') != config.userModel.get('name') &&
                        !isAdminLeadProjectMenedger()) {
                        return 'You are not a launch owner';
                    }
                    return '';
                },
                editDefect: function(){
                    if (!self.get('issue')) {
                        return 'Item not has issue for edit';
                    }
                    return '';
                },
                remove: function() {
                    if (self.get('launch_owner') != config.userModel.get('name') &&
                        !isAdminLeadProjectMenedger()) {
                        return 'You are not a launch owner';
                    }
                    if (self.get('launch_status') == 'IN_PROGRESS') {
                        return 'Launch should not be in the status IN PROGRESS';
                    }
                    return '';
                },
                loadbug: function() {
                    var issue = self.getIssue();
                    if (!issue || !issue.issue_type) {
                        return Localization.launches.noIssuesLoad
                    }
                    if (!self.appModel.get('isBtsAdded')) {
                        return Localization.launches.configureTBSLoad;
                    }
                    if (self.get('launch_isProcessing')) {
                        return Localization.launches.launchIsProcessing;
                    }
                    return '';
                },
                postbug: function() {
                    var issue = self.getIssue();
                    if (!issue || !issue.issue_type) {
                        return Localization.launches.noIssues
                    }
                    if (!self.appModel.get('isBtsConfigure')) {
                        return Localization.launches.configureTBS;
                    }
                    if (self.get('launch_isProcessing')) {
                        return Localization.launches.launchIsProcessing;
                    }
                    return '';
                }
            }
            return result;
        },
        onChangeItemInfo: function() {
            var action = 'updateLaunch';
            if (this.get('type') != 'LAUNCH') {
                action = 'updateTestItem';
            }
            Service[action]({
                description: this.get('description'),
                tags: this.getTags(),
            }, this.get('id'))
                .done(function () {
                    Util.ajaxSuccessMessenger(action);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error);
                })
        },

    });

    return LaunchSuiteStepItemModel;
});
