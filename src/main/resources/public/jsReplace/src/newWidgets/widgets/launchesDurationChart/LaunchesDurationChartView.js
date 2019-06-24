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
    var Util = require('util');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var Moment = require('moment');
    var App = require('app');
    var config = App.getInstance();

    var LaunchesDurationChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-launches-duration-chart',
        tooltipTemplate: 'tpl-widget-launches-duration-chart-tooltip',
        className: 'launches-duration-chart',

        render: function () {
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }
            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            this.ITERUPTED = 'INTERRUPTED';
            this.$el.html(Util.templates(this.template, {}));
            this.drawBarChart($('[data-js-chart-container]', this.$el), this.model.getContent().result);
        },
        drawBarChart: function ($el, data) {
            var self = this;
            var chartData = ['duration'];
            var itemData = [];
            var count = 0;
            var max = 0;
            var average = 0; // average not-interrupted launches duration
            var sum = 0; // sum of not-interrupted launches duration
            var timeType;

            // average time calculation
            _.each(data, function (item) {
                if (!self.isInterrupted(item.values)) {
                    count += 1;
                    sum += +item.values.duration;
                }
            });

            average = sum / count;

            // data preparation
            _.each(data.reverse(), function (item) {
                var duration = parseInt(item.values.duration, 10);
                max = duration > max ? duration : max;
                itemData.push({
                    id: item.id,
                    name: item.name,
                    number: item.number,
                    status: item.values.status,
                    start_time: item.values.start_time,
                    end_time: item.values.end_time,
                    duration: duration
                });
                chartData.push(self.isInterrupted(item.values) ? average : duration);
            });
            timeType = this.getTimeType(max);
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: [chartData],
                    type: 'bar',
                    colors: {
                        duration: config.defaultColors.duration
                    },

                    groups: [
                        ['duration']
                    ],
                    color: function (color, d) {
                        if (itemData[d.index] && self.isInterrupted(itemData[d.index])) {
                            return config.defaultColors.interrupted;
                        }
                        return color;
                    },
                    onclick: function (d, element) {
                        var link = self.linkToRedirectService(d.id, itemData[d.index].id);
                        link && config.router.navigate(link, { trigger: true });
                    }
                },
                grid: {
                    y: {
                        show: !self.isPreview
                    }
                },
                axis: {
                    rotated: true,
                    x: {
                        show: !self.isPreview,
                        type: 'category',
                        categories: _.map(itemData, function (item) {
                            return '#' + item.number;
                        }),
                        tick: {
                            values: self.getLaunchAxisTicks(itemData.length),
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: false,
                            outer: false
                        }
                    },
                    y: {
                        show: !self.isPreview,
                        tick: {
                            format: function (d) {
                                return (parseInt(d, 10) / timeType.value).toFixed(2);
                            }
                        },
                        padding: {
                            top: 0,
                            bottom: 0
                        },
                        label: {
                            text: Localization.time[timeType.type],
                            position: 'outer-center'
                        }
                    }
                },
                interaction: {
                    enabled: !self.isPreview
                },
                // zoom: {
                //     enabled: true,
                //     rescale: true
                // },
                // subchart: {
                //     show: true
                // },
                padding: {
                    top: self.isPreview ? 0 : 20,
                    left: self.isPreview ? 0 : 40,
                    right: self.isPreview ? 0 : 20,
                    bottom: self.isPreview ? 0 : 10
                },
                legend: {
                    show: false // we use custom legend
                },
                tooltip: {
                    grouped: true,
                    position: function (d, width, height, element) {
                        var left = d3.mouse(self.chart.element)[0] - (width / 2);
                        var top = d3.mouse(self.chart.element)[1] - height;

                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var launchData = itemData[d[0].index];
                        return Util.templates(self.tooltipTemplate, {
                            launchName: launchData.name,
                            launchNumber: launchData.number,
                            isInterrupted: self.isInterrupted(launchData),
                            duration: Moment.duration(Math.abs(launchData.duration / timeType.value), timeType.type).humanize(true)
                        });
                    }
                },
                size: {
                    height: self.$el.parent().height()
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                }
            });
        },
        isInterrupted: function (v) {
            return v.status === this.ITERUPTED;
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
        }
    });

    return LaunchesDurationChart;
});
