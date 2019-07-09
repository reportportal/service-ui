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
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var Moment = require('moment');
    var config = App.getInstance();

    var TestCasesGrowthTrendChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-test-cases-growth-trend-chart',
        tooltipTemplate: 'tpl-widget-test-cases-growth-trend-chart-tooltip',
        className: 'test-cases-growth-trend-chart',

        render: function () {
            var data;
            this.isTimeLine = !!this.model.getWidgetOptions().timeline;

            if (this.isTimeLine) {
                data = [];
                _.each(this.model.getContent(), function (item, key) {
                    data.push({
                        date: key,
                        values: item[0].values
                    });
                });
                this.$el.addClass('timeline-mode');
            } else {
                data = this.model.getContent().result;
            }
            this.scrollers = [];
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }
            if ((!this.isTimeLine && !this.isDataExists()) || (this.isTimeLine && _.isEmpty(this.model.getContent()))) {
                this.addNoAvailableBock();
                return;
            }

            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.launchFilterCollection.ready.done(function () {
                this.$el.html(Util.templates(this.template, {}));
                this.drawStackedBarChart($('[data-js-chart-container]', this.$el), data);
            }.bind(this));
        },

        drawStackedBarChart: function ($el, data) {
            var self = this;
            var itemData = [];
            var offsets = ['offset'];
            var bars = ['bar'];
            var isPositive = [];

            _.each(data, function (item) {
                if (+item.values.delta < 0) {
                    isPositive.push(false);
                    offsets.push(+item.values.statistics$executions$total);
                } else {
                    isPositive.push(true);
                    offsets.push(+item.values.statistics$executions$total - +item.values.delta);
                }
                bars.push(Math.abs(+item.values.delta));
                if (self.isTimeLine) {
                    itemData.push({ date: item.date });
                } else {
                    itemData.push({
                        id: item.id,
                        name: item.name,
                        number: item.number,
                        startTime: item.startTime
                    });
                }
            });
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: [offsets, bars],
                    type: 'bar',
                    order: null,
                    onclick: function (d, element) {
                        if (d.id === 'bar') {
                            if (self.isTimeLine) {
                                self.redirectForTimeLine(itemData[d.index].date);
                            } else {
                                config.router.navigate(self.linkToRedirectService('Grow test cases', itemData[d.index].id), { trigger: true });
                            }
                        }
                    },
                    groups: [['offset', 'bar']],
                    color: function (c, d) {
                        var color;
                        switch (d.id) {
                        case 'bar':
                            if (isPositive[d.index]) {
                                color = config.defaultColors.positive;
                                break;
                            }
                            color = config.defaultColors.negative;
                            break;
                        default:
                            color = null;
                            break;
                        }
                        return color;
                    },
                    labels: {
                        format: function (v, id, i, j) {
                            var step = (itemData.length < 20) ? 1 : (self.isTimeLine ? 6 : 2);
                            if (self.isPreview || id !== 'bar' || (i % step) !== 0) {
                                return null;
                            }
                            return isPositive[i] ? v : -v;
                        }
                    }
                },
                grid: {
                    y: {
                        show: !self.isPreview
                    }
                },
                axis: {
                    x: {
                        show: !self.isPreview,
                        type: 'category',
                        categories: _.map(itemData, function (item) {
                            var day;
                            if (self.isTimeLine) {
                                day = Moment(item.date).format('dddd').substring(0, 3);
                                return day + ', ' + item.date;
                            }
                            return '#' + item.number;
                        }),
                        tick: {
                            values: self.isTimeLine ? self.getTimelineAxisTicks(itemData.length) : self.getLaunchAxisTicks(itemData.length),
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: self.isTimeLine,
                            outer: false
                        }
                    },
                    y: {
                        show: true,
                        padding: {
                            top: 10,
                            bottom: 0
                        },
                        label: {
                            text: Localization.widgets.casesLabel,
                            position: 'outer-middle'
                        }
                    }
                },
                interaction: {
                    enabled: !self.isPreview
                },
                // // zoom: {
                // //     enabled: true,
                // //     rescale: true
                // // },
                // // subchart: {
                // //     show: true
                // // },
                padding: {
                    top: self.isPreview ? 0 : 10,
                    left: self.isPreview ? 0 : 60,
                    right: self.isPreview ? 0 : 20,
                    bottom: self.isPreview || !self.isTimeLine ? 0 : 10
                },
                legend: {
                    show: false
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
                        var total;
                        var growth;
                        if (isPositive[d[0].index]) {
                            growth = d[1].value;
                            total = d[0].value + d[1].value;
                        } else {
                            growth = -d[1].value;
                            total = d[0].value;
                        }
                        return Util.templates(self.tooltipTemplate, {
                            launchName: launchData.name,
                            launchNumber: launchData.number,
                            startTime: self.isTimeLine ? launchData.date : self.formatDateTime(launchData.startTime),
                            total: total,
                            growth: growth
                        });
                    }
                },
                size: {
                    height: self.$el.parent().height()
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-bars-bar path', $el)).each(function () {
                        var elem = d3.select(this);
                        if (elem.datum().value === 0) {
                            elem.style('stroke-width', '1px').style('stroke', '#464547');
                        }
                    });
                }
            });
        },
        onBeforeDestroy: function () {
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return TestCasesGrowthTrendChart;
});
