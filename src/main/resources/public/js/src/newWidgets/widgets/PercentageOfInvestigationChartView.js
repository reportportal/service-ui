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
    var App = require('app');
    var Moment = require('moment');
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var PercentageOfInvestigationChart = ChartWidgetView.extend({
        disabledSeries: [],
        getSortedItems: function () {
            var items = [];
            _.each(this.model.getContent(), function (val, key) {
                var value = val[0];
                var item = _.extend({}, value.values);
                var arr = key.split('-');
                var week = parseInt(arr[1].substr(1));
                var date = Moment(key);
                if (this.model.get('interval') === 1) {
                    item.startTime = Moment(key, 'YYYY-MM-DD').unix();
                } else {
                    item.week = week;
                    item.startTime = date.unix();
                    item.endTime = date.add('day', 6).unix();
                }
                items.push(item);
            }, this);
            items.sort(function (a, b) {
                return a.startTime - b.startTime;
            });
            return items;
        },
        getData: function () {
            var data = [];
            var items = this.getSortedItems();
            var series = {
                toInvestigate: { key: Localization.widgets.toInvestigate },
                investigated: { key: Localization.widgets.investigated }
            };
            this.categories = [];
            if (!_.isEmpty(this.model.getContent())) {
                _.each(series, function (val, key) {
                    val.color = this.getSeriesColor(key === 'toInvestigate' ? 'to_investigate' : key);
                    val.values = [];
                    this.disabledSeries.push(false);
                }, this);
                _.each(items, function (item, i) {
                    var value = {};
                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;
                    this.categories.push(_.clone(value));
                    value.x = i + 1;
                    _.each(series, function (val, key) {
                        val.values.push(_.clone(_.extend({ y: parseFloat(item[key]) }, value)));
                    }, this);
                }, this);
                data = _.values(series);
            }
            return data;
        },
        formatCategories: function (d) {
            var date = this.categories[d - 1] || {};
            if (!_.isEmpty(date)) {
                if (date.endTime) {
                    return date.week;
                }
                return Moment.unix(date.startTime).format('DD');
            }
            return undefined;
        },
        tooltipContent: function (data) {
            var self = this;
            var format = config.widgetTimeFormat;
            return function (key, x, y, e) {
                var toolTip = '';
                var index = e.pointIndex;
                var start = Moment.unix(e.point.startTime).format(format);
                var end = e.point.endTime ? Moment.unix(e.point.endTime).format(format) : null;
                var time = end ? (start + ' - ' + end) : start;
                toolTip = '<p style="text-align:left"><strong>' + time + '</strong><br/></p>';
                _.each(data, function (val, i) {
                    if (!self.disabledSeries[i]) {
                        toolTip += '<div style="text-align:left; margin-right: 14px; margin-bottom: 10px;"><div style="width: 8px; height: 8px; display: inline-block; margin: 0 7px 0 14px; background: ' + val.color + '"></div>' + val.key + ':<strong> ' + val.values[index].y + '% </strong></div>';
                    }
                });
                return toolTip;
            };
        },
        // PERCENTAGE OF INVESTIGATIONS
        render: function () {
            var self = this;
            var isWeeks = parseInt(this.model.get('interval'), 10) !== 1;
            var data = this.getData();
            var tooltip = this.tooltipContent(data);
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
                .reduceXTicks(true)
                .showControls(false)
                .stacked(true)
                .clipEdge(true)
                .showXAxis(true)
                .yDomain([0, 100])
                .tooltips(!self.isPreview)
                .showLegend(false)
            ;

            this.chart.dispatch.on('stateChange', function (e) {
                self.disabledSeries = e.disabled;
            });

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function (d) {
                    return d3.round(_.isNaN(d) ? 0 : d) + '%';
                });

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
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

            vis.filter( function (filterData) {
                if (_.isEmpty(filterData)) {
                    $(this).closest('div').append('<div class="no-data-available"></div>');
                }
            }, this);
            this.addResize();
        }
    });

    return PercentageOfInvestigationChart;
});
