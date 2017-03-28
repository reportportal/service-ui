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

    var $ = require('jquery');
    var _ = require('underscore');
    var Moment = require('moment');
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');
    var App = require('app');

    var config = App.getInstance();

    var LaunchesQuantityChart = ChartWidgetView.extend({
        getData: function () {
            var data = [];
            var key = 'number_launches';
            var series = {};
            var contentData = this.model.getContent();

            if (!_.isEmpty(contentData)) {
                series.key = Localization.widgets.quantityLaunches;
                series.color = this.getSeriesColor(key);
                series.values = [];

                _.each(contentData, function (val, key) {
                    var value = val[0].values;
                    var item = {};
                    item.y = parseInt(value.count, 10);
                    item.startTime = Moment(value.start, 'YYYY-MM-DD').unix();
                    if (value.end) {
                        var w = parseInt(key.slice(key.indexOf('W') + 1), 10);
                        item.x = w || Moment(value.start, 'YYYY-MM-DD').week();
                        item.endTime = Moment(value.end, 'YYYY-MM-DD').unix();
                    } else {
                        item.x = Moment(value.start, 'YYYY-MM-DD').format('DD');
                    }
                    series.values.push(item);
                }, this);
                series.values.sort(function (a, b) { return a.startTime - b.startTime; });
                data.push(series);
            }
            return data;
        },
        tooltipContent: function () {
            var format = config.widgetTimeFormat;
            return function (key, x, y, e, graph) {
                var start = Moment.unix(e.point.startTime).format(format);
                var end = e.point.endTime ? Moment.unix(e.point.endTime).format(format) : null;
                return '<p style="text-align:left"><strong>' + y + '</strong> ' + Localization.widgets.launches + '</strong><br/>' + start + (end ? ' - ' + end : '') + '</p>';
            };
        },
        // QUANTITY OF LAUNCHES
        render: function () {
            var self = this;
            var data = this.getData();
            var isWeeks = this.model.get('interval') !== 1;
            var tooltip = this.tooltipContent();
            var vis;

            this.addSVG();

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({ top: 30, left: 40, right: 0, bottom: 40 })
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true)
                .showControls(false)
                .reduceXTicks(true)
                .defaultState(true)
                .tooltips(!self.isPreview)
                .tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function (d) {
                    return _.isNaN(d) ? 0 : d;
                });

            this.chart.xAxis
                .tickFormat(function (d) {
                    return d;
                })
                .axisLabel(
                    isWeeks
                        ? Localization.widgets.timeWeeks
                        : Localization.widgets.timeDays
                )
                .tickPadding(8);

            vis = d3.select($('svg', this.$el).get(0))
                .datum(data)
                .call(this.chart);

            vis.filter(function (filterData) {
                if (_.isEmpty(filterData)) {
                    $(this).closest('div').append('<div class="no-data-available"></div>');
                }
            }, this);

            this.addResize();
        }
    });

    return LaunchesQuantityChart;
});
