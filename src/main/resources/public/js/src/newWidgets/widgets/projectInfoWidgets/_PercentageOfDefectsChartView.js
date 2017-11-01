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
    var Util = require('util');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var PercentageOfDefectsChartView = C3ChartWidgetView.extend({
        template: 'tpl-widget-project-info-chart',
        tooltipTemplate: 'tpl-widget-project-info-chart-tooltip',
        className: 'project-info-chart percentage-of-defects',

        render: function () {
            var self = this;
            var contentData = [];
            var contentDataSorted;
            var container;
            var isWeeks = this.model.get('interval') !== 1;
            var chartData = {
                columns: {
                    toInvestigate: ['toInvestigate']
                },
                colors: {
                    toInvestigate: config.defaultColors.toInvestigate
                }
            };
            var itemsData = [];

            var isSingleColumn;
            if (_.isEmpty(this.model.getContent())) {
                this.addNoAvailableBock();
                return;
            }
            chartData.columns[this.criteria] = [this.criteria];
            chartData.colors[this.criteria] = config.defaultColors[this.criteria];
            this.$el.html(Util.templates(this.template, {}));
            container = $('[data-js-chart-container]', this.$el);
            _.each(this.model.getContent(), function (val, key) {
                var itemData = val[0].values;
                itemData.date = key;
                contentData.push(itemData);
            });
            // sort data by start time
            contentDataSorted = _.sortBy(contentData, function (item) {
                return isWeeks ? item.date.split('-W')[1] : Moment(item.date).unix();
            });

            // fill chart data with values
            _.each(contentDataSorted, function (itemData) {
                var total = +itemData.automationBug + +itemData.productBug + +itemData.systemIssue + +itemData.toInvestigate;
                chartData.columns.toInvestigate.push(isNaN(+itemData.toInvestigate / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData.toInvestigate / total) * 100, 2).toFixed(2));
                chartData.columns[this.criteria].push(isNaN(+itemData[this.criteria] / total) ? 0 : this.getRoundedToDecimalPlaces((+itemData[this.criteria] / total) * 100, 2).toFixed(2));
                itemsData.push({
                    date: itemData.date
                });
            }, this);
            isSingleColumn = (itemsData.length < 2);
            this.chart = c3.generate({
                bindto: container[0],
                data: {
                    columns: _.values(chartData.columns),
                    type: 'area-spline',
                    groups: [_.keys(chartData.columns)],
                    colors: chartData.colors
                },
                point: {
                    show: isSingleColumn,
                    r: 3,
                    focus: {
                        expand: {
                            r: 5
                        }
                    }
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        show: true,
                        type: 'category',
                        categories: _.map(itemsData, function (item) {
                            return isWeeks ? item.date.split('-W')[1] : item.date.split('-')[2];
                        }),
                        tick: {
                            values: self.getTimelineAxisTicks(itemsData.length),
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: false,
                            outer: false
                        },
                        label: {
                            text: isWeeks ? Localization.widgets.timeWeeks : Localization.widgets.timeDays,
                            position: 'outer-center'
                        },
                        // padding: { // Make chart full width in case of there is only couple of datapoints
                        //     right: -0.4 - (0.01 * itemsData.length),
                        //     left: -0.4 - (0.01 * itemsData.length)
                        // }
                    },
                    y: {
                        show: true,
                        max: 100,
                        padding: {
                            top: 0
                        },
                        tick: {
                            format: function (d) {
                                return d + '%';
                            }
                        }
                    }
                },
                legend: {
                    show: false
                },
                size: {
                    height: self.$el.height()
                },
                onrendered: function () {
                    var interactElems = isSingleColumn ? d3.selectAll($('.c3-circle', container)) : d3.selectAll($('.c3-area', container));
                    var offset = this.margin.left;
                    var rects = $('.c3-event-rect', container); // C3 event rectangles
                    var rectWidth = $(rects[0]).attr('width');
                    var rectsStartXCoords = [];
                    var tooltip = d3.selectAll($('.c3-tooltip-container', container));
                    var x;
                    var rectIndex;

                    container.css('max-height', 'none');
                    if (isSingleColumn) {
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
                            var shown = _.map(self.chart.data.shown(), function (dataItem) {
                                return dataItem.id;
                            });
                            (shown.length > 1) ? self.chart.hide(_.without(shown, d.id)) : self.chart.show();
                        })
                        .on('mousemove', function (d) {
                            var itemData;
                            var start;
                            var end;
                            var period;
                            x = d3.mouse(self.chart.element)[0] - offset;
                            rectIndex = _.findIndex(rectsStartXCoords, function (coord) {
                                return x - rectWidth < coord;
                            });
                            itemData = itemsData[rectIndex];
                            if (isWeeks) {
                                start = Moment(itemData.date).format(config.widgetTimeFormat);
                                end = Moment(itemData.date).add(6, 'day').format(config.widgetTimeFormat);
                                period = start + ' - ' + end;
                            } else {
                                period = itemData.date;
                            }
                            tooltip
                                .html(function () {
                                    return Util.templates(self.tooltipTemplate, {
                                        period: period,
                                        showRate: true,
                                        color: chartData.colors[d.id],
                                        name: Localization.widgets[d.id],
                                        percentage: isSingleColumn ? d.value + '%' : d.values[rectIndex].value + '%'
                                    });
                                })
                                .style('left', function () {
                                    return (d3.mouse(self.chart.element)[0] - (this.clientWidth / 2)) + 'px';
                                })
                                .style('top', function () {
                                    return (d3.mouse(self.chart.element)[1] - this.clientHeight - 8) + 'px';
                                });
                        })
                        .on('mouseover', function (d) {
                            if (_.find(self.chart.data.shown(), function (shownItem) { return shownItem.id === d.id; })) {
                                tooltip.style('display', 'block');
                            }
                        })
                        .on('mouseout', function () {
                            tooltip.style('display', 'none');
                        });
                }
            });
        },
        removeChartListeners: function () {
            var interactElems = (this.chart.data()[0].values.length < 2) ?
                d3.selectAll($('[data-js-chart-container] .c3-circle', this.$el)) :
                d3.selectAll($('[data-js-chart-container] .c3-area', this.$el));
            interactElems.on('click mousemove mouseover mouseout', null);
            return true;
        },
        onBeforeDestroy: function () {
            this.chart && this.removeChartListeners();
            this.chart && (this.chart = this.chart.destroy());
        }
    });

    return PercentageOfDefectsChartView;
});
