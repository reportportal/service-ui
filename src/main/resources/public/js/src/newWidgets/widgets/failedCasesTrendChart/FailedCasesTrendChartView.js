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
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var FailedCasesTrendChart = ChartWidgetView.extend({
        initialize: function (options) {
            ChartWidgetView.prototype.initialize.call(this, options);
            this.label = Localization.widgets.casesLabel;
            this.labelName = Localization.widgets.failedCases;
        },
        getData: function () {
            var series = {};
            var contentData = this.model.getContent() || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                series.key = Localization.widgets.failed;
                series.color = this.getSeriesColor('failed');
                series.values = [];
                _.each(contentData.result, function (d, i) {
                    var val = d.values.issuesCount;
                    var cat = {
                        id: d.id,
                        name: d.name,
                        number: '#' + d.number,
                        startTime: parseInt(d.startTime, 10)
                    };
                    this.categories.push(cat);
                    series.values.push(_.extend({ value: parseInt(val, 10), num: i + 1 }, cat));
                }, this);
                return [series];
            }
            return [];
        },
        render: function () {
            var data = this.getData();
            var self = this;
            var tip;
            var vis;
            var cup;
            var update;
            var emptyData = this.model.getContent();
            if (!this.isEmptyData(emptyData)) {
                this.addSVG();

                this.chart = nvd3.models.lineChart()

                    .x(function (d) {
                        return d.num;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .interactive(false)
                    .useInteractiveGuideline(!self.isPreview)
                    .showLegend(!self.isPreview)
                ;

                this.chart.yAxis
                    .tickFormat(function (d) {
                        return d.toFixed();
                    })
                    .axisLabelDistance(-10)
                    .axisLabel(this.labelName)
                ;

                this.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatNumber(d);
                    });

                if (this.yDomain) {
                    this.chart.yDomain(this.yDomain);
                }

                tip = this.createTooltip();
                vis = d3.select($('svg', this.$el).get(0))
                    .datum(data)
                    .call(this.chart)
                    .call(tip)
                ;

                this.addLaunchNameTip(vis, tip);

                this.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });

                cup = self.chart.update;
                update = function () {
                    self.chart.xAxis.tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                    cup();
                    self.chart.xAxis
                        .tickFormat(function (d) {
                            return self.formatCategories(d);
                        });
                    self.chart.update = update;
                    self.addLaunchNameTip(vis, tip);
                };
                this.chart.update = update;
                this.addResize();
                if (self.isPreview) {
                    this.disabeLegendEvents();
                }
            } else {
                this.addNoAvailableBock();
            }
        }
    });

    return FailedCasesTrendChart;
});
