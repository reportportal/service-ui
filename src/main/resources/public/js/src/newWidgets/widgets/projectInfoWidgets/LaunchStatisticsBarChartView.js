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
    var Localization = require('localization');
    var Util = require('util');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');

    var config = App.getInstance();

    var LaunchStatisticsbarChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-project-info-chart',
        tooltipTemplate: 'tpl-widget-project-info-chart-tooltip',
        className: 'project-info-chart launch-statistics',

        render: function () {
            var self = this;
            var contentData = [];
            var contentDataSorted;
            var container;
            var isWeeks = this.model.get('interval') !== 1;
            var chartData = {
                columns: {
                    toInvestigate: ['toInvestigate'],
                    systemIssue: ['systemIssue'],
                    automationBug: ['automationBug'],
                    productBug: ['productBug']
                },
                colors: {
                    productBug: config.defaultColors.productBug,
                    automationBug: config.defaultColors.automationBug,
                    systemIssue: config.defaultColors.systemIssue,
                    toInvestigate: config.defaultColors.toInvestigate
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
                return isWeeks ? item.date.split('-W')[1] : Moment(item.date).unix();
            });

            // fill chart data with converted to percent values
            _.each(contentDataSorted, function (itemData) {
                var total = +itemData.automationBug + +itemData.productBug + +itemData.systemIssue + +itemData.toInvestigate;
                chartData.columns.productBug.push(isNaN(+itemData.productBug / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData.productBug / total) * 100, 2).toFixed(2));
                chartData.columns.automationBug.push(isNaN(+itemData.automationBug / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData.automationBug / total) * 100, 2).toFixed(2));
                chartData.columns.systemIssue.push(isNaN(+itemData.systemIssue / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData.systemIssue / total) * 100, 2).toFixed(2));
                chartData.columns.toInvestigate.push(isNaN(+itemData.toInvestigate / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData.toInvestigate / total) * 100, 2).toFixed(2));
                itemsData.push({
                    date: itemData.date
                });
            }, this);
            this.chart = c3.generate({
                bindto: container[0],
                data: {
                    columns: _.values(chartData.columns),
                    type: 'bar',
                    order: null,
                    groups: [_.keys(chartData.columns)],
                    colors: chartData.colors
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        show: true,
                        type: 'category',
                        categories: _.map(itemsData, function (item) {
                            return isWeeks ? item.date.split('-W')[1] : item.date.split('-')[2];
                        }),
                        tick: {
                            values: self.getTimelineAxisTicks(itemsData.length),
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
                        max: 100,
                        padding: {
                            top: 0
                        },
                        tick: {
                            format: function (d) {
                                return d + '%';
                            }
                        }
                    }
                },
                legend: {
                    show: false
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
                        var itemData = itemsData[d[0].index];
                        var start;
                        var end;
                        var period;
                        if (isWeeks) {
                            start = Moment(itemData.date).format(config.widgetTimeFormat);
                            end = Moment(itemData.date).add(6, 'day').format(config.widgetTimeFormat);
                            period = start + ' - ' + end;
                        } else {
                            period = itemData.date;
                        }
                        return Util.templates(self.tooltipTemplate, {
                            period: period,
                            showRate: true,
                            color: color(d[0].id),
                            name: Localization.widgets[d[0].name],
                            percentage: d[0].value + '%'
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

    return LaunchStatisticsbarChart;
});
