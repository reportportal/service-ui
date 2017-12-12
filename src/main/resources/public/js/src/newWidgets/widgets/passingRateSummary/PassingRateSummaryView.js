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
    var Localization = require('localization');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var d3 = require('d3');
    var c3 = require('c3');

    var PassingRatePerLaunchChart = C3ChartWidgetView.extend({

        template: 'tpl-widget-passing-rate-per-launch',
        className: 'passing-rate-per-launch',

        render: function () {
            var widgetOptions;
            var contentData;
            var chartDataPercents;
            this.charts = [];
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }

            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            widgetOptions = this.model.getParameters().widgetOptions;
            this.infoData = widgetOptions.filterName[0];
            contentData = this.model.getContent().result[0].values;
            if (+contentData.statistics$executions$total === 0) {
                this.addNoAvailableBock();
                return;
            }
            this.total = +contentData.statistics$executions$total;
            this.chartData = {
                launchPassed: +contentData.statistics$executions$passed,
                launchNotPassed: +contentData.statistics$executions$total - +contentData.statistics$executions$passed
            };
            chartDataPercents = this.getValuesInPercents(+contentData.statistics$executions$total, this.chartData);
            this.$el.html(Util.templates(this.template));
            if (this.isDrawPie(widgetOptions)) {
                this.$el.addClass('passing-rate-pie-view');
                this.drawPieChart($('[data-js-chart-container]', this.$el), chartDataPercents);
            } else {
                this.$el.addClass('passing-rate-bar-view');
                this.drawBarChart($('[data-js-chart-container]', this.$el), chartDataPercents);
            }
        },
        drawPieChart: function ($el, data) {
            var self = this;
            var chart;
            var processedData = this.getProcessedData(data);
            var topBlockElem;

            chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: processedData.chartData.reverse(),
                    type: 'pie',
                    order: null,
                    colors: processedData.colors
                },
                interaction: {
                    enabled: !self.isPreview
                },
                pie: {
                    label: {
                        show: !self.isPreview,
                        threshold: 0.05,
                        format: function (value, r, id) {
                            return self.getFormattedLabels(id);
                        }
                    }
                },
                padding: {
                    top: self.isPreview ? 0 : 85
                },
                legend: {
                    show: false // we use custom legend
                },
                tooltip: {
                    position: function (d, width, height, element) {
                        var left = d3.mouse(chart.element)[0] - (width / 2);
                        var top = d3.mouse(chart.element)[1] - height;
                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var id = d[0].id;
                        var value = self.chartData[id];
                        var ratio = value / self.total;
                        return '<div class="tooltip-val">' + value + ' (' + self.getRoundedToDecimalPlaces(ratio * 100, 2).toFixed(2) + '%)</div>' +
                            '<div class="tooltip-title">' +
                            '<div class="color-mark" style="background-color: ' + color(id) + ';"></div>' +
                            Localization.widgets[d[0].name] +
                            '</div>';
                    }
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-chart-arc text', $el)).each(function (d, i, j) {
                        var elem = d3.select(this);
                        // var textBoxWidth = d3.select(this).node().getBBox().width;
                        if ((((elem.datum().endAngle - elem.datum().startAngle) / 2) + elem.datum().startAngle) > Math.PI) {
                            elem.attr('dx', 10);
                        } else {
                            elem.attr('dx', -10);
                        }
                    });
                }
            });
            this.charts.push(chart);
            if (!self.isPreview) {
                topBlockElem = d3.select(chart.element).insert('div', '.chart').attr('class', 'top-block');
                this.setupInfoBlock(topBlockElem, this.infoData);
                this.setupLegend(topBlockElem, processedData.itemNames, chart);
            }
        },
        drawBarChart: function ($el, data) {
            var self = this;
            var chart;
            var processedData = this.getProcessedData(data);
            var topBlockElem;

            chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: processedData.chartData,
                    groups: [
                        ['launchPassed', 'launchNotPassed']
                    ],
                    type: 'bar',
                    order: null,
                    colors: processedData.colors,
                    labels: {
                        format: function (v, id, i, j) {
                            return self.getFormattedLabels(id);
                        }
                    }
                },
                axis: {
                    rotated: true,
                    x: {
                        show: false
                    },
                    y: {
                        show: false,
                        padding: {
                            top: 0
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.35
                    }
                },
                interaction: {
                    enabled: !self.isPreview
                },
                padding: {
                    top: self.isPreview ? 0 : 30,
                    left: 20,
                    right: 20
                },
                legend: {
                    show: false // we use custom legend
                },
                tooltip: {
                    grouped: false,
                    position: function (d, width, height, element) {
                        var left = d3.mouse(chart.element)[0] - (width / 2);
                        var top = d3.mouse(chart.element)[1] - height;
                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var id = d[0].id;
                        var value = self.chartData[id];
                        var ratio = value / self.total;
                        return '<div class="tooltip-val">' + value + ' (' + self.getRoundedToDecimalPlaces(ratio * 100, 2).toFixed(2) + '%)</div>' +
                            '<div class="tooltip-title">' +
                            '<div class="color-mark" style="background-color: ' + color(id) + ';"></div>' +
                            Localization.widgets[d[0].name] +
                            '</div>';
                    }
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-chart-texts text', $el)).each(function (d, i, j) {
                        var barBox = d3.selectAll($('.c3-bars-' + d.id, self.$el)).node().getBBox();
                        var textBox = d3.select(this).node().getBBox();
                        // put bar labels in center of the bar.
                        var x = (barBox.x + (barBox.width / 2)) - (textBox.width / 2);
                        if (d.id === 'launchPassed' && x < 5) {
                            x = 5;
                        }
                        if (d.id === 'launchNotPassed' && x + textBox.width > barBox.x + barBox.width) {
                            x = barBox.x + barBox.width - textBox.width - 5;
                        }
                        d3.select(this).attr('x', x);
                    });
                }
            });
            this.charts.push(chart);
            if (!self.isPreview) {
                topBlockElem = d3.select(chart.element).insert('div', '.chart').attr('class', 'top-block');
                this.setupInfoBlock(topBlockElem, this.infoData);
                this.setupLegend(topBlockElem, processedData.itemNames, chart);
            }
        },
        getProcessedData: function (data) {
            var chartData = [];
            var itemNames = [];
            var colors = {};
            _.each(data, function (val, key) {
                switch (key) {
                case 'launchPassed':
                    colors[key] = '#8db677';
                    break;
                case 'launchNotPassed':
                    colors[key] = '#e86c42';
                    break;
                default:
                    break;
                }
                itemNames.push(key);
                chartData.push([key, val]);
            });
            return {
                chartData: chartData,
                itemNames: itemNames,
                colors: colors
            };
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
                .each(function (id) {
                    d3.select(this).select('.color-mark').style('background-color', chart.color(id));
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
            d3.select(chart.element).select('.legend')
                .append('div')
                .attr('class', 'legend-gradient')
                .append('div')
                .attr('class', 'legend-border');
        },
        setupInfoBlock: function (el, infodata) {
            d3.select(el[0][0])
                .insert('div')
                .attr('class', 'info-data')
                .html(function (id) {
                    return Localization.ui.filter + ': <span>' + infodata + '</span>';
                });
        },
        isDrawPie: function (widgetOptions) {
            return (widgetOptions && widgetOptions.viewMode && widgetOptions.viewMode.length && widgetOptions.viewMode[0] === 'pieChartMode');
        }
    });

    return PassingRatePerLaunchChart;
});
