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

    var IssuesTrendChart = ChartWidgetView.extend({
        disabledSeries: [],
        getCriteria: function () {
            return ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'];
        },
        getWeek: function (str) {
            return parseInt(str.slice(str.indexOf('-W') + 2), 10);
        },
        getSortedItems: function () {
            var items = [];
            _.each(this.model.getContent(), function (val, key) {
                var value = val[0];
                var item = _.extend({}, value.values);
                if (this.model.get('interval') === 1) {
                    item.startTime = Moment(key, 'YYYY-MM-DD').unix();
                } else {
                    var week = this.getWeek(key);
                    var date = Moment(key);
                    item.week = week;
                    item.startTime = date.unix();
                    item.endTime = date.add('day', 6).unix();
                }
                items.push(item);
            }, this);
            items.sort(function (a, b) { return a.startTime - b.startTime; });
            return items;
        },
        getSeries: function (criteria) {
            var series = {};
            _.each(criteria, function (item) {
                series[item] = {
                    color: this.getSeriesColor(item),
                    key: Localization.widgets[item],
                    values: []
                };
                this.disabledSeries.push(false);
            }, this);
            this.series = series;
            return this.series;
        },
        getData: function () {
            var data = [];
            this.categories = [];
            if (!_.isEmpty(this.model.getContent())) {
                var items = this.getSortedItems();
                var criteria = this.getCriteria();
                var series = this.getSeries(criteria);

                _.each(items, function (item, i) {
                    var value = {};
                    var total = 0;
                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;

                    this.categories.push(_.clone(value));
                    _.each(criteria, function (c) {
                        total += parseInt(item[c], 10);
                    });
                    _.each(series, function (val, key) {
                        value.x = i + 1;
                        value.y = total ? parseFloat(+((parseInt(item[key], 10) / total) * 100).toFixed(2).escapeNaN()) : 0;
                        val.values.push(_.clone(value));
                    });
                }, this);
                data = _.values(series);
            }
            return data;
        },
        tooltipContent: function (data) {
            var self = this;
            var format = config.widgetTimeFormat;
            return function (key, x, y, e, graph) {
                var toolTip = '';
                var index = e.pointIndex;
                var cat = self.categories[index];
                var start = Moment.unix(cat.startTime).format(format);
                var end = cat.endTime ? Moment.unix(cat.endTime).format(format) : null;
                var time = end ? (start + ' - ' + end) : start;
                toolTip = '<p style="text-align:left"><strong>' + time + '</strong><br/></p>';
                _.each(data, function (val, i) {
                    if (!self.disabledSeries[i]) {
                        var percent = val.values[index].y;
                        toolTip += '<div style="text-align:left; margin-right: 14px; margin-bottom: 12px;"><div style="width: 8px; height: 8px; display: inline-block; margin: 0 7px 0 14px; background: ' + val.color + '"></div><strong>' + percent + '% ' + '</strong>' + val.key + '<br/></div>';
                    }
                });
                return toolTip;
            };
        },
        formatCategories: function (d) {
            var date = this.categories[d - 1] || {};
            if (!_.isEmpty(date)) {
                if (date.endTime) {
                    return date.week || Moment.unix(date.startTime).week();
                }
                return Moment.unix(date.startTime).format('DD');
            }
        },
        // LAUNCH STATISTICS
        render: function () {
            var self = this;
            var data = this.getData();
            var isWeeks = this.model.get('interval') !== 1;
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
                .showControls(false)
                .stacked(true)
                .showLegend(false)
                .showXAxis(true)
                .reduceXTicks(false)
                .tooltips(!self.isPreview)
                .yDomain([0, 100]);

            this.chart.dispatch.on('stateChange', function (e) {
                self.disabledSeries = e.disabled;
            });

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function (d) {
                    return d + '%';
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

            vis.filter(function (filterData) {
                if (_.isEmpty(filterData)) {
                    $(this).closest('div').append('<div class="no-data-available"></div>');
                }
            }, this);

            this.addResize();
        }
    });

    return IssuesTrendChart;
});
