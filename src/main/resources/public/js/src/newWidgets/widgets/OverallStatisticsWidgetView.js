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
    var ChartWidgetView = require('newWidgets/_ChartWidgetView');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var d3 = require('d3');
    var nvd3 = require('nvd3');
    var App = require('app');

    var config = App.getInstance();

    var OverallStatisticsWidget = ChartWidgetView.extend({
        tpl: 'tpl-widget-statistics-panel',
        pieGrid: 'tpl-pie-grid',
        addComboSVG: function (data) {
            this.$el.attr(this.attributes()).append(
                Util.templates(this.pieGrid, { id: this.id, stats: data })
            );
        },
        getData: function () {
            var widgetOptions = this.model.getParameters().widgetOptions;
            var contentData = this.model.getContent();
            var contentFields = this.model.getContentFields();
            var values;
            var data = {
                executions: [],
                defects: [],
                executionsCount: 0,
                defectsCount: 0
            };
            if (!_.isEmpty(contentData.result) && !_.isEmpty(contentData.result[0].values)) {
                values = contentData.result[0].values;
                this.invalid = 0;

                _.each(contentFields, function (i) {
                    var a = i.split('$');
                    var type = a[1];
                    var seriesId = _.last(a);
                    var name = Localization.launchesHeaders[seriesId];
                    var value = values[seriesId];
                    var subDefect;
                    if (!name) {
                        subDefect = this.defectsCollection.getDefectType(seriesId);
                        name = subDefect.longName;
                        if (!subDefect) {
                            name = Localization.widgets.invalidCriteria;
                            seriesId = 'invalid';
                            this.invalid += 1;
                        }
                    }
                    if (widgetOptions && widgetOptions.chartMode && name === 'Total') {
                        return;
                    }
                    data[type].push({
                        key: name,
                        seriesId: seriesId,
                        type: type,
                        color: this.getSeriesColor(seriesId),
                        value: value
                    });
                    data[type + 'Count'] += +value;
                }, this);

                return data;
            }
            return data;
        },
        renderTitle: function (id, type) {
            var ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            $('.nv-pie-title', id).append($(ts).attr({ x: '0', dy: '1.2em' }).text(type));
        },
        roundLabels: function (d) {
            var label = (d % 2 === 0) ? d * 100 : d3.round(d * 100, 2);
            var sum = d3.round(this.forLabels.sum + label, 2);
            this.forLabels.count += 1;
            if (this.forLabels.count === this.forLabels.size) {
                if (sum > 100 || sum < 100) {
                    label = d3.round(100 - this.forLabels.sum, 2);
                }
            }
            this.forLabels.sum = sum;
            return label + '%';
        },
        render: function () {
            var widgetOptions = this.model.getParameters().widgetOptions;
            var params = {
                statistics: this.getData(),
                invalidDataMessage: this.invalidDataMessage(this.invalid),
                invalid: this.invalid
            };
            var data = this.getData();
            this.charts = [];
            if (data.defects.length || data.executions.length) {
                if (widgetOptions && widgetOptions.chartMode) {
                    this.appModel = new SingletonAppModel();
                    this.forLabels = { size: data.length, count: 0, sum: 0 };
                    if (!data.defects.length || !data.executions.length) {
                        this.addSVG();
                        var curData = data.defects.length ? data.defects : data.executions;
                        this.renderPieChart(curData, 'svg');
                    } else {
                        this.addComboSVG(data);
                        this.renderPieChart(data.executions, '#' + this.id + '-svg1', 'Sum');
                        this.renderPieChart(data.defects, '#' + this.id + '-svg2', 'Issues');
                        this.renderTitle('#' + this.id + '-svg1', data.executionsCount);
                        this.renderTitle('#' + this.id + '-svg2', data.defectsCount);
                    }
                    this.addResize();
                } else {
                    this.$el.html(Util.templates(this.tpl, params));
                    !this.isPreview && Util.setupBaronScroll($('.statistics-panel', this.$el));
                }
            } else {
                this.addNoAvailableBock(this.$el);
            }
        },
        renderPieChart: function (data, id, title) {
            var self = this;
            var chart = nvd3.models.pieChart()
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

            d3.select($(id, this.$el).get(0))
                .datum(data)
                .call(chart);
            this.charts.push(chart);
            this.redirectOnElementClick(chart, 'pie');
        },
        redirectOnElementClick: function (chart, type) {
            var self = this;
            chart[type].dispatch.on('elementClick', null);
            if (!this.isPreview) {
                chart[type].dispatch.on('elementClick', function (e) {
                    var project = '#' + self.appModel.get('projectId');
                    var link = project + '/launches/' + self.model.get('filter_id');
                    config.trackingDispatcher.trackEventNumber(344);
                    nvd3.tooltip.cleanup();
                    document.location.hash = link;
                });
            }
        },
        updateWidget: function () {
            _.each(this.charts, function (chart) {
                chart && chart.update();
            }, this);
        }
    });

    return OverallStatisticsWidget;
});
