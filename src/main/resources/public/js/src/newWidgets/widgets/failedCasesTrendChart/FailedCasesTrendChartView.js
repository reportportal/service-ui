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
    var App = require('app');
    var config = App.getInstance();

    var FailedCasesTrendChart = C3ChartWidgetView.extend({

        template: 'tpl-widget-failed-cases-trend-chart',
        tooltipTemplate: 'tpl-widget-failed-cases-trend-chart-tooltip',
        className: 'failed-cases-trend-chart',

        render: function () {
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }
            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            this.$el.html(Util.templates(this.template, {}));
            this.drawLineChart($('[data-js-chart-container]', this.$el), this.model.getContent().result);
        },
        drawLineChart: function ($el, data) {
            var self = this;
            var chartData = ['failed'];
            var itemData = [];
            var topExtremum = 0;
            var bottomExtremum = Infinity;
            var topBlockElem;

            _.each(data, function (item) {
                if (+item.values.issuesCount > topExtremum) {
                    topExtremum = +item.values.issuesCount;
                }
                if (+item.values.issuesCount < bottomExtremum) {
                    bottomExtremum = +item.values.issuesCount;
                }
                itemData.push({
                    id: item.id,
                    name: item.name,
                    number: item.number,
                    startTime: item.startTime
                });
                chartData.push(item.values.issuesCount);
            });
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: [chartData],
                    colors: {
                        failed: config.defaultColors.failed
                    }
                },
                point: {
                    r: itemData.length === 1 ? 5 : 1,
                    focus: {
                        expand: {
                            r: 5
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
                            values: self.getTicks(bottomExtremum, topExtremum)
                        },
                        padding: {
                            top: 5,
                            bottom: 0
                        },
                        label: {
                            text: Localization.widgets.failedCases,
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
                    bottom: 0
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
                            startTime: self.formatDateTime(launchData.startTime),
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
            if (!this.isPreview) {
                topBlockElem = d3.select(this.chart.element).insert('div', '.chart').attr('class', 'top-block');
                this.setupLegend(topBlockElem, ['failed'], this.chart);
            }
        },
        getTicks: function (bottom, top) {
            var count = 6; // change it if want to increase/decrease Y-lines
            var height = top - bottom;
            var step;
            var result = [bottom];
            switch (true) {
            case height < 1:
                step = 0.2;
                break;
            case height < 10:
                step = 2;
                break;
            default:
                step = Math.round((height / count) / 10) * 10;
                break;
            }
            _.each(_.range(0, top, step), function (item) {
                if (item > bottom) {
                    result.push(item);
                }
            });
            result.push(top);
            return result;
        },
        setupLegend: function (el, itemNames, chart) {
            // Configuring custom legend block
            d3.select(el[0][0])
                .insert('div')
                .attr('class', 'legend')
                .insert('div', '.legend')
                .attr('data-js-legend-wrapper', '') // wrapper for BaronScroll
                .selectAll('span')
                .data(itemNames)
                .enter()
                .append('span')
                .attr('data-id', function (id) {
                    return id;
                })
                .html(function (id) {
                    return '<div class="color-mark"></div>' + Localization.widgets[id];
                })
                .on('mouseover', function (id) {
                    chart.focus(id);
                })
                .on('mouseout', function (id) {
                    chart.revert();
                })
                .on('click', function (id) {
                    // $('.color-mark', $(this)).toggleClass('unchecked');
                    // chart.toggle(id);
                });
        }
    });

    return FailedCasesTrendChart;
});
