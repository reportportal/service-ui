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
    var Localization = require('localization');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var LastLaunchPieChartView = C3ChartWidgetView.extend({
        template: 'tpl-widget-project-info-double-chart',
        tooltipTemplate: 'tpl-widget-project-info-chart-tooltip',
        className: 'project-info-chart last-launch-statistics',
        render: function () {
            var statusChartData = {
                columns: {
                    statistics$executions$passed: ['statistics$executions$passed'],
                    statistics$executions$failed: ['statistics$executions$failed'],
                    statistics$executions$skipped: ['statistics$executions$skipped']
                },
                colors: {
                    statistics$executions$passed: config.defaultColors.passed,
                    statistics$executions$failed: config.defaultColors.failed,
                    statistics$executions$skipped: config.defaultColors.skipped
                }
            };
            var defectTypesChartData = {
                columns: {
                    statistics$defects$product_bug: ['statistics$defects$product_bug'],
                    statistics$defects$automation_bug: ['statistics$defects$automation_bug'],
                    statistics$defects$system_issue: ['statistics$defects$system_issue'],
                    statistics$defects$to_investigate: ['statistics$defects$to_investigate']
                },
                colors: {
                    statistics$defects$product_bug: config.defaultColors.productBug,
                    statistics$defects$automation_bug: config.defaultColors.automationBug,
                    statistics$defects$system_issue: config.defaultColors.systemIssue,
                    statistics$defects$to_investigate: config.defaultColors.toInvestigate
                }
            };
            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            this.charts = [];
            _.each(this.model.getContent().result[0].values, function (val, key) {
                if (key !== 'statistics$executions$total') {
                    (~key.indexOf('$executions$')) ? statusChartData.columns[key].push(+val) : defectTypesChartData.columns[key].push(+val);
                }
            });
            statusChartData.total = this.model.getContent().result[0].values.statistics$executions$total;
            defectTypesChartData.total = _.reduce(defectTypesChartData.columns, function (memo, num) { return memo + num[1]; }, 0);
            this.$el.html(Util.templates(this.template));
            $('[data-js-left-chart-container]', this.$el).addClass('status-chart');
            this.drawDonutChart($('[data-js-left-chart-container]', this.$el), statusChartData);
            $('[data-js-right-chart-container]', this.$el).addClass('issues-chart');
            this.drawDonutChart($('[data-js-right-chart-container]', this.$el), defectTypesChartData);
        },
        drawDonutChart: function ($el, data) {
            var self = this;
            var donutTitle;
            var chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: _.values(data.columns),
                    type: 'donut',
                    order: null,
                    colors: data.colors
                },
                legend: {
                    show: false
                },
                donut: {
                    title: data.total,
                    label: {
                        show: false,
                        threshold: 0.05
                    }
                },
                tooltip: {
                    position: function (d, width, height, element) {
                        var left = d3.mouse(chart.element)[0] - (width / 2);
                        var top = d3.mouse(chart.element)[1] - height;
                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        return '<div class="tooltip-val">' + d[0].value + ' (' + self.getRoundedToDecimalPlaces(d[0].ratio * 100, 2).toFixed(2) + '%)</div>' +
                            '<div class="tooltip-title">' +
                            '<div class="color-mark" style="background-color: ' + color(d[0].id) + ';"></div>' +
                            Localization.filterNameById[d[0].id] +
                            '</div>';
                    }
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    $('.c3-chart-arcs-title', $el).contents()[0].textContent = data.total;
                    $('.c3-chart-arcs-title', $el).attr('dy', '-5').find('tspan').attr('dy', '15');
                }
            });
            // Configuring custom donut chart title
            if ($el.hasClass('status-chart')) {
                donutTitle = Localization.widgets.pieSum;
            } else if ($el.hasClass('issues-chart')) {
                donutTitle = Localization.widgets.pieIssues;
            }
            d3.select(chart.element).select('.c3-chart-arcs-title').attr('dy', -5)
                .append('tspan')
                .attr('dy', 16)
                .attr('x', 0)
                .text(donutTitle);
            this.charts.push(chart);
        },
        onBeforeDestroy: function () {
            _.each(this.charts, function (chart) {
                chart.destroy();
            });
            this.charts = null;
        }
    });

    return LastLaunchPieChartView;
});
