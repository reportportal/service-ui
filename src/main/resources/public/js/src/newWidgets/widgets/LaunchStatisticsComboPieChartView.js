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
    var Util = require('util');
    var App = require('app');
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var LaunchStatisticsComboPieChart = ChartWidgetView.extend({
        initialize: function (options) {
            ChartWidgetView.prototype.initialize.call(this, options);
            this.issues = 0;
            this.total = 0;
            this.charts = [];
        },
        pieGrid: 'tpl-pie-grid',
        addSVG: function (data) {
            this.$el.attr(this.attributes()).append(
                Util.templates(this.pieGrid, { id: this.id, stats: data })
            );
        },
        roundLabels: function (d) {
            var label = (d % 2 === 0) ? d * 100 : d3.round(d * 100, 2);
            var sum = d3.round(this.forLabels.sum + label, 2);
            ++this.forLabels.count;
            if (this.forLabels.count === this.forLabels.size) {
                if (sum > 100 || sum < 100) {
                    label = d3.round(100 - this.forLabels.sum, 2);
                }
            }
            this.forLabels.sum = sum;
            return label + '%';
        },
        // LAST LAUNCH STATISTIC
        renderPie: function (data, id, title) {
            var self = this;
            var chart;
            var vis;

            this.forLabels = { size: data.length, count: 0, sum: 0 };
            chart = nvd3.models.pieChart()
                .x(function (d) {
                    return d.key;
                })
                .y(function (d) {
                    return d.value;
                })
                .margin({ top: !self.isPreview ? 30 : 0, right: 20, bottom: 0, left: 20 })
                .valueFormat(d3.format('f'))
                .showLabels(!self.isPreview)
                .color(function (d) {
                    return d.data.color;
                })
                .title(!self.isPreview ? title + ':' : '')
                .titleOffset(-10)
                .growOnHover(false)
                .labelThreshold(0)
                .labelType('percent')
                .legendPosition(title === 'Issues' && data.length > 9 ? 'right' : 'top')
                .labelFormat(function (d) {
                    return self.roundLabels(d);
                })
                .donut(true)
                .donutRatio(0.4)
                .tooltips(!self.isPreview)
                .showLegend(!self.isPreview)
            ;

            vis = d3.select($(id, this.$el).get(0))
                .datum(data)
                .call(chart)
            ;

            vis.selectAll('.nvd3.nv-wrap.nv-pie').each(function (d, i) {
                $(this).on('mouseenter', function () {
                    config.trackingDispatcher.trackEventNumber(343);
                });
            });

            this.charts.push(chart);
            this.addResize();
            this.redirectOnElementClick(chart, 'pie');
            this.updateOnLegendClick(chart, id);
            if (self.isPreview) {
                this.disabeLegendEvents(chart);
            }
            this.updateInvalidCriteria(vis);

            // fix for no data message for "LAST LAUNCH STATISTIC WIDGET" on status page
            if (_.isEmpty(data)) {
                this.fixNoDataMessage(id);
            }
        },
        updateTotal: function (id) {
            var data = d3.select($(id, this.$el).get(0)).data()[0];
            var total = 0;
            _.each(data, function (item) {
                total = item.disabled ? total : total + parseInt(item.value, 10);
            });
            $('.nv-pie-title tspan', id).text(total);
        },
        updateOnLegendClick: function (chart, id) {
            var self = this;
            chart.legend.dispatch.on('legendClick', function (d, i) {
                config.trackingDispatcher.trackEventNumber(342);
                self.updateTotal(id);
            });
            chart.legend.dispatch.on('legendDblclick', function (d, i) {
                config.trackingDispatcher.trackEventNumber(342);
                self.updateTotal(id);
            });
        },
        disabeLegendEvents: function (chart) {
            if (chart.legend) {
                for (var property in chart.legend.dispatch) {
                    chart.legend.dispatch[property] = function () {
                    };
                }
            }
        },
        renderTitle: function (id, type) {
            var ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            $('.nv-pie-title', id).append($(ts).attr({ x: '0', dy: '1.2em' }).text(type));
        },
        redirectOnElementClick: function (chart, type) {
            var self = this;
            chart[type].dispatch.on('elementClick', null);
            if (!this.isPreview) {
                chart[type].dispatch.on('elementClick', function (e) {
                    var key = e.label;
                    var seria = _.find(self.series, function (v, k) {
                        return v.key === key;
                    });
                    var seriesId = seria ? seria.seriesId : '';
                    var id = e.point.launch.id;
                    var link = seriesId && id ? self.linkToRedirectService(seriesId, id) : '';
                    config.trackingDispatcher.trackEventNumber(344);
                    nvd3.tooltip.cleanup();
                    if (link) {
                        document.location.hash = link;
                    }
                });
            }
        },
        getData: function () {
            var contentData = this.model.getContent() || [];
            if (!_.isEmpty(contentData) && !_.isEmpty(contentData.result)) {
                var series = this.getSeries();
                var data = contentData.result[0];
                var stats = {
                    issues: [],
                    exec: []
                };
                var pairs = _.pairs(data.values);

                pairs.sort(function (a, b) {
                    return a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1;
                });
                _.each(pairs, function (p) {
                    var key = p[0];
                    var a = key.split('$');
                    var type = a[1];
                    var id = _.last(a);
                    var val = parseInt(p[1], 10);
                    var seria = series[id];
                    if (seria) {
                        seria.value = val;
                        seria.launch = {
                            name: data.name,
                            number: '#' + data.number,
                            startTime: parseInt(data.startTime, 10),
                            id: data.id
                        };
                    }
                    if (id === 'total') {
                        this.total = val;
                    } else if (type === 'executionCounter') {
                        stats.exec.push(seria);
                    } else if (type === 'issueCounter') {
                        this.issues += val;
                        stats.issues.push(seria);
                    }
                }, this);
                return stats;
            }
            return [];
        },
        render: function () {
            var data = this.getData();
            var exec = data.exec || [];
            var issues = data.issues || [];
            this.addSVG(data);

            this.renderPie(this.checkForZeroData(exec), '#' + this.id + '-svg1', 'Sum');
            this.renderPie(this.checkForZeroData(issues), '#' + this.id + '-svg2', 'Issues');
            if (!_.isEmpty(this.model.getContent())) {
                this.renderTitle('#' + this.id + '-svg1', this.total);
                this.renderTitle('#' + this.id + '-svg2', this.issues);
            }
        },
        checkForZeroData: function (data) {
            return !_.all(data, function (v) {
                return v.value === 0;
            }) ? data : [];
        },
        fixNoDataMessage: function (id) {
            var svg = $(id, this.$el);
            var vis = d3.select(svg.get(0));
            if (svg.width() > 180) {
                vis.attr('viewBox', null)
                    .attr('preserveAspectRatio', null);
            } else {
                vis.attr('viewBox', '-30 40 200 100')
                    .attr('preserveAspectRatio', 'xMinYMid meet');
            }
        },
        updateWidget: function () {
            _.each(this.charts, function (chart) {
                chart && chart.update();
            }, this);
        }
    });

    return LaunchStatisticsComboPieChart;
});
