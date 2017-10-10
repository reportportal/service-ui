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
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var LaunchesComparisonChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-launches-comparison-chart',
        tooltipTemplate: 'tpl-widget-launches-comparison-chart-tooltip',
        className: 'launches-comparison-chart',

        render: function () {
            var data;
            this.scrollers = [];
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }
            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            data = this.model.getContent().result;
            this.defectTypesCollection = new SingletonDefectTypeCollection();
            this.defectTypesCollection.ready.done(function () {
                this.$el.html(Util.templates(this.template, {}));
                this.drawGroupedBarChart($('[data-js-chart-container]', this.$el), data);
            }.bind(this));
        },

        drawGroupedBarChart: function ($el, data) {
            var self = this;
            var chartData = {};
            var chartDataOrdered = [];
            var legendScroller;
            var itemNames;
            var itemData = [];
            var colors = {};
            var contentFields = this.model.getContentFields();

            // prepare columns array and fill it witch field names
            _.each(data[0].values, function (val, key) {
                var defectModel;
                var locator;
                var splitted = key.split('$');
                var shortKey = ~key.indexOf('$executionCounter') ? splitted[splitted.length - 1] : splitted[splitted.length - 2];
                switch (shortKey) {
                case 'total':
                    colors[shortKey] = '#489BC1';
                    break;
                case 'passed':
                    colors[shortKey] = '#8db677';
                    break;
                case 'failed':
                    colors[shortKey] = '#e86c42';
                    break;
                case 'skipped':
                    colors[shortKey] = '#bfc7cc';
                    break;
                case 'productBug':
                    locator = 'PB001';
                    break;
                case 'automationBug':
                    locator = 'AB001';
                    break;
                case 'systemIssue':
                    locator = 'SI001';
                    break;
                case 'noDefect':
                    locator = 'ND001';
                    break;
                case 'toInvestigate':
                    locator = 'TI001';
                    break;
                default:
                    break;
                }
                defectModel = this.defectTypesCollection.getDefectByLocator(locator);
                defectModel && (colors[shortKey] = defectModel.get('color'));
                chartData[shortKey] = [shortKey];
            }.bind(this));

            // fill columns arrays with values
            _.each(data, function (item) {
                itemData.push({
                    id: item.id,
                    name: item.name,
                    number: item.number,
                    startTime: item.startTime
                });
                _.each(item.values, function (val, key) {
                    var splitted = key.split('$');
                    var shortKey = ~key.indexOf('$executionCounter') ? splitted[splitted.length - 1] : splitted[splitted.length - 2];
                    chartData[shortKey].push(val);
                });
            });

            // reorder colums array in accordance with contentFields array
            _.each(contentFields, function (key) {
                var splitted = key.split('$');
                var shortKey = ~key.indexOf('$executions') ? splitted[splitted.length - 1] : splitted[splitted.length - 2];
                var column;
                if (shortKey !== 'total') {
                    switch (shortKey) {
                    case 'product_bug':
                        column = chartData.productBug;
                        break;
                    case 'automation_bug':
                        column = chartData.automationBug;
                        break;
                    case 'system_issue':
                        column = chartData.systemIssue;
                        break;
                    case 'no_defect':
                        column = chartData.noDefect;
                        break;
                    case 'to_investigate':
                        column = chartData.toInvestigate;
                        break;
                    default:
                        column = chartData[shortKey];
                        break;
                    }
                    column && chartDataOrdered.push(column);
                }
            });
            // get column item names in correct order
            itemNames = _.map(chartDataOrdered, function (item) {
                return item[0];
            });
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: chartDataOrdered,
                    type: 'bar',
                    onclick: function (d, element) {
                        !self.unclickableChart && config.router.navigate(self.linkToRedirectService(d.id, itemData[d.index].id), { trigger: true });
                    },
                    order: null,
                    colors: colors
                },
                bar: {
                    width: {
                        ratio: 0.8 // this makes bar width 50% of length between ticks
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
                            centered: true,
                            inner: true,
                            outer: false
                        }
                    },
                    y: {
                        show: !self.isPreview,
                        padding: {
                            top: 0
                        },
                        max: 100,
                        label: {
                            text: '% ' + Localization.widgets.ofTestCases,
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
                        var name;
                        switch (id) {
                        case 'productBug':
                            name = self.defectTypesCollection.getDefectByLocator('PB001').get('longName');
                            break;
                        case 'automationBug':
                            name = self.defectTypesCollection.getDefectByLocator('AB001').get('longName');
                            break;
                        case 'systemIssue':
                            name = self.defectTypesCollection.getDefectByLocator('SI001').get('longName');
                            break;
                        case 'noDefect':
                            name = self.defectTypesCollection.getDefectByLocator('ND001').get('longName');
                            break;
                        case 'toInvestigate':
                            name = self.defectTypesCollection.getDefectByLocator('TI001').get('longName');
                            break;
                        default:
                            name = Localization.launchesHeaders[id];
                            break;
                        }

                        return Util.templates(self.tooltipTemplate, {
                            launchName: launchData.name,
                            launchNumber: launchData.number,
                            startTime: self.formatDateTime(launchData.startTime),
                            color: color(d[0].id),
                            itemName: name,
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
                        var name;
                        switch (id) {
                        case 'productBug':
                            name = self.defectTypesCollection.getDefectByLocator('PB001').get('longName');
                            break;
                        case 'automationBug':
                            name = self.defectTypesCollection.getDefectByLocator('AB001').get('longName');
                            break;
                        case 'systemIssue':
                            name = self.defectTypesCollection.getDefectByLocator('SI001').get('longName');
                            break;
                        case 'noDefect':
                            name = self.defectTypesCollection.getDefectByLocator('ND001').get('longName');
                            break;
                        case 'toInvestigate':
                            name = self.defectTypesCollection.getDefectByLocator('TI001').get('longName');
                            break;
                        default:
                            name = Localization.launchesHeaders[id];
                            break;
                        }
                        return '<div class="color-mark"></div>' + name;
                    })
                    .each(function (id) {
                        d3.select(this).select('.color-mark').style('background-color', self.chart.color(id));
                    })
                    .on('mouseover', function (id) {
                        self.chart.focus(id);
                    })
                    .on('mouseout', function (id) {
                        self.chart.revert();
                    })
                    .on('click', function (id) {
                        $('.color-mark', $(this)).toggleClass('unchecked');
                        self.chart.toggle(id);
                    });
                d3.select(this.chart.element).select('.legend')
                    .append('div')
                    .attr('class', 'legend-gradient')
                    .append('div')
                    .attr('class', 'legend-border');
                legendScroller = Util.setupBaronScroll($('[data-js-legend-wrapper]', $el));
                this.scrollers.push(legendScroller);
            }
        },
        updateWidget: function () {
            this.chart.resize({
                height: this.$el.parent().height()
            });
            this.chart.flush();
        },
        onBeforeDestroy: function () {
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return LaunchesComparisonChart;
});
