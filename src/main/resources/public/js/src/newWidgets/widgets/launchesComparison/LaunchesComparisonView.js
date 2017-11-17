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
                chartData[key] = [key];
                colors[key] = config.defaultColors[key.split('$')[2]];
            });

            // fill columns arrays with values
            _.each(data, function (item) {
                itemData.push({
                    id: item.id,
                    name: item.name,
                    number: item.number,
                    startTime: item.startTime
                });
                _.each(item.values, function (val, key) {
                    chartData[key].push(val);
                });
            });

            // reorder colums array in accordance with contentFields array
            _.each(contentFields, function (key) {
                if (key === 'statistics$executions$total') { // do not show executionsTotal
                    return;
                }
                chartDataOrdered.push(chartData[key]);
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
                        !self.unclickableChart && config.router.navigate(self.linkToRedirectService(d.id.split('$')[2], itemData[d.index].id), { trigger: true });
                    },
                    order: null,
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
                        return Util.templates(self.tooltipTemplate, {
                            launchName: launchData.name,
                            launchNumber: launchData.number,
                            startTime: self.formatDateTime(launchData.startTime),
                            color: color(id),
                            itemName: Localization.filterNameById[id.split('$total')[0]],
                            itemCases: d[0].value
                        });
                    }
                },
                size: {
                    height: self.$el.parent().height()
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-chart-bar path', $el)).each(function () {
                        var elem = d3.select(this);
                        if (elem.datum().value === 0) {
                            elem.style('stroke-width', '3px');
                        }
                    });
                }
            });
            // Configuring custom legend block
            if (!self.isPreview && !self.unclickableChart) {
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
                        return '<div class="color-mark"></div>' + Localization.filterNameById[id.split('$total')[0]];
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

    return LaunchesComparisonChart;
});
