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
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Localization = require('localization');
    var d3 = require('d3');
    var App = require('app');
    var config = App.getInstance();

    var LaunchStatisticsCommonView = C3ChartWidgetView.extend({
        tooltipTemplate: 'tpl-widget-launch-statistics-chart-tooltip',

        render: function () {
            var data;
            this.isTimeLine = !!this.model.getWidgetOptions().timeline;
            this.isZoomEnabled = !!this.model.getWidgetOptions().zoom;
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
            this.defectTypesCollection = new SingletonDefectTypeCollection();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.defectTypesCollection.ready.done(function () {
                this.launchFilterCollection.ready.done(function () {
                    this.drawChart($('[data-js-chart-container]', this.$el), data); // child view function
                }.bind(this));
            }.bind(this));
        },
        getProcessedData: function (data) {
            var contentFields = this.model.getContentFields();
            var chartDataUnsorted = {};
            var chartData = {
                columns: [],
                colors: {},
                itemNames: [],
                itemsData: [],
                isSingleColumn: false
            };
            // prepare columns array and fill it witch field names
            _.each(data[0].values, function (val, key) {
                var defectModel;
                chartDataUnsorted[key] = [key];
                if (~key.indexOf('$executions$') || ~key.indexOf('$total')) {
                    chartData.colors[key] = config.defaultColors[key.split('$')[2]];
                } else {
                    defectModel = _.find(this.defectTypesCollection.models, function (model) {
                        return model.get('locator') === key.split('$')[3];
                    });
                    defectModel && (chartData.colors[key] = defectModel.get('color'));
                }
            }.bind(this));
            // fill columns arrays with values
            if (this.isTimeLine) {
                _.each(data, function (item) {
                    chartData.itemsData.push({
                        date: item.date
                    });
                    _.each(item.values, function (val, key) {
                        chartDataUnsorted[key].push(+val);
                    });
                });
            } else {
                _.each(data, function (item) {
                    chartData.itemsData.push({
                        id: item.id,
                        name: item.name,
                        number: item.number,
                        startTime: item.startTime
                    });
                    _.each(item.values, function (val, key) {
                        chartDataUnsorted[key].push(+val);
                    });
                });
            }
            chartData.isSingleColumn = chartData.itemsData.length < 2;
            // reorder colums array in accordance with contentFields array
            _.each(contentFields, function (key) {
                chartData.columns.push(chartDataUnsorted[key]);
            });
            // get column item names in correct order
            chartData.itemNames = _.map(chartData.columns, function (item) {
                return item[0];
            });

            return chartData;
        },
        setupLegend: function (chartData) {
            var self = this;
            d3.select(this.chart.element)
                .insert('div', '.chart')
                .attr('class', 'legend')
                .insert('div', '.legend')
                .attr('data-js-legend-wrapper', '') // wrapper for BaronScroll
                .selectAll('span')
                .data(chartData.itemNames)
                .enter()
                .append('span')
                .attr('data-id', function (id) { return id; })
                .html(function (id) {
                    var name;
                    var defectModel;
                    if (~id.indexOf('$executions$') || ~id.indexOf('$total')) {
                        name = Localization.filterNameById[id];
                    } else {
                        defectModel = _.find(self.defectTypesCollection.models, function (model) {
                            return model.get('locator') === id.split('$')[3];
                        });
                        (defectModel) ? (name = defectModel.get('longName')) : (name = id.split('$')[3]);
                    }
                    return '<div class="color-mark"></div>' + name;
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
                    if ($('.color-mark', $(this)).hasClass('unchecked')) {
                        $('.color-mark', $(this)).removeClass('unchecked');

                        $('.c3-target-' + id.replaceAll(/[$_]/, '-'), self.$el).show();
                    } else {
                        $('.color-mark', $(this)).addClass('unchecked');
                        $('.c3-target-' + id.replaceAll(/[$_]/, '-'), self.$el).hide();
                    }
                    self.chart.toggle(id);
                });
            d3.select(this.chart.element).select('.legend')
                .append('div')
                .attr('class', 'legend-gradient')
                .append('div')
                .attr('class', 'legend-border');
        },
        destroyLegend: function () {
            d3.selectAll($('[data-js-legend-wrapper] span', this.$el)).on('click mouseover mouseout', null);
            $('.legend', this.$el).remove();
            return true;
        },
        onBeforeDestroy: function () {
            this.destroyLegend();
            this.chart && this.removeChartListeners();
            this.chart && (this.chart = this.chart.destroy());
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return LaunchStatisticsCommonView;
});
