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
    var LaunchStatisticsCommonView = require('newWidgets/widgets/launchStatisticsChart/LaunchStatisticsChartCommonView');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var Moment = require('moment');
    var config = App.getInstance();

    var LaunchStatisticsAreaChart = LaunchStatisticsCommonView.extend({

        drawChart: function ($el, data) {
            var self = this;
            var legendScroller;
            var chartData = this.getProcessedData(data);
            this.$el.addClass('stacked-area-view');
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: chartData.columns,
                    type: 'area-spline',
                    order: null,
                    groups: [chartData.itemNames],
                    colors: chartData.colors
                },
                point: {
                    show: chartData.isSingleColumn,
                    r: 3,
                    focus: {
                        expand: {
                            r: 5
                        }
                    }
                },
                axis: {
                    x: {
                        show: !self.isPreview,
                        type: 'category',
                        categories: _.map(chartData.itemsData, function (item) {
                            var day;
                            if (self.isTimeLine) {
                                day = Moment(item.date).format('dddd').substring(0, 3);
                                return day + ', ' + item.date;
                            }
                            return '#' + item.number;
                        }),
                        tick: {
                            values: self.isTimeLine ? self.getTimelineAxisTicks(chartData.itemsData.length) : self.getLaunchAxisTicks(chartData.itemsData.length),
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: self.isTimeLine,
                            outer: false
                        }
                    },
                    y: {
                        show: !self.isPreview,
                        padding: {
                            top: 3
                        }
                    }
                },
                interaction: {
                    enabled: !self.isPreview
                },
                zoom: {
                    enabled: !self.isPreview && self.isZoomEnabled,
                    rescale: !self.isPreview && self.isZoomEnabled,
                    onzoomend: function () {
                        self.chart.flush();
                    }
                },
                subchart: {
                    show: !self.isPreview && self.isZoomEnabled,
                    size: {
                        height: 30
                    }
                },
                padding: {
                    top: self.isPreview ? 0 : 85,
                    left: self.isPreview ? 0 : 40,
                    right: self.isPreview ? 0 : 20,
                    bottom: self.isPreview || !self.isTimeLine ? 0 : 10
                },
                legend: {
                    show: false // we use custom legend
                },
                size: {
                    height: self.$el.parent().height()
                },
                onrendered: function () {
                    var interactElems = chartData.isSingleColumn ? d3.selectAll($('.c3-circle', $el)) : d3.selectAll($('.c3-area', $el));
                    var offset = this.margin.left;
                    var rects = $('.c3-event-rect', $el); // C3 event rectangles
                    var rectWidth = $(rects[0]).attr('width');
                    var rectsStartXCoords = [];
                    var tooltip = d3.selectAll($('.c3-tooltip-container', $el));
                    var id;
                    var x;
                    var rectIndex;

                    $el.css('max-height', 'none');
                    if (chartData.isSingleColumn) {
                        interactElems.each(function (d) {
                            if (!d.value) {
                                d3.select(this).style('display', 'none');
                            }
                        });
                    }
                    if (self.isPreview) {
                        return;
                    }
                    $.each(rects, function (i, elem) {
                        +rectsStartXCoords.push($(elem).attr('x'));
                    });

                    // Custom area mouse events configuring
                    interactElems
                        .on('click', function (d) {
                            var link;
                            if (self.isTimeLine) {
                                link = self.redirectForTimeLine(chartData.itemsData[rectIndex].date);
                            } else if ((~d.id.indexOf('$executions$') || ~d.id.indexOf('$total'))) {
                                link = self.linkToRedirectService(d.id.split('$')[2], chartData.itemsData[rectIndex].id);
                            } else {
                                link = self.linkToRedirectService(d.id.split('$')[3], chartData.itemsData[rectIndex].id);
                            }
                            link && config.router.navigate(link, { trigger: true });
                        })
                        .on('mousemove', function (d) {
                            var itemName;
                            var defectModel;
                            var launchData;
                            id = d.id;
                            x = d3.mouse(self.chart.element)[0] - offset;
                            rectIndex = _.findIndex(rectsStartXCoords, function (coord) {
                                return x - rectWidth < coord;
                            });
                            launchData = chartData.itemsData[rectIndex];
                            if (~d.id.indexOf('$executions$') || ~d.id.indexOf('$total')) {
                                itemName = Localization.filterNameById[d.id];
                            } else {
                                defectModel = _.find(self.defectTypesCollection.models, function (model) {
                                    return model.get('locator') === d.id.split('$')[3];
                                });
                                (defectModel) ? (itemName = defectModel.get('longName')) : (itemName = d.id.split('$')[3]);
                            }
                            tooltip
                                .html(function () {
                                    return Util.templates(self.tooltipTemplate, {
                                        launchName: launchData.name,
                                        launchNumber: launchData.number,
                                        startTime: self.isTimeLine ? launchData.date : self.formatDateTime(launchData.startTime),
                                        color: chartData.colors[id],
                                        itemName: itemName,
                                        itemCases: chartData.isSingleColumn ? d.value : d.values[rectIndex].value
                                    });
                                })
                                .style('left', function () {
                                    return (d3.mouse(self.chart.element)[0] - (this.clientWidth / 2)) + 'px';
                                })
                                .style('top', function () {
                                    return (d3.mouse(self.chart.element)[1] - this.clientHeight - 8) + 'px';
                                });
                        })
                        .on('mouseover', function () {
                            tooltip.style('display', 'block');
                        })
                        .on('mouseout', function () {
                            tooltip.style('display', 'none');
                        });
                }
            });
            this.hiddenItems && this.chart.hide(this.hiddenItems);
            if (!self.isPreview) {
                this.setupLegend(chartData);
                legendScroller = Util.setupBaronScroll($('[data-js-legend-wrapper]', $el));
                this.scrollers.push(legendScroller);
            }
        },
        updateWidget: function () {
            this.chart && this.removeChartListeners() && this.chart.resize({ height: this.$el.parent().height() }) && this.chart.flush();
        },
        removeChartListeners: function () {
            var interactElems = (this.chart.data()[0].values.length < 2) ?
                d3.selectAll($('[data-js-chart-container] .c3-circle', this.$el)) :
                d3.selectAll($('[data-js-chart-container] .c3-area', this.$el));
            interactElems.on('click mousemove mouseover mouseout', null);
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

    return LaunchStatisticsAreaChart;
});
