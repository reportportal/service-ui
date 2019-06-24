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

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.mostTimeConsumingTestCases,
                img: 'most-time-consuming.svg',
                description: Localization.widgets.mostTimeConsumingTestCasesDescription,
                widget_type: 'table', // TODO remove after refactoring,
                hasPreview: false,
                itemsCount: 20,
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'inputItems',
                    options: {
                        entity: 'launchName',
                        label: Localization.widgets.typeLaunchName,
                        placeholder: Localization.wizard.enterLaunchName,
                        minItems: 1,
                        maxItems: 1,
                        getValue: function (model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.launchNameFilter) {
                                return widgetOptions.launchNameFilter;
                            }
                            return [];
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            widgetOptions.launchNameFilter = value;
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: [
                            { name: Localization.launchesHeaders.passed, value: 'statistics$executions$passed' },
                            { name: Localization.launchesHeaders.failed, value: 'statistics$executions$failed' }
                        ],
                        notEmpty: true,
                        placeholder: Localization.wizard.choiceCriteria,
                        multiple: true,
                        getValue: function (model, self) {
                            var contentFields = model.getContentFields();
                            if (contentFields.length) {
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
                    control: 'switcher',
                    options: {
                        items: [
                            { name: Localization.widgets.barMode, value: 'barMode' },
                            { name: Localization.widgets.tableMode, value: 'tableMode' },

                        ],
                        action: 'switch_view_mode'
                    }
                },
                {
                    control: 'checkbox',
                    options: {
                        label: Localization.widgets.includeMethods,
                        getValue: function (model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.include_methods) {
                                return true;
                            }
                            return false;
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (value) {
                                widgetOptions.include_methods = [];
                            } else {
                                delete widgetOptions.include_methods;
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
