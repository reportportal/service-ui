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
    var _ = require('underscore');
    var App = require('app');
    var Localization = require('localization');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var LaunchesComparisonChart = ChartWidgetView.extend({

        initialize: function (options) {
            ChartWidgetView.prototype.initialize.call(this, options);
            this.tooltipLabel = '%';
        },

        getSeries: function () {
            var series = {};
            var contentFields = this.model.getContentFields();

            _.each(contentFields, function (i) {
                var a = i.split('$');
                var type = a[1];
                var t = type === 'defects' ? a[2] : _.last(a);
                var seriesId = t;
                var sd = config.patterns.defectsLocator;
                var name = Localization.launchesHeaders[seriesId];
                var defect;
                if (seriesId !== 'total') {
                    if (type === 'defects') {
                        defect = _.map(a[2].split('_'), function (d, n) { return n > 0 ? d.capitalize() : d; });
                        t = defect.join('');
                    }
                    if (!series[t]) {
                        series[t] = {
                            key: name,
                            seriesId: seriesId,
                            color: this.getSeriesColor(seriesId),
                            values: []
                        };
                    }
                    if (type === 'defects' && sd.test(_.last(a))) {
                        series[t].key = name;
                    }
                }
            }, this);
            this.series = series;
            return this.series;
        },

        getData: function () {
            var contentData = this.model.getContent() || [];
            var series;
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                series = this.getSeries();

                _.each(contentData.result, function (d, i) {
                    var cat = {
                        id: d.id,
                        name: d.name,
                        number: '#' + d.number,
                        startTime: parseInt(d.startTime, 10)
                    };
                    this.categories.push(cat);
                    _.each(d.values, function (v, k) {
                        var a = k.split('$');
                        var type = a[1];
                        var id = type === 'issueCounter' ? a[2] : _.last(a);
                        var prop = _.extend({ x: i + 1, y: parseFloat(v) }, cat);

                        if (series[id]) {
                            if (_.isObject(series[id].values[i])) {
                                series[id].values[i].y += parseFloat(v);
                            } else {
                                series[id].values.push(prop);
                            }
                        }
                    });
                }, this);
                return _.values(series);
            }
            return [];
        },

        render: function () {
            var data = this.getData();
            var self = this;
            var tooltip = this.tooltipContent();
            var vis;
            var tip;

            this.addSVG();

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
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
                .axisLabelDistance(-10)
                .tickFormat(function (d) {
                    return d;
                })
                .tickValues(_.range(0, 101, 10))
                .axisLabel('% ' + Localization.widgets.ofTestCases);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                });

            tip = this.createTooltip();
            vis = d3.select($('svg', this.$el).get(0))
                .datum(data)
                .call(this.chart)
                .call(tip);

            this.addLaunchNameTip(vis, tip);
            this.addLegendClick(vis);
            this.redirectOnElementClick('multibar');
            this.addResize();
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
        }
    });

    return LaunchesComparisonChart;
});
