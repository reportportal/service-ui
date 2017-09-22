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
    var App = require('app');
    var Moment = require('moment');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var LaunchStatisticsLineChart = ChartWidgetView.extend({

        redirectOnElementClick: function () {
            var self;
            var svg;
            var point;
            this.chart.stacked.dispatch.on('areaClick', null);
            this.chart.stacked.dispatch.on('areaClick.toggle', null);
            if (!this.isPreview) {
                self = this;
                svg = d3.select('#' + this.id + ' svg');
                point = svg.select('.nv-scatterWrap').selectAll('path.nv-point');

                this.chart.stacked.dispatch.on('areaClick', function (e) {
                    config.trackingDispatcher.trackEventNumber(344);
                    self.redirectTo(e);
                });
                point.each(function () {
                    d3.select(this).on('click', function (e) {
                        config.trackingDispatcher.trackEventNumber(344);
                        self.redirectTo(e);
                    });
                });
            }
        },
        redirectTo: function (e) {
            var o = { series: {} };
            var svg;
            var data;
            var cat;
            if (!_.has(e, 'pointIndex')) {
                svg = d3.select('#' + this.id + ' svg');
                data = svg.data();
                o.series.key = (data && data[0] && data[0][e.seriesIndex]) ?
                    data[0][e.seriesIndex].key : null;
                o.pointIndex = parseInt(e.index, 10);
            } else {
                o.series.key = e.series;
                o.pointIndex = parseInt(e.pointIndex, 10);
            }
            if (this.model.get('isTimeline')) {
                cat = this.categories[o.pointIndex];
                o.point = { startTime: cat.startTime };
                this.redirectForTimeLine(o);
            } else {
                this.redirectToLaunch(o);
            }
        },
        updateTooltips: function () {
            var contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator();
            var tooltip = this.chart.interactiveLayer.tooltip;
            tooltip.contentGenerator(function (d) {
                var date = d.value.split('>')[d.value.split('>').length - 2];
                var dateClear = date.split('<')[0];
                d.value = Moment(dateClear).format('YYYY-MM-DD');
                return contentGenerator(d);
            });
        },
        render: function () {
            var data = this.getData();
            var self = this;
            var vis;
            var tip;
            var cup;
            var update;
            var emptyData = this.model.getContent();
            if (!this.isEmptyData(emptyData)) {
                this.addSVG();
                this.chart = nvd3.models.stackedAreaChart()
                    .margin({ left: 70 })
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .useInteractiveGuideline(!self.isPreview)
                    .showControls(false)
                    .clipEdge(true)
                    .showLegend(!self.isPreview)
                ;
                this.chart.xAxis
                    .showMaxMin(false)
                    .tickFormat(function (d) {
                        return self.formatNumber(d);
                    })
                ;
                this.chart.yAxis
                    .axisLabelDistance(-10)
                    .axisLabel('cases')
                ;
                this.chart.yAxisTickFormat(d3.format('d'));
                vis = d3.select($('svg', this.$el).get(0))
                    .datum(data)
                    .call(this.chart);
                tip = this.createTooltip();
                if (self.model.get('isTimeline')) {
                    self.updateTooltips();
                } else {
                    vis.call(tip);
                }
                if (self.model.get('isTimeline')) {
                    this.updateTickForTimeLine(vis);
                }
                this.addLaunchNameTip(vis, tip);
                this.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                cup = self.chart.update;
                update = function () {
                    self.updateInvalidCriteria(vis);
                    self.chart.xAxis.tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                    cup();
                    self.chart.xAxis
                        .tickFormat(function (d) {
                            return self.formatCategories(d);
                        });
                    self.chart.update = update;
                    if (self.model.get('isTimeline')) {
                        self.updateTickForTimeLine(vis);
                    }
                    self.addLaunchNameTip(vis, tip);
                    self.redirectOnElementClick();
                    self.addLegendClick(vis);
                };
                this.chart.update = update;
                this.addResize();
                this.redirectOnElementClick();
                this.addLegendClick(vis);
                if (self.isPreview) {
                    this.disabeLegendEvents();
                }
                this.updateInvalidCriteria(vis);
            } else {
                this.addNoAvailableBock();
            }
        }
    });

    return LaunchStatisticsLineChart;
});
