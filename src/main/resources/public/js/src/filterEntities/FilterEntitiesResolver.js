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
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
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

    var getDefectSubTypeFilters = function (type) {
        var subTypes = getDefectSubTypes(type);
        var filters = _.map(subTypes, function (subType) {
            return new Filters.EntityConditionInputModel({
                id: 'statistics$defects$' + type + '$' + subType.get('locator'),
                condition: 'gte',
                label: subType.get('longName'),
                name: Localization.filterNameById[type] + ' ' + subType.get('shortName'),
                subEntity: true,
                options: filterStatsOptions()
            });
        });
        var totalName = Localization.favorites.total + ' ' + Localization.filterNamePluralById[type];
        if (filters.length == 1) {
            totalName = filters[0].get('label');
            filters = [];
        }
        filters.unshift(new Filters.EntityConditionInputModel({
            id: 'statistics$defects$' + type + '$total',
            condition: 'gte',
            label: totalName,
            name: totalName,
            subEntity: false,
            options: filterStatsOptions()
        }));

        return filters;
    };

    var getDefectSubTypes = function (type) {
        return defectTypeCollection.filter(function (subtype) {
            return subtype.get('typeRef').toUpperCase() == type.toUpperCase();
        });
    };

    var getDefectSubTypeList = function (type) {
        var subTypes = getDefectSubTypes(type);
        return _.map(subTypes, function (subType) {
            return {
                name: subType.get('longName'),
                value: subType.get('locator'),
                subOption: true,
                mainType: type
            };
        });
    };
    var getJoinDefectTypeList = function (types) {
        var result = [];
        _.each(types, function (type) {
            var sybTypes = getDefectSubTypeList(type);
            var locators = _.map(sybTypes, function (subtype) {
                return subtype.value;
            });
            var types = locators.join(',');
            if (sybTypes.length <= 1) {
                result.push({
                    name: Localization.filterNameById[type],
                    value: types
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
        var issueTypes = [{ name: 'All', value: 'All' }];
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
                    { name: Localization.testTableMethodTypes.ALL, value: 'All' },
                    { name: Localization.testTableMethodTypes.BEFORE_SUITE, value: 'BEFORE_SUITE' },
                    { name: Localization.testTableMethodTypes.BEFORE_GROUPS, value: 'BEFORE_GROUPS' },
                    { name: Localization.testTableMethodTypes.BEFORE_CLASS, value: 'BEFORE_CLASS' },
                    { name: Localization.testTableMethodTypes.BEFORE_TEST, value: 'BEFORE_TEST' },
                    { name: Localization.testTableMethodTypes.TEST, value: 'TEST' },
                    { name: Localization.testTableMethodTypes.BEFORE_METHOD, value: 'BEFORE_METHOD' },
                    { name: Localization.testTableMethodTypes.STEP, value: 'STEP' },
                    { name: Localization.testTableMethodTypes.AFTER_METHOD, value: 'AFTER_METHOD' },
                    { name: Localization.testTableMethodTypes.AFTER_TEST, value: 'AFTER_TEST' },
                    { name: Localization.testTableMethodTypes.AFTER_CLASS, value: 'AFTER_CLASS' },
                    { name: Localization.testTableMethodTypes.AFTER_GROUPS, value: 'AFTER_GROUPS' },
                    { name: Localization.testTableMethodTypes.AFTER_SUITE, value: 'AFTER_SUITE' }
                ],
                value: Localization.testTableMethodTypes.ALL
            }),
            new Filters.EntityConditionInputModel({
                id: 'description',
                condition: 'cnt',
                options: filterNameOptions(),
                valueOnlyDigits: false
            }),
            new Filters.EntitySelectModel({
                id: 'status',
                condition: 'in',
                values: [
                    { name: Localization.launchStatus.ALL, value: 'All' },
                    { name: Localization.launchStatus.PASSED, value: 'PASSED' },
                    { name: Localization.launchStatus.FAILED, value: 'FAILED' },
                    { name: Localization.launchStatus.SKIPPED, value: 'SKIPPED' },
                    { name: Localization.launchStatus.INTERRUPTED, value: 'INTERRUPTED' },
                    { name: Localization.launchStatus.IN_PROGRESS, value: 'IN_PROGRESS' }
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
                valueOnlyDigits: false
            }),
            new Filters.EntityConditionTagModel({
                id: 'tags',
                condition: 'has',
                options: filterTagsOptions()
            }),
            new Filters.EntityDropDownModel({
                id: 'issue$auto_analyzed',
                condition: 'in',
                options: [{ name: Localization.launches.withAA, value: 'TRUE' }, { name: Localization.launches.withoutAA, value: 'FALSE' }]
            }),
            new Filters.EntityDropDownModel({
                id: 'issue$ignore_analyzer',
                condition: 'in',
                options: [{ name: Localization.launches.withIgnoreAA, value: 'TRUE' }, { name: Localization.launches.withoutIgnoreAA, value: 'FALSE' }]
            }),
            new Filters.EntityDropDownModel({
                id: 'issue$externalSystemIssues$ticket_id',
                condition: 'ex',
                options: [{ name: Localization.launches.linkedBug, value: 'TRUE' }, { name: Localization.launches.noLinkedBug, value: 'FALSE' }],
            })
        ];
    };

    var UserDebugFilters = function (userId) {
        var launchFilters = LaunchStepFilters();
        // place user filter on the second place but first is required Name filter so we insert at index 2
        launchFilters.add(new Filters.EntityOwnerTagModel({ id: 'user', condition: 'in', mode: 'DEBUG' }), { at: 1 });
        return launchFilters;
    };

    var LaunchStepFilters = function () {
        return new Backbone.Collection(
            [
                new Filters.EntityConditionInputModel({
                    id: 'name',
                    name: Localization.filters.launchName,
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueMaxLength: 256,
                    valueOnlyDigits: false
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
                    valueOnlyDigits: false
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
            name: Localization.filters.launchName,
            required: true,
            condition: 'cnt',
            options: filterNameOptions(),
            valueMinLength: 3,
            valueMaxLength: 256,
            valueOnlyDigits: false
        }));
        launchSuiteEntitiesCollection.unshift(new Filters.EntityConditionInputModel({
            id: 'number',
            name: Localization.filters.launchNumber,
            condition: 'gte',
            options: filterStatsOptions(),
            valueOnlyDigits: true
        }));
        launchSuiteEntitiesCollection.add(new Filters.EntityOwnerTagModel({ id: 'user', condition: 'in' }), { at: 1 });
        return launchSuiteEntitiesCollection;
    };
    var SuiteEntities = function () {
        var launchSuiteEntitiesCollection = LaunchSuiteEntities();
        launchSuiteEntitiesCollection.unshift(new Filters.EntityConditionInputModel({
            id: 'name',
            name: Localization.filters.suiteName,
            required: true,
            condition: 'cnt',
            options: filterNameOptions(),
            valueMinLength: 3,
            valueMaxLength: 256,
            valueOnlyDigits: false
        }));
        return launchSuiteEntitiesCollection;
    };
    var LaunchSuiteEntities = function () {
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
                    valueOnlyDigits: false
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
                    name: Localization.filters.testName,
                    required: true,
                    condition: 'cnt',
                    options: filterNameOptions(),
                    valueMinLength: 3,
                    valueMaxLength: 256,
                    valueOnlyDigits: false
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
            new Filters.Model({ id: 'ex.binary_content' })
        ];
    };

    var LogStepFilters = function () {
        return new Backbone.Collection(
            [new Filters.EntityInputModel({
                id: 'message',
                condition: 'cnt',
                valueMinLength: 3,
                valueOnlyDigits: false
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
                    options: [{ value: '3', name: '3' }, { value: '5', name: '5' }, { value: '10', name: '10' }],
                    value: '10'
                })
            ]
        );
    };

    var filterNameOptions = function () {
        return [
            { id: 'cnt', shortCut: 'cnt' },
            { id: '!cnt', shortCut: '!cnt' },
            { id: 'eq', shortCut: 'eq' },
            { id: 'ne', shortCut: '!eq' }
        ];
    };

    var filterTagsOptions = function () {
        return [
            { id: 'has', shortCut: 'all' },
            { id: '!in', shortCut: '!all' },
            { id: 'in', shortCut: 'any' },
            { id: '!has', shortCut: '!any' }
        ];
    };

    var filterStatsOptions = function () {
        return [
            { id: 'gte', shortCut: '&ge;' },
            { id: 'lte', shortCut: '&le;' },
            { id: 'eq', shortCut: '=' }
        ];
    };

    var ProjectEventsFilters = function () {
        var infoModel = new SingletonRegistryInfoModel();
        var actionTypeValues = [{ name: 'All', value: 'All' }];
        var objectTypeValues = [{ name: 'All', value: 'All' }];

        _.each(infoModel.get('activitiesEventsTypes'), function (item) {
            actionTypeValues.push({
                name: Localization.projectEvents.eventTypes[item] ? Localization.projectEvents.eventTypes[item] : item,
                value: item
            });
        });
        _.each(infoModel.get('activitiesObjectTypes'), function (item) {
            objectTypeValues.push({
                name: Localization.projectEvents.objectTypes[item] ? Localization.projectEvents.objectTypes[item] : item,
                value: item
            });
        });
        return new Backbone.Collection([
            new Filters.EntitySelectModel({
                label: Localization.projectEvents.tableHeaders.action,
                name: Localization.projectEvents.tableHeaders.action,
                id: 'actionType',
                condition: 'in',
                required: true,
                values: actionTypeValues,
                value: 'All'
            }),
            new Filters.EntityTimeRangeModel({
                label: Localization.projectEvents.tableHeaders.time,
                name: Localization.projectEvents.tableHeaders.time,
                id: 'last_modified',
                condition: 'btw',
                values: ['Any'],
                value: ''
            }),
            new Filters.EntitySelectModel({
                label: Localization.projectEvents.tableHeaders.objectType,
                name: Localization.projectEvents.tableHeaders.objectType,
                id: 'objectType',
                condition: 'in',
                values: objectTypeValues,
                value: 'All'
            }),
            new Filters.EntityConditionInputModel({
                label: Localization.projectEvents.tableHeaders.oldVal,
                name: Localization.projectEvents.tableHeaders.oldVal,
                id: 'history$oldValue',
                condition: 'cnt',
                options: filterNameOptions(),
                valueMinLength: 3,
                valueMaxLength: 64,
                valueOnlyDigits: false
            }),
            new Filters.EntityConditionInputModel({
                label: Localization.projectEvents.tableHeaders.newVal,
                name: Localization.projectEvents.tableHeaders.newVal,
                id: 'history$newValue',
                condition: 'cnt',
                options: filterNameOptions(),
                valueMinLength: 3,
                valueMaxLength: 64,
                valueOnlyDigits: false
            }),
            new Filters.EntityMemberTagModel({
                label: Localization.projectEvents.tableHeaders.user,
                name: Localization.projectEvents.tableHeaders.user,
                id: 'userRef',
                condition: 'in'
            }),
            new Filters.EntityConditionInputModel({
                label: Localization.projectEvents.tableHeaders.objectName,
                name: Localization.projectEvents.tableHeaders.objectName,
                id: 'name',
                condition: 'cnt',
                options: filterNameOptions(),
                valueMinLength: 3,
                valueOnlyDigits: false
            })
        ]);
    };

    var getDefaults = function (type, userId) {
        defectTypeCollection = new SingletonDefectTypeCollection();
        var async = $.Deferred();
        var type = type || 'launch';
        if (userId) {
            type = 'userdebug';
        }
        defectTypeCollection.ready.done(function () {
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
                case 'projectEvents':
                    filtersSet = ProjectEventsFilters();
                    break;
                default:
                    break;
                }
                async.resolve(filtersSet);
            }
        });
        return async.promise();
    };

    var getInvalidModel = function () {
        return Filters.EntityInvalidModel;
    };

    return {
        getDefaults: getDefaults,
        getInvalidModel: getInvalidModel
    };
});
