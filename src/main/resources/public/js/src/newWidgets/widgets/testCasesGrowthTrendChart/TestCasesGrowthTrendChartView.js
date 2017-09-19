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
    var $ = require('jquery');
    var Moment = require('moment');
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var TestCasesGrowthTrendChartView = ChartWidgetView.extend({
        addColors: function (val) {
            switch (true) {
            case val < 0 :
                this.colors.push(this.getSeriesColor('negative'));
                break;
            case val === 0 :
                this.colors.push(this.getSeriesColor('zero'));
                break;
            case val > 0 :
                this.colors.push(this.getSeriesColor('positive'));
                break;
            default:
            }
        },
        getData: function () {
            var key = Localization.widgets.growTestCases;
            var series;
            var contentData = this.model.getContent() || [];
            var pairs;
            this.categories = [];
            this.colors = [];
            this.startVal = 0;
            if (!_.isEmpty(contentData)) {
                key = Localization.widgets.growTestCases;
                series = {
                    key: key,
                    color: this.getSeriesColor(key),
                    seriesId: 'grow_test_cases',
                    values: []
                };
                if (!this.model.get('isTimeline')) {
                    _.each(contentData.result, function (d, i) {
                        var values = d.values;
                        var val = parseInt(values.statistics$executionCounter$total, 10);
                        var added = parseInt(values.delta, 10);
                        var cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime, 10)
                        };
                        this.categories.push(cat);
                        if (i === 0) {
                            this.startVal = parseInt(val, 10);
                        }
                        this.addColors(added);
                        series.values.push(_.extend({ y: added, value: val, x: i + 1 }, cat));
                    }, this);
                } else {
                    pairs = _.pairs(contentData);
                    pairs.sort(function (a, b) {
                        return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix();
                    });
                    _.each(pairs, function (p, i) {
                        var values = p[1][0].values;
                        var date = Moment(p[0], 'YYYY-MM-DD');
                        var cat = {
                            time: date.format('YYYY-MM-DD'),
                            startTime: date.unix()
                        };
                        var val = parseInt(values.statistics$executionCounter$total, 10);
                        var added = parseInt(values.delta, 10);

                        this.categories.push(cat);
                        if (i === 0) {
                            this.startVal = val;
                        }
                        this.addColors(added);
                        series.values.push({
                            x: i + 1,
                            startTime: date.unix(),
                            y: added,
                            value: val
                        });
                    }, this);
                }
                this.series = [series];
                return this.series;
            }
            return [];
        },
        tooltipContent: function () {
            var self = this;
            var index;
            var cat;
            var date;
            return function (key, x, y, e) {
                index = e.pointIndex;
                cat = self.categories[index];
                if (self.model.get('isTimeline')) {
                    return '<p style="text-align:left">' + cat.time + '<br/>' + key + ': <strong>' + y + '</strong><br/>' + Localization.widgets.totalTestCases + ': <strong>' + e.point.value + '</strong></p>';
                }
                date = self.formatDateTime(cat.startTime);
                return '<p style="text-align:left"><strong>' + cat.name + ' ' + cat.number + '</strong><br/>' + date + '<br/>' + key + ': <strong>' + y + '</strong><br/>' + Localization.widgets.totalTestCases + ': <strong>' + e.point.value + '</strong></p>';
            };
        },
        getDomain: function (data) {
            var y = this.startVal;
            var m = !_.isEmpty(data) ? _.map(data[0].values, function (a) {
                return (y += a.y);
            }) : 0;
            var max = _.max(m);
            var min = _.min(m);
            if (max === min) {
                max += 1;
            }
            return [min, max];
        },
        render: function () {
            var data = this.getData();
            var self = this;
            var tooltip = this.tooltipContent();
            var yDomain = this.getDomain(data);
            var tip;
            var vis;
            var cup;
            var update;
            var emptyData = this.model.getContent();
            if (!this.isEmptyData(emptyData)) {
                this.addSVG();

                this.chart = nvd3.models.trendBarChart()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .yDomain(yDomain)
                    .valueFormat(d3.format('f'))
                    .tooltips(!self.isPreview)
                    .showValues(true)
                    .color(this.colors)
                ;

                this.chart.tooltipContent(tooltip);

                this.chart.yAxis
                    .tickFormat(d3.format('d'))
                    .axisLabelDistance(-10)
                    .axisLabel('cases')
                ;

                this.chart.xAxis
                    .staggerLabels(false)
                    .tickFormat(function (d) {
                        return self.formatNumber(d);
                    })
                ;

                tip = this.createTooltip();
                vis = d3.select($('svg', this.$el).get(0))
                    .datum(data)
                    .call(this.chart)
                    .call(tip)
                ;

                if (self.model.get('isTimeline')) {
                    this.updateTickForTimeLine(vis);
                }
                this.addLaunchNameTip(vis, tip);

                this.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });

                cup = self.chart.update;
                update = function () {
                    self.chart.xAxis
                        .tickFormat(function (d) {
                            return self.formatNumber(d);
                        });
                    cup();
                    self.chart.xAxis
                        .tickFormat(function (d) {
                            return self.formatCategories(d);
                        });
                    self.chart.update = update;
                    if (self.model.get('isTimeline')) {
                        self.updateTickForTimeLine(vis);
                    }
                };
                this.chart.update = update;
                this.addResize();
                this.redirectOnElementClick('trendbar');
                if (self.isPreview) {
                    this.disabeLegendEvents();
                }
            } else {
                this.addNoAvailableBock();
            }
        }
    });

    return TestCasesGrowthTrendChartView;
});
