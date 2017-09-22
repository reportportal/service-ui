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

    var _ = require('underscore');
    var Localization = require('localization');
    var LaunchStatisticsComboPieChart = require('newWidgets/widgets/launchExecutionAndIssueStatistics/index');

    var LastLaunchPieChartView = LaunchStatisticsComboPieChart.extend({
        initialize: function (options) {
            var contentFields = [
                'statistics$executions$total',
                'statistics$executions$passed',
                'statistics$executions$failed',
                'statistics$executions$skipped',
                'statistics$defects$product_bug',
                'statistics$defects$automation_bug',
                'statistics$defects$system_issue',
                'statistics$defects$to_investigate'
            ];
            this.model.setContentFields(contentFields);
            LaunchStatisticsComboPieChart.prototype.initialize.call(this, options);
        },
        getSeries: function () {
            var series = {};
            var contentFields = this.model.getContentFields();
            _.each(contentFields, function (i) {
                var fieldName = _.last(i.split('$'));
                var seriesId = _.map(fieldName.split('_'), function (item, i) { return (i !== 0 ? item.capitalize() : item); }).join('');
                var name = Localization.launchesHeaders[fieldName];
                if (name) {
                    series[seriesId] = {
                        key: name,
                        seriesId: seriesId,
                        color: this.getSeriesColor(fieldName),
                        values: []
                    };
                }
            }, this);
            this.series = series;
            return this.series;
        },
        redirectOnElementClick: function () {
            return false;
        }
    });

    return LastLaunchPieChartView;
});
