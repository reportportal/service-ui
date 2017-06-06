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
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3New = require('nvd3New');

    var TrendLaunchStatisticsChart = ChartWidgetView.extend({

        render: function () {
            var data = this.getData();
            var self = this;
            var tooltip = this.tooltipContent();

            this.addSVG();

            this.chart = nvd3New.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .forceY([0, 1])
                .stacked(true)
                .showControls(false)
                .clipEdge(true)
                .showXAxis(true)
                .showLegend(!self.isPreview)
            ;

            this.chart.tooltip
                .contentGenerator(tooltip)
                .enabled(!self.isPreview)
            ;

            this.chart.yAxis
                .tickFormat(d3.format('d'))
                .axisLabelDistance(-10)
                .axisLabel('cases')
            ;

            this.chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                })
            ;

            var tip = this.createTooltip();
            var vis = d3.select($('svg', this.$el).get(0))
                .datum(data)
                .call(this.chart)
                .call(tip)
                ;

            if (self.model.get('isTimeline')) {
                this.updateTickForTimeLine(vis);
            }

            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });
            var cup = self.chart.update;
            var update = function () {
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
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('multibar');
            this.addLegendClick(vis);
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            this.updateInvalidCriteria(vis);
            return this;
        }
    });

    return TrendLaunchStatisticsChart;
});
