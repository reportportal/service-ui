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
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var InvestigatedTrendChart = ChartWidgetView.extend({
        initialize: function (options) {
            ChartWidgetView.prototype.initialize.call(this, options);
            this.tooltipLabel = '%';
        },

        getData: function () {
            var contentData = this.model.getContent() || [];
            var series;
            var pairs;
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                series = {
                    to_investigate: { key: Localization.widgets.toInvestigate, seriesId: 'to_investigate' },
                    investigated: { key: Localization.widgets.investigated, seriesId: 'investigated' }
                };
                _.each(series, function (val, key) {
                    val.color = this.getSeriesColor(key);
                    val.values = [];
                }, this);
                if (!this.model.get('isTimeline')) {
                    _.each(contentData.result, function (d, i) {
                        var cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime, 10)
                        };
                        this.categories.push(cat);
                        _.each(d.values, function (v, k) {
                            var prop = _.extend({ x: i + 1, y: parseFloat(v) }, cat);
                            series[k].values.push(prop);
                        });
                    }, this);
                } else {
                    pairs = _.pairs(contentData);
                    pairs.sort(function (a, b) {
                        return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix();
                    });
                    _.each(pairs, function (p, i) {
                        var values = p[1][0].values;
                        var date = Moment(p[0], 'YYYY-MM-DD');
                        var cat = {
                            time: date.format('YYYY-MM-DD'),
                            startTime: date.unix()
                        };
                        this.categories.push(cat);
                        _.each(values, function (v, k) {
                            var prop = { startTime: date.unix(), x: i + 1, y: parseFloat(v) };
                            series[k].values.push(prop);
                        });
                    }, this);
                }
                this.series = _.values(series);
                return this.series;
            }
            return [];
        },

        render: function () {
            var data = this.getData();
            var self = this;
            var tooltip = this.tooltipContent();
            var tip;
            var vis;
            var cup;
            var update;
            var emptyData = this.model.getContent();
            if (!this.isEmptyData(emptyData)) {
                this.addSVG();

                this.chart = nvd3.models.multiBarChart()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .stacked(true)
                    .forceY([0, 1])
                    .showControls(false)
                    .clipEdge(true)
                    .showXAxis(true)
                    .yDomain([0, 100])
                    .tooltips(!self.isPreview)
                    .showLegend(!self.isPreview)
                ;

                this.chart.tooltipContent(tooltip);

                this.chart.yAxis
                    .tickFormat(function (d) {
                        return d;
                    })
                    .axisLabelDistance(-10)
                    .axisLabel(Localization.widgets.ofInvestigation)
                ;

                this.chart.xAxis
                    .showMaxMin(false)
                    .tickFormat(function (d) {
                        return self.formatNumber(d);
                    });

                tip = this.createTooltip();
                vis = d3.select($('svg', this.$el).get(0))
                    .datum(data)
                    .call(this.chart)
                    .call(tip);

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
            } else {
                this.addNoAvailableBock();
            }
        }
    });

    return InvestigatedTrendChart;
});
