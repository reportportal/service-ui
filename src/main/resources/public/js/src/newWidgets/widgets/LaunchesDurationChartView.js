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
    var nvd3New = require('nvd3New');

    var config = App.getInstance();

    var LaunchesDurationChart = ChartWidgetView.extend({
        initialize: function (options) {
            ChartWidgetView.prototype.initialize.call(this, options);
            this.categories = [];
            this.colors = [];
            this.max = 0;
            this.ITERUPT = 'INTERRUPTED';
        },
        getTimeType: function (max) {
            var time = { value: 3600000, type: Localization.time.hours };
            if (max > 0) {
                if (max < 60000) {
                    time = { value: 1000, type: Localization.time.seconds };
                } else if (max <= 2 * 3600000) {
                    time = { value: 60000, type: Localization.time.minutes };
                }
            }
            return time;
        },
        getData: function () {
            var contentData = this.model.getContent() || [];
            if (!_.isEmpty(contentData) && contentData.result) {
                var size = 0;
                var sum = 0;
                var avg = 0;
                var key = 'duration';
                var inKey = 'interrupted';
                var data = _.clone(contentData.result).reverse();
                var series = {
                    key: Localization.widgets[key],
                    color: this.getSeriesColor(key),
                    seriesId: 'duration',
                    values: []
                };
                _.each(data, function (d, i) {
                    var values = d.values;
                    var duration = parseInt(values.duration, 10);
                    var cat = {
                        id: d.id,
                        name: d.name,
                        number: '#' + d.number
                    };
                    this.categories.push(cat);
                    series.values.push(_.extend(values, { num: i + 1 }, cat));
                    if (!this.isInterupt(values)) {
                        this.max = duration > this.max ? duration : this.max;
                        sum += duration;
                        ++size;
                    }
                }, this);

                avg = sum / size;
                _.each(series.values, function (k) {
                    if (this.isInterupt(k)) {
                        k.duration = avg && !isNaN(avg) ? avg : k.duration;
                        this.colors.push(this.getSeriesColor(inKey));
                    } else {
                        this.colors.push(this.getSeriesColor(key));
                    }
                }, this);
                this.series = [series];
                return this.series;
            }
            return [];
        },
        isInterupt: function (v) {
            return v.status === this.ITERUPT;
        },
        tooltipContent: function () {
            var self = this;
            var type = this.getTimeType(this.max);
            return function (props) {
                var index = props.index;
                var key = props.data.key;
                var time = Moment.duration(Math.abs(props.value), type.type).humanize(true);
                var cat = self.categories[index];
                var status = props.data.status;
                var tipTitle = '<p style="text-align:left;"><b>' + cat.name + ' ' + cat.number + '</b><br/>';
                var tipVal = '<b>' + ((status !== self.ITERUPT) ? key + ':' : '<span style="color: ' + self.getSeriesColor(status) + ';">Run ' + self.ITERUPT.toLowerCase().capitalize() + '</span>') + ' </b> ' + ((status !== self.ITERUPT) ? time : '') + ' <br/></p>';
                config.trackingDispatcher.trackEventNumber(343);
                return tipTitle + tipVal;
            };
        },
        render: function () {
            var data = this.getData();
            var self = this;
            var type = this.getTimeType(this.max);
            var tooltip = this.tooltipContent();

            this.addSVG();

            this.chart = nvd3New.models.multiBarHorizontalChart()
                .x(function (d) {
                    return d.num;
                })
                .y(function (d) {
                    return parseInt(d.duration, 10) / type.value;
                })
                .showValues(false)
                .showControls(false)
                .barColor(this.colors)
                .valueFormat(d3.format(',.2f'))
                .showXAxis(true)
                .showLegend(false)
            ;

            this.chart.tooltip
                .contentGenerator(tooltip)
                .enabled(!self.isPreview)
            ;

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatNumber(d, self.categories);
                });
            this.chart.yAxis
                .tickFormat(d3.format(',.2f'))
                .axisLabel(type.type);

            var vis = d3.select($('svg', this.$el).get(0))
                .datum(data)
                .call(this.chart)
                ;

            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.tickFormat(function (d) {
                    return self.formatNumber(d);
                });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('multibar');
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
        }
    });

    return LaunchesDurationChart;
});
