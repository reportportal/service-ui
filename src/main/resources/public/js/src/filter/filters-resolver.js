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

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Filters = require('filter/filters');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Localization = require('localization');

    var defectTypeCollection = null;

    var Statistics = function () {
        var filters = [
            new Filters.StatisticModel({
                id: 'statistics$executions$total',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.StatisticModel({
                id: 'statistics$executions$passed',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.StatisticModel({
                id: 'statistics$executions$failed',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.StatisticModel({
                id: 'statistics$executions$skipped',
                condition: 'gte',
                options: filterStatsOptions()
            })
        ];
        filters = filters.concat(getDefectSubTypeFilters('product_bug'));
        filters = filters.concat(getDefectSubTypeFilters('automation_bug'));
        filters = filters.concat(getDefectSubTypeFilters('system_issue'));
        filters = filters.concat(getDefectSubTypeFilters('to_investigate'));
        return filters;
    };

    var getDefectSubTypeFilters = function(type){
        var subTypes = getDefectSubTypes(type);
        var filters = _.map(subTypes, function(subType) {
            return new  Filters.StatisticModel({
                id: 'statistics$defects$' + type + '$' + subType.get('locator'),
                condition: 'gte',
                label: Localization.filterNameById[type] + ' ' + subType.get('shortName'),
                longName: subType.get('longName'),
                subFilter: true,
                options: filterStatsOptions()
            })
        });
        var totalName = 'Total ' + Localization.filterNamePluralById[type];
        if(filters.length == 1) {
            totalName = Localization.filterNameById[type];
            filters = [];
        }
        filters.unshift(new  Filters.StatisticModel({
            id: 'statistics$defects$' + type + '$total',
            condition: 'gte',
            label: totalName,
            longName: totalName,
            subFilter: false,
            options: filterStatsOptions()
        }));

        return filters;
    };

    var getDefectSubTypes = function(type) {
        return defectTypeCollection.filter(function(subtype) {
            return subtype.get('typeRef').toUpperCase() == type.toUpperCase();
        });
    };

    var getDefectSubTypeList = function(type) {
        var subTypes = getDefectSubTypes(type);
        return _.map(subTypes, function(subType) {
            return {
                name: subType.get('longName'),
                value: subType.get('locator'),
                subOption: true,
                mainType: type
            }
        });
    };
    var getJoinDefectTypeList = function(types) {
        var result = [];
        _.each(types, function(type) {

            var sybTypes = getDefectSubTypeList(type);
            var locators = _.map(sybTypes, function(subtype) {
                return subtype.value;
            });
            var types = locators.join(',');
            if(sybTypes.length <= 1) {
                result.push({
                    name: Localization.filterNameById[type],
                    value: types,
                });
            } else {
                result.push({
                    name: 'All ' + Localization.filterNamePluralById[type],
                    value: types,
                    subType: type
                });
                result = result.concat(sybTypes);
            }
            
        });
        return result;
    };

    var TestFilters = function () {
        var issueTypes = [{name: 'All', value: 'all'}];
        issueTypes = issueTypes.concat(getJoinDefectTypeList([
            'to_investigate',
            'product_bug',
            'automation_bug',
            'system_issue',
            'no_defect'
        ]));
        return [
            new Filters.StatusModel({
                id: 'type',
                condition: 'in',
                values: ['All', 'Before Suite',
                    'Before Groups',
                    'Before Class',
                    'Before Test',
                    'Test Class',
                    'Before Method',
                    'Test',
                    'After Method',
                    'After Test',
                    'After Class',
                    'After Groups',
                    'After Suite'],
                value: 'All'
            }),
            new Filters.Model({
                id: 'description',
                condition: 'cnt',
                options: filterNameOptions()
            }),
            new Filters.StatusModel({
                id: 'status',
                condition: 'in',
                values: ['All', 'Passed', 'Failed', 'Skipped', 'Interrupted', 'In Progress'],
                value: 'All'
            }),
            new Filters.TimerModel({
                id: 'start_time',
                condition: 'btw',
                values: ['Any'],
                value: ''
            }),
            new Filters.StatusModel({
                id: 'issue$issue_type',
                condition: 'in',
                values: issueTypes,
                value: 'All'
            }),
            new Filters.Model({id: 'issue$issue_comment', condition: 'cnt'}),
            new Filters.TagsModel({
                id: 'tags',
                condition: 'has',
                options: filterTagsOptions()
            })
        ];
    };

    var allLaunchesFilters = function () {
        var launchFilters = LaunchStepFilters();
        launchFilters.add(new Filters.UserModel({id: 'user', condition: 'in'}), {at: 1});
        return launchFilters;
    };

    var UserDebugFilters = function (userId) {
        var launchFilters = LaunchStepFilters();
        // place user filter on the second place but first is required Name filter so we insert at index 2
        launchFilters.add(new Filters.UserModel({id: 'user', condition: 'in', mode: 'DEBUG'}), {at: 1});
        return launchFilters;
    };

    var LaunchStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.Model({
                    id: 'name',
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions()
                }),
                new Filters.TimerModel({
                    id: 'start_time',
                    condition: 'btw',
                    values: ['Any'],
                    value: ''
                }),
                new Filters.Model({
                    id: 'description',
                    condition: 'cnt',
                    options: filterNameOptions()
                }),
                new Filters.TagsModel({
                    id: 'tags',
                    condition: 'has',
                    options: filterTagsOptions()
                })
            ].concat(Statistics())
        );
    };

    var TestStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.Model({
                    id: 'name',
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions()
                })
            ].concat(TestFilters())
        );
    };

    var LogFilters = function () {
        return [
            new Filters.TimerModel({
                id: 'time',
                condition: 'btw',
                values: ['Any'],
                value: ''
            }),
            new Filters.StatusModel({
                id: 'level',
                condition: 'in',
                values: ['Any', 'Trace', 'Debug', 'Info', 'Warn', 'Error'],
                value: 'Any'
            }),
            new Filters.Model({id: 'ex.binary_content'})
        ];
    };

    var LogStepFilters = function () {
        return new Backbone.Collection(
            [new Filters.Model({id: 'message', required: true, condition: 'cnt'})].concat(LogFilters())
        );
    };

    var HistoryStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.SelectModel({
                    name: 'History Depth',
                    id: 'history_depth',
                    noConditions: true,
                    required: true,
                    values: [{value: '3', name: '3'}, {value: '5', name: '5'}, {value: '10', name: '10'}],
                    value: '3'
                })
            ]
        );
    };

    var filterNameOptions = function () {
        return [
            {id: 'cnt', shortCut: 'cnt'},
            {id: '!cnt', shortCut: '!cnt'},
            {id: 'eq', shortCut: 'eq'},
            {id: 'ne', shortCut: '!eq'}
        ];
    };

    var filterTagsOptions = function () {
        return [
            {id: 'has', shortCut: 'and'},
            {id: 'in', shortCut: 'or'}
        ]
    };

    var filterStatsOptions = function () {
        return [
            {id: 'gte', shortCut: '&ge;'},
            {id: 'lte', shortCut: '&le;'},
            {id: 'eq', shortCut: '='}
        ]
    };

    var getDefaults = function (type, userId) {
        defectTypeCollection = new SingletonDefectTypeCollection();
        var async = $.Deferred();
        var type = type || "launch";
        if (userId) {
            type = 'userdebug';
        }
        defectTypeCollection.ready.done(function() {
            if (type) {
                var filtersSet = null;
                switch (type) {
                    case 'launch':
                        filtersSet = allLaunchesFilters();
                        break;
                    case 'suit':
                        filtersSet = LaunchStepFilters();
                        break;
                    case 'userdebug':
                        filtersSet = UserDebugFilters(userId);
                        break;
                    case 'test':
                        filtersSet = TestStepFilters();
                        break;
                    case 'log':
                        filtersSet = LogStepFilters();
                        break;
                    case 'history':
                        filtersSet = HistoryStepFilters();
                        break;
                    default:
                        break;
                }
                async.resolve(filtersSet);
            }
        });
        return async.promise();
    };

    return {
        getDefaults: getDefaults
    };
});