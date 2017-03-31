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

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Filters = require('filterEntities/FilterEntities');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Localization = require('localization');

    var defectTypeCollection = null;

    var Statistics = function () {
        var filters = [
            new Filters.EntityConditionInputModel({
                id: 'statistics$executions$total',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.EntityConditionInputModel({
                id: 'statistics$executions$passed',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.EntityConditionInputModel({
                id: 'statistics$executions$failed',
                condition: 'gte',
                options: filterStatsOptions()
            }),
            new Filters.EntityConditionInputModel({
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
            return new  Filters.EntityConditionInputModel({
                id: 'statistics$defects$' + type + '$' + subType.get('locator'),
                condition: 'gte',
                label: subType.get('longName'),
                name: Localization.filterNameById[type] + ' ' + subType.get('shortName'),
                subEntity: true,
                options: filterStatsOptions()
            })
        });
        var totalName = 'Total ' + Localization.filterNamePluralById[type];
        if(filters.length == 1) {
            totalName = Localization.filterNameById[type];
            filters = [];
        }
        filters.unshift(new  Filters.EntityConditionInputModel({
            id: 'statistics$defects$' + type + '$total',
            condition: 'gte',
            label: totalName,
            name: totalName,
            subEntity: false,
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
        var issueTypes = [{name: 'All', value: 'All'}];
        issueTypes = issueTypes.concat(getJoinDefectTypeList([
            'to_investigate',
            'product_bug',
            'automation_bug',
            'system_issue',
            'no_defect'
        ]));

        return [
            new Filters.EntitySelectModel({
                id: 'type',
                condition: 'in',
                values: [
                    {name: 'All', value: 'All'},
                    {name:'Before Suite', value: 'BEFORE_SUITE'},
                    {name: 'Before Groups', value: 'BEFORE_GROUPS'},
                    {name: 'Before Class', value: 'BEFORE_CLASS'},
                    {name: 'Before Test', value: 'BEFORE_TEST'},
                    {name: 'Test Class', value: 'TEST'},
                    {name: 'Before Method', value: 'BEFORE_METHOD'},
                    {name: 'Test', value: 'STEP'},
                    {name: 'After Method', value: 'AFTER_METHOD'},
                    {name: 'After Test', value: 'AFTER_TEST'},
                    {name: 'After Class', value: 'AFTER_CLASS'},
                    {name: 'After Groups', value: 'AFTER_GROUPS'},
                    {name: 'After Suite', value: 'AFTER_SUITE'},
                ],
                value: 'All'
            }),
            new Filters.EntityConditionInputModel({
                id: 'description',
                condition: 'cnt',
                options: filterNameOptions(),
                valueOnlyDigits: false,
            }),
            new Filters.EntitySelectModel({
                id: 'status',
                condition: 'in',
                values: [
                    {name: 'All', value: 'All'},
                    {name: 'Passed', value: 'PASSED'},
                    {name: 'Failed', value: 'FAILED'},
                    {name: 'Skipped', value: 'SKIPPED'},
                    {name: 'Interrupted', value: 'INTERRUPTED'},
                    {name: 'In Progress', value: 'IN_PROGRESS'},
                ],
                value: 'All'
            }),
            new Filters.EntityTimeRangeModel({
                id: 'start_time',
                condition: 'btw',
                values: ['Any'],
                value: ''
            }),
            new Filters.EntitySelectModel({
                id: 'issue$issue_type',
                condition: 'in',
                values: issueTypes,
                value: 'All'
            }),
            new Filters.EntityConditionInputModel({
                id: 'issue$issue_comment',
                valueMinLength: 3,
                condition: 'cnt',
                options: filterNameOptions(),
                valueOnlyDigits: false,
            }),
            new Filters.EntityConditionTagModel({
                id: 'tags',
                condition: 'has',
                options: filterTagsOptions()
            })
        ];
    };

    var UserDebugFilters = function (userId) {
        var launchFilters = LaunchStepFilters();
        // place user filter on the second place but first is required Name filter so we insert at index 2
        launchFilters.add(new Filters.EntityUserTagModel({id: 'user', condition: 'in', mode: 'DEBUG'}), {at: 1});
        return launchFilters;
    };

    var LaunchStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.EntityConditionInputModel({
                    id: 'name',
                    name: 'Launch Name',
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueMaxLength: 256,
                    valueOnlyDigits: false,
                }),
                new Filters.EntityTimeRangeModel({
                    id: 'start_time',
                    condition: 'btw',
                    values: ['Any'],
                    value: ''
                }),
                new Filters.EntityConditionInputModel({
                    id: 'description',
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueOnlyDigits: false,
                }),
                new Filters.EntityConditionTagModel({
                    id: 'tags',
                    condition: 'has',
                    options: filterTagsOptions()
                })
            ].concat(Statistics())
        );
    };

    var LaunchEntities = function () {
        var launchSuiteEntitiesCollection = LaunchSuiteEntities();
        launchSuiteEntitiesCollection.unshift(new Filters.EntityConditionInputModel({
            id: 'name',
            name: 'Launch Name',
            required: true,
            condition: 'cnt',
            options: filterNameOptions(),
            valueMinLength: 3,
            valueMaxLength: 256,
            valueOnlyDigits: false,
        }));
        launchSuiteEntitiesCollection.add(new Filters.EntityUserTagModel({id: 'user', condition: 'in'}), {at: 1});
        return launchSuiteEntitiesCollection;
    };
    var SuiteEntities = function() {
        var launchSuiteEntitiesCollection = LaunchSuiteEntities();
        launchSuiteEntitiesCollection.unshift(new Filters.EntityConditionInputModel({
            id: 'name',
            name: 'Suite Name',
            required: true,
            condition: 'cnt',
            options: filterNameOptions(),
            valueMinLength: 3,
            valueMaxLength: 256,
            valueOnlyDigits: false,
        }));
        return launchSuiteEntitiesCollection;
    };
    var LaunchSuiteEntities = function() {
        return new Backbone.Collection(
            [
                new Filters.EntityTimeRangeModel({
                    id: 'start_time',
                    condition: 'btw',
                    values: ['Any'],
                    value: ''
                }),
                new Filters.EntityConditionInputModel({
                    id: 'description',
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueOnlyDigits: false,
                }),
                new Filters.EntityConditionTagModel({
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
                new Filters.EntityConditionInputModel({
                    id: 'name',
                    name: 'Test Name',
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueMaxLength: 256,
                    valueOnlyDigits: false,
                })
            ].concat(TestFilters())
        );
    };

    var LogFilters = function () {
        return [
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
            [new Filters.EntityInputModel({
                id: 'message',
                condition: 'cnt',
                valueMinLength: 3,
                valueOnlyDigits: false,
            })].concat(LogFilters())
        );
    };

    var HistoryStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.EntityDropDownModel({
                    name: 'History Depth',
                    id: 'history_depth',
                    noConditions: true,
                    required: true,
                    options: [{value: '3', name: '3'}, {value: '5', name: '5'}, {value: '10', name: '10'}],
                    value: '10'
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
                        filtersSet = LaunchEntities();
                        break;
                    case 'suit':
                        filtersSet = SuiteEntities();
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

    var getInvalidModel = function() {
        return Filters.EntityInvalidModel;
    };

    return {
        getDefaults: getDefaults,
        getInvalidModel: getInvalidModel
    };
});
