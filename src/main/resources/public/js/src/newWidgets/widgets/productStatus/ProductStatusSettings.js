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

    var staticColumns = ['total', 'passed', 'failed', 'skipped'];

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.productStatus,
                img: 'product-status.svg',
                description: Localization.widgets.productStatusDescription,
                widget_type: 'clean_widget' // TODO remove after refactoring
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'inputItems',
                    options: {
                        entity: 'filter',
                        label: Localization.wizard.filters,
                        placeholder: Localization.wizard.enterFilter,
                        minItems: 1,
                        getValue: function (model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.filters) {
                                return widgetOptions.filters;
                            }
                            if (model.get('filter_id')) {
                                return [model.get('filter_id')];
                            }
                            return [];
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            widgetOptions.filters = value;
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.wizard.basicColumns,
                        items: [
                            { name: Localization.launchesHeaders.start_time, value: 'start_time' },
                            { name: Localization.launchesHeaders.status, value: 'status' },
                            { name: Localization.launchesHeaders.product_bug, value: 'product_bug' },
                            { name: Localization.launchesHeaders.automation_bug, value: 'auto_bug' },
                            { name: Localization.launchesHeaders.system_issue, value: 'system_issue' },
                            { name: Localization.launchesHeaders.no_defect, value: 'no_defect' },
                            { name: Localization.launchesHeaders.to_investigate, value: 'to_investigate' }
                        ],
                        placeholder: Localization.wizard.choiceColumns,
                        multiple: true,
                        notEmpty: false,
                        getValue: function (model, self) {
                            var widgetOptions = model.getWidgetOptions();
                            var answer = [];
                            if (widgetOptions.basicColumns) {
                                _.each(widgetOptions.basicColumns, function (item) {
                                    if (!_.contains(staticColumns, item) && item !== 'passing_rate') {
                                        answer.push(item);
                                    }
                                });
                                return answer;
                            }
                            return _.map(self.model.get('items'), function (item) {
                                return item.value;
                            });
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            var cloneValue = _.clone(value);
                            var result = [];
                            if (cloneValue[0] === 'start_time') {
                                result = result.concat(cloneValue.shift());
                            }
                            if (cloneValue[0] === 'status') {
                                result = result.concat(cloneValue.shift());
                            }
                            result = result.concat(staticColumns);
                            result = result.concat(cloneValue);
                            result.push('passing_rate');
                            widgetOptions.basicColumns = result;
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'customColumns',
                    options: {
                        action: 'custom_columns'
                    }
                },
                {
                    control: 'switcher',
                    options: {
                        items: [
                            { name: 'All launches', value: 'all' },
                            { name: 'Latest launches', value: 'latest' }
                        ],
                        getValue: function (model, self) {
                            if (!model.getWidgetOptions().latest) {
                                return 'latest';
                            }
                            if (model.getWidgetOptions().latest[0]) {
                                return 'latest';
                            }
                            return 'all';
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (value === 'latest') {
                                widgetOptions.latest = [true];
                            } else {
                                widgetOptions.latest = [];
                            }
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'checkbox',
                    options: {
                        label: Localization.widgets.groupLaunchesByFilter,
                        getValue: function (model, self) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.distinctLaunches) {
                                return true;
                            }
                            return false;
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (value) {
                                widgetOptions.distinctLaunches = [];
                            } else {
                                delete widgetOptions.distinctLaunches;
                            }
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                }
            ]);

            return async.promise();
        }
    };
});
