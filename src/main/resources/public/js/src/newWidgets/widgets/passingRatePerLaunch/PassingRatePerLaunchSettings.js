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
    var Localization = require('localization');

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.passingRatePerLaunchChart,
                img: 'passing-rate-launch.svg',
                description: Localization.widgets.passingRatePerLaunchChartDescription,
                widget_type: 'bar_chart', // TODO remove after refactoring,
                hasPreview: true
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
                        placeholder: Localization.widgets.selectLaunch,
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
                    control: 'switcher',
                    options: {
                        items: [
                            { name: Localization.widgets.barMode, value: 'barMode' },
                            { name: Localization.widgets.pieChartMode, value: 'pieChartMode' }
                        ],
                        action: 'switch_view_mode'
                    }
                },
                {
                    control: 'static',
                    options: {
                        action: 'limit',
                        value: 30
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
