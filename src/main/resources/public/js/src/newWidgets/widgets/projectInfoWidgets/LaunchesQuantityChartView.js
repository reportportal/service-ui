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
    var Moment = require('moment');
    var Util = require('util');
    var Localization = require('localization');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var LaunchesQuantityChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-project-info-chart',
        tooltipTemplate: 'tpl-widget-project-info-chart-tooltip',
        className: 'project-info-chart quantity-of-launches',

        render: function () {
            var self = this;
            var contentData = [];
            var contentDataSorted;
            var container;
            var isWeeks = this.model.get('interval') !== 1;
            var chartData = {
                columns: ['numberOfLaunches'],
                colors: {
                    numberOfLaunches: config.defaultColors.numberLaunches
                }
            };
            var itemsData = [];
            if (_.isEmpty(this.model.getContent())) {
                this.addNoAvailableBock();
                return;
            }
            this.$el.html(Util.templates(this.template, {}));
            container = $('[data-js-chart-container]', this.$el);

            _.each(this.model.getContent(), function (val, key) {
                var itemData = val[0].values;
                itemData.date = key;
                contentData.push(itemData);
            });

            // sort data by start time
            contentDataSorted = _.sortBy(contentData, function (item) {
                return Moment(item.start).unix();
            });


            _.each(contentDataSorted, function (itemData) {
                chartData.columns.push(itemData.count);
                itemsData.push({
                    xTick: isWeeks ? itemData.date.split('-W')[1] : itemData.date.split('-')[2],
                    count: itemData.count,
                    start: itemData.start,
                    end: itemData.end,
                    interval: itemData.interval
                });
            });

            this.chart = c3.generate({
                bindto: container[0],
                data: {
                    columns: [chartData.columns],
                    type: 'bar',
                    colors: chartData.colors
                },
                padding: {
                    top: 0
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        show: true,
                        tick: {
                            format: function (d) {
                                return itemsData[d].xTick;
                            },
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: false,
                            outer: false
                        },
                        label: {
                            text: isWeeks ? Localization.widgets.timeWeeks : Localization.widgets.timeDays,
                            position: 'outer-center'
                        }
                    },
                    y: {
                        show: true,
                        padding: {
                            top: 0,
                            bottom: 0
                        }
                    }
                },
                legend: {
                    show: false
                },
                tooltip: {
                    position: function (d, width, height, element) {
                        var left = d3.mouse(self.chart.element)[0] - (width / 2);
                        var top = d3.mouse(self.chart.element)[1] - height;

                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var itemData = itemsData[d[0].index];
                        return Util.templates(self.tooltipTemplate, {
                            period: isWeeks ? itemData.start + ' - ' + itemData.end : itemData.start,
                            showCount: true,
                            count: itemData.count,
                            measure: Localization.widgets.launches
                        });
                    }
                },
                size: {
                    height: self.$el.height()
                },
                onrendered: function () {
                    container.css('max-height', 'none');
                }
            });
        }
    });

    return LaunchesQuantityChart;
});
