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
    var ChartistWidgetView = require('newWidgets/_ChartistWidgetView');
    var Localization = require('localization');

    var PassingRateSummaryChart = ChartistWidgetView.extend({
        template: 'tpl-widget-passing-rate-summary',
        className: 'passing-rate-summary',

        render: function () {
            var self = this;
            var widgetOptions;
            var contentData;
            if (!this.isDataExists()) {
                this.addNoAvailableBock(this.$el);
                return;
            }
            widgetOptions = this.model.getParameters().widgetOptions;
            contentData = this.model.getContent().result[0].values;
            this.total = +contentData.total;
            this.passed = +contentData.passed;
            this.notPassed = (contentData.total - contentData.passed);
            this.valuesInPercent = this.getValuesInPercents(
                    this.total,
                    { passed: this.passed, notPassed: this.notPassed }
                );
            if (this.total === 0) {
                this.addNoAvailableBock(this.$el);
                return;
            }
            this.loadChartist().done(function () {
                if (self.isDrawPie(widgetOptions)) {
                    self.$el.html(Util.templates(self.template, {
                        filterName: widgetOptions.filterName[0]
                    }));
                    $('[data-js-chart-container]', self.$el).addClass('passing-rate-pie-view');
                    $.when(
                        self.loadChartistLegendPlugin(),
                        self.loadChartistTooltipsPlugin()
                    ).done(
                        function () {
                            self.drawPieChart();
                        }
                    ).fail(
                        function () {
                            self.addNoAvailableBock(self.$el);
                        }
                    );
                } else {
                    self.$el.html(Util.templates(self.template, {
                        filterName: widgetOptions.filterName[0]
                    }));
                    $('[data-js-chart-container]', self.$el).addClass('passing-rate-bar-view');
                    $.when(
                        self.loadChartistLegendPlugin(),
                        self.loadChartistBarLabelsPlugin(),
                        self.loadChartistTooltipsPlugin()
                    ).done(
                        function () {
                            self.drawBarChart();
                        }
                    ).fail(
                        function () {
                            self.addNoAvailableBock(self.$el);
                        }
                    );
                }
            });
            this.addResize();
        },
        drawBarChart: function () {
            var self = this;
            var chartData = {
                series: [
                    {
                        className: 'ct-series-passed',
                        data: [
                            {
                                value: this.valuesInPercent.passed,
                                meta: Localization.widgets.launchPassed
                            }
                        ]
                    },
                    {
                        className: 'ct-series-notPassed',
                        data: [
                            {
                                value: this.valuesInPercent.notPassed,
                                meta: Localization.widgets.launchNotPassed
                            }
                        ]
                    }
                ]
            };
            this.chart = new Chartist.Bar($('[data-js-chart-container]', this.$el)[0], chartData, {
                axisX: {
                    offset: 0,
                    showLabel: false,
                    showGrid: false
                },
                axisY: {
                    offset: 0,
                    showLabel: false,
                    showGrid: false
                },
                height: '100%',
                stackBars: true,
                horizontalBars: true,
                referenceValue: null,
                chartPadding: {
                    top: 0,
                    right: (this.valuesInPercent.passed > 97 && this.valuesInPercent.passed !== 100) ? 10 : 0,
                    bottom: 0,
                    left: (this.valuesInPercent.passed < 3 && this.valuesInPercent.passed !== 0) ? 10 : 0
                },
                ignoreEmptyValues: true,
                plugins: [
                    Chartist.plugins.legend({
                        position: $('[data-js-legend]', this.$el)[0],
                        legendNames: [
                            Localization.widgets.launchPassed,
                            Localization.widgets.launchNotPassed
                        ],
                        classNames: ['passed', 'notPassed'],
                        clickable: false
                    }),
                    Chartist.plugins.ctBarLabels({
                        labelInterpolationFnc: function (value) {
                            var result = value + '%';
                            if (!value) {
                                return '';
                            }
                            if (value === 1 || value === 99) {
                                _.each(self.valuesInPercent, function (val, key) {
                                    if (value === 1 && (((self[key] / self.total) * 100) < 1)) {
                                        result = '<1%';
                                    }
                                    if (value === 99 && (((self[key] / self.total) * 100) > 99)) {
                                        result = '>99%';
                                    }
                                });
                            }
                            return result;
                        },
                        position: {
                            y: function (data) {
                                return data.y1 * 0.5;
                            }
                        }
                    }),
                    Chartist.plugins.tooltip({
                        tooltipFnc: function (meta) {
                            var tooltipString = '';
                            if (meta === Localization.widgets.launchPassed) {
                                tooltipString = meta + ': ' + self.passed;
                            } else if (meta === Localization.widgets.launchNotPassed) {
                                tooltipString = meta + ': ' + self.notPassed;
                            }
                            return tooltipString;
                        },
                        tooltipOffset: {
                            x: 0,
                            y: -5
                        }
                    })
                ]
            }).on('draw', function (data) {
                if (data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: ' + (data.element.root().height() * 0.35) + 'px' // 35% from SVG height
                    });
                }
            });
        },
        drawPieChart: function () {
            var self = this;
            var chartData = {
                series: [
                    {
                        value: this.valuesInPercent.notPassed,
                        meta: Localization.widgets.launchNotPassed,
                        className: 'ct-series-notPassed'
                    },
                    {
                        value: this.valuesInPercent.passed,
                        meta: Localization.widgets.launchPassed,
                        className: 'ct-series-passed'
                    }

                ]
            };
            this.chart = new Chartist.Pie($('[data-js-chart-container]', this.$el)[0], chartData, {
                labelInterpolationFnc: function (value) {
                    var result = value + '%';
                    if (value === 1 || value === 99) {
                        _.each(self.valuesInPercent, function (val, key) {
                            if (value === 1 && (((self[key] / self.total) * 100) < 1)) {
                                result = '<1%';
                            }
                            if (value === 99 && (((self[key] / self.total) * 100) > 99)) {
                                result = '>99%';
                            }
                        });
                    }
                    return result;
                },
                chartPadding: (this.$el.hasClass('h-less-then-5') || this.$el.hasClass('w-less-then-5')) ? 15 : 30,
                labelOffset: (this.$el.hasClass('h-less-then-5') || this.$el.hasClass('w-less-then-5')) ? 10 : 20,
                labelPosition: 'outside',
                ignoreEmptyValues: true,
                plugins: [
                    Chartist.plugins.legend({
                        position: $('[data-js-legend]', this.$el)[0],
                        legendNames: [
                            Localization.widgets.launchNotPassed,
                            Localization.widgets.launchPassed

                        ],
                        classNames: ['notPassed', 'passed'],
                        clickable: false
                    }),
                    Chartist.plugins.tooltip({
                        tooltipFnc: function (meta) {
                            var tooltipString = '';
                            if (meta === Localization.widgets.launchPassed) {
                                tooltipString = meta + ': ' + self.passed;
                            } else if (meta === Localization.widgets.launchNotPassed) {
                                tooltipString = meta + ': ' + self.notPassed;
                            }
                            return tooltipString;
                        },
                        tooltipOffset: {
                            x: 0,
                            y: -5
                        }
                    })
                ]
            });
        },
        isDrawPie: function (widgetOptions) {
            return (widgetOptions && widgetOptions.viewMode && widgetOptions.viewMode.length && widgetOptions.viewMode[0] === 'pieChartMode');
        },
        updateWidget: function () {
            if (!this.chart) {
                return;
            }
            if ($(this.chart.container).hasClass('passing-rate-pie-view')) {
                if (this.$el.hasClass('h-less-then-5') || this.$el.hasClass('w-less-then-5')) {
                    this.chart && this.chart.update(null, {
                        chartPadding: 15,
                        labelOffset: 10
                    }, true);
                } else {
                    this.chart && this.chart.update(null, {
                        chartPadding: 30,
                        labelOffset: 20
                    }, true);
                }
            } else {
                this.chart && this.chart.update();
            }
        }
    });

    return PassingRateSummaryChart;
});
