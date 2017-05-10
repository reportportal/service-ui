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
    var App = require('app');
    var Moment = require('moment');
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var IssuesLineChart = ChartWidgetView.extend({
        getCriteria: function () {
            return ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'];
        },
        getSeries: function (criteria) {
            var series = {};
            _.each(criteria, function (item) {
                series[item] = {
                    color: this.getSeriesColor(item),
                    key: Localization.widgets[item],
                    values: []
                };
            }, this);
            this.series = series;
            return this.series;
        },
        getData: function () {
            var data = [];
            var contentData = this.model.getContent();
            this.dates = {};
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var items = _.map(contentData, function (v, k) { return v[0].values; });
                var criteria = this.getCriteria();
                var series = this.getSeries(criteria);

                items.sort(function (a, b) { return Moment(a.start, 'YYYY-MM-DD').unix() - Moment(b.start, 'YYYY-MM-DD').unix(); });

                _.each(items, function (item, i) {
                    var value = {};
                    var date = Moment(item.start, 'YYYY-MM-DD');
                    var dateKey = !item.end ? date.format('DD') : date.week();
                    value.startTime = date.unix();
                    value.endTime = item.end ? Moment(item.end, 'YYYY-MM-DD').unix() : null;
                    this.categories.push(_.clone(value));
                    this.dates[dateKey] = this.categories[i];
                    _.each(series, function (val, key) {
                        value.x = i + 1;
                        value.y = parseInt(item[key], 10);
                        val.values.push(_.clone(value));
                    });
                }, this);
                data = _.values(series);
            }
            return data;
        },
        formatCategories: function (d) {
            var cat = this.categories[d - 1] || {};
            if (!_.isEmpty(cat)) {
                if (cat.endTime) {
                    return Moment.unix(cat.startTime).week();
                }
                return Moment.unix(cat.startTime).format('DD');
            }
        },
        render: function () {
            var self = this;
            var data = this.getData();
            var isWeeks = this.model.get('interval') !== 1;

            this.addSVG();

            this.chart = nvd3.models.lineChart()
                .margin({ left: 70 })
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true)
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .useInteractiveGuideline(true)
                .tooltips(!self.isPreview);

            var format = config.widgetTimeFormat;
            var contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator();
            var tooltip = this.chart.interactiveLayer.tooltip;

            tooltip.contentGenerator(function (d) {
                var start = Moment.unix(self.dates[d.value].startTime).format(format);
                var end = isWeeks ? Moment.unix(self.dates[d.value].endTime).format(format) : '';

                d.value = isWeeks ? (start + ' - ' + end) : start;
                return contentGenerator(d);
            });

            this.chart.yAxis
                .tickFormat(function (d) {
                    return _.isNaN(d) ? 0 : d;
                })
                // .axisLabelDistance(10)
                .axisLabelDistance(0)
                .axisLabel('issues');

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                })
                .axisLabel(
                    isWeeks
                        ? Localization.widgets.timeWeeks
                        : Localization.widgets.timeDays
                );

            var vis = d3.select($('svg', this.$el).get(0))
                .datum(data)
                .call(this.chart);

            this.addResize();
        }
    });

    return IssuesLineChart;
});
