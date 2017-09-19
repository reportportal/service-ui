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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Localization = require('localization');
    var Util = require('util');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var getItems = function () {
        var executions = [
            { name: Localization.launchesHeaders.total, value: 'statistics$executions$total' },
            { name: Localization.launchesHeaders.passed, value: 'statistics$executions$passed' },
            { name: Localization.launchesHeaders.failed, value: 'statistics$executions$failed' },
            { name: Localization.launchesHeaders.skipped, value: 'statistics$executions$skipped' }
        ];
        var allDefects = function () {
            var collection = new SingletonDefectTypeCollection();
            var pref = 'statistics$defects$';
            var subDefects = {};
            var defects = collection.toJSON();
            var issueTypes = Util.getIssueTypes();
            var result = [];
            _.each(issueTypes, function (type) {
                subDefects[type] = {};
            });
            _.each(defects, function (d) {
                var type = d.typeRef.toLowerCase();
                var key = pref + type + '$' + d.locator;
                subDefects[type][key] = d.longName;
            });
            _.each(_.values(subDefects), function (defectGroup) {
                _.each(defectGroup, function (defectName, defectKey) {
                    result.push({ name: defectName, value: defectKey });
                });
            });
            return result;
        };
        return executions.concat(allDefects());
    };

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.statisticsTrendChart,
                img: 'launch-statistics-trend-chart.svg',
                description: Localization.widgets.statisticsTrendChartDescription,
                widget_type: 'trends_chart', // TODO remove after refactoring,
                hasPreview: true
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'filters',
                    options: {
                    }
                },
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: getItems(),
                        placeholder: Localization.wizard.criteriaSelectTitle,
                        multiple: true,
                        getValue: function (model, self) {
                            var contentFields = model.getContentFields();
                            if (contentFields[0]) {
                                return contentFields;
                            }
                            return _.map(self.model.get('items'), function (item) {
                                return item.value;
                            });
                        },
                        setValue: function (value, model) {
                            model.setContentFields(value);
                        }
                    }
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.items,
                        min: 1,
                        max: 150,
                        def: 50,
                        numOnly: true,
                        action: 'limit'
                    }
                },
                {
                    control: 'switcher',
                    options: {
                        items: [
                            { name: Localization.widgets.launchMode, value: 'launch' },
                            { name: Localization.widgets.timelineMode, value: 'timeline' }
                        ],
                        action: 'switch_timeline_mode'
                    }
                },
                {
                    control: 'static',
                    options: {
                        action: 'metadata_fields',
                        fields: ['name', 'number', 'start_time']
                    }
                }
            ]);

            return async.promise();
        }
    };
});
