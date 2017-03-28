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

    var PercentageOfProductBugsChart = ChartWidgetView.extend({
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

        getData: function () {
            var data = [];
            var contentData = this.model.getContent();
            this.categories = [];
            this.dates = {};
            this.averageBugs = 0;
            if (!_.isEmpty(contentData)) {
                var items = this.getSortedItems();
                var size = _.size(contentData);
                var totalBugs = 0;
                var criteria = this.getCriteria();
                var series = this.getSeries(criteria);

                _.each(items, function (item, i) {
                    var value = {};
                    var dateKey = !item.endTime ? Moment.unix(item.startTime).format('DD') : item.week;
                    var total = _.reduce(this.issues, function (memo, n) { return memo + parseInt(item[n]); }, 0);

                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;
                    this.categories.push(_.clone(value));
                    this.dates[dateKey] = this.categories[i];
                    value.x = i + 1;

                    _.each(series, function (val, key) {
                        var y = total ? (parseInt(item[key], 10) * 100) / total : 0;
                        value.x = i + 1;
                        value.y = (y % 2 === 0) ? y : d3.round(y, 2);
                        val.values.push(_.clone(value));
                        if (key === this.averageKey) {
                            totalBugs += value.y;
                        }
                    }, this);
                }, this);
                this.averageBugs = !_.isNaN(totalBugs) && !_.isNaN(size) ? Math.round((totalBugs / size) * 100) / 100 : 0;
                data = _.values(series);
            }
            return data;
        },

        getCriteria: function () {
            return ['productBug', 'toInvestigate'];
        },

        averageKey: 'productBug',

        issues: ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'],

        label: Localization.widgets.ofProductBugs,

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

        formatCategories: function (d) {
            var cat = this.categories[d - 1] || {};
            if (!_.isEmpty(cat)) {
                if (cat.endTime) {
                    return cat.week;
                }
                return Moment.unix(cat.startTime).format('DD');
            }
        },
        render: function () {
            var self = this;
            var data = this.getData();
            var isWeeks = this.model.get('interval') !== 1;
            var average = $('#total-' + this.id);
            var vis;

            this.addSVG();

            if (!_.isEmpty(this.model.getContent())) {
                average.text(Localization.widgets.averageBugs.replace('%%%', this.averageBugs) + ' ' + Localization.widgets[this.averageKey]);
            } else {
                average.addClass('hide');
            }

            this.chart = nvd3.models.stackedAreaChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({ top: 30, left: 40, right: 0, bottom: 40 })
                .yDomain([0, 100])
                .useInteractiveGuideline(true)
                .showLegend(false)
                .clipEdge(true)
                .showControls(false)
                .yAxisTickFormat(function (d) {
                    return (_.isNaN(d) ? 0 : d) + '%';
                });

            var format = config.widgetTimeFormat;
            var contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator();
            var tooltip = this.chart.interactiveLayer.tooltip;

            tooltip.contentGenerator(function (d) {
                var start = Moment.unix(self.dates[d.value].startTime).format(format);
                var end = isWeeks ? Moment.unix(self.dates[d.value].endTime).format(format) : '';
                d.value = isWeeks ? (start + ' - ' + end) : start;
                d.series = _.sortBy(d.series, 'key');
                return contentGenerator(d);
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
                    $(this).closest('.widget-body').css('height', 200 + 'px');
                }
            }, this);

            this.addResize();
        }
    });

    return PercentageOfProductBugsChart;
});
