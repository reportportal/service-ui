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

    var InvestigatedTrendChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-investigated-trend-chart',
        tooltipTemplate: 'tpl-widget-investigated-trend-chart-tooltip',
        className: 'investigated-trend-chart',

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
            var chartData = {};
            var legendScroller;
            var itemNames;
            var itemData = [];
            var colors = {};
            // prepare columns array and fill it witch field names
            _.each(data[0].values, function (val, key) {
                var splitted = key.split('$');
                var shortKey = splitted[splitted.length - 1];
                switch (shortKey) {
                case 'to_investigate':
                    colors[shortKey] = '#FFB743';
                    break;
                case 'investigated':
                    colors[shortKey] = '#87B87F';
                    break;
                default:
                    break;
                }
                chartData[shortKey] = [shortKey];
            });
            // fill columns arrays with values
            if (this.isTimeLine) {
                _.each(data, function (item) {
                    itemData.push({
                        date: item.date
                    });
                    _.each(item.values, function (val, key) {
                        var splitted = key.split('$');
                        var shortKey = splitted[splitted.length - 1];
                        chartData[shortKey].push(val);
                    });
                });
            } else {
                _.each(data, function (item) {
                    itemData.push({
                        id: item.id,
                        name: item.name,
                        number: item.number,
                        startTime: item.startTime
                    });
                    _.each(item.values, function (val, key) {
                        var splitted = key.split('$');
                        var shortKey = splitted[splitted.length - 1];
                        chartData[shortKey].push(val);
                    });
                });
            }

            itemNames = _.map(chartData, function (item) {
                return item[0];
            });

            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: [chartData[itemNames[0]], chartData[itemNames[1]]],
                    type: 'bar',
                    onclick: function (d, element) {
                        if (self.isTimeLine) {
                            self.redirectForTimeLine(itemData[d.index].date);
                        } else {
                            config.router.navigate(self.linkToRedirectService(d.id, itemData[d.index].id), { trigger: true });
                        }
                    },
                    order: null,
                    groups: [itemNames],
                    colors: colors
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
                        max: 100,
                        padding: {
                            top: 0
                        },
                        label: {
                            text: Localization.widgets.ofInvestigation,
                            position: 'outer-middle'
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
                    top: self.isPreview ? 0 : 85,
                    left: self.isPreview ? 0 : 60,
                    right: self.isPreview ? 0 : 20,
                    bottom: self.isPreview || !self.isTimeLine ? 0 : 10
                },
                legend: {
                    show: false // we use custom legend
                },
                tooltip: {
                    grouped: false,
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
                        var id = d[0].id;
                        var itemName = Localization.launchesHeaders[id];

                        return Util.templates(self.tooltipTemplate, {
                            launchName: launchData.name,
                            launchNumber: launchData.number,
                            startTime: self.isTimeLine ? launchData.date : self.formatDateTime(launchData.startTime),
                            color: color(d[0].id),
                            itemName: itemName,
                            itemCases: d[0].value
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
            // Configuring custom legend block
            if (!self.isPreview) {
                d3.select(this.chart.element)
                    .insert('div', '.chart')
                    .attr('class', 'legend')
                    .insert('div', '.legend')
                    .attr('data-js-legend-wrapper', '') // wrapper for BaronScroll
                    .selectAll('span')
                    .data(itemNames)
                    .enter()
                    .append('span')
                    .attr('data-id', function (id) { return id; })
                    .html(function (id) {
                        return '<div class="color-mark"></div>' + Localization.launchesHeaders[id];
                    })
                    .each(function (id) {
                        if (~self.hiddenItems.indexOf(id)) {
                            $('.color-mark', $(this)).addClass('unchecked');
                        }
                        d3.select(this).select('.color-mark').style('background-color', self.chart.color(id));
                    })
                    .on('mouseover', function (id) {
                        self.chart.focus(id);
                    })
                    .on('mouseout', function (id) {
                        self.chart.revert();
                    })
                    .on('click', function (id) {
                        config.trackingDispatcher.trackEventNumber(342);
                        $('.color-mark', $(this)).toggleClass('unchecked');
                        self.chart.toggle(id);
                    });
                this.hiddenItems && this.chart.hide(this.hiddenItems);
                d3.select(this.chart.element).select('.legend')
                    .append('div')
                    .attr('class', 'legend-gradient')
                    .append('div')
                    .attr('class', 'legend-border');
                legendScroller = Util.setupBaronScroll($('[data-js-legend-wrapper]', $el));
                this.scrollers.push(legendScroller);
            }
        },
        onBeforeDestroy: function () {
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return InvestigatedTrendChart;
});
