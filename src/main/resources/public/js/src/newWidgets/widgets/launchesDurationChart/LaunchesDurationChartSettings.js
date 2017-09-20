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
                gadget_name: Localization.widgets.durationChart,
                img: 'launches-duration-chart.svg',
                description: Localization.widgets.durationChartDescription,
                widget_type: 'column_chart', // TODO remove after refactoring,
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
                            { name: Localization.widgets.allLaunches, value: 'all' },
                            { name: Localization.widgets.latestLaunches, value: 'latest' }
                        ],
                        action: 'switch_latest_mode'
                    }
                },
                {
                    control: 'static',
                    options: {
                        action: 'criteria',
                        fields: ['start_time', 'end_time', 'name', 'number', 'status']
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
