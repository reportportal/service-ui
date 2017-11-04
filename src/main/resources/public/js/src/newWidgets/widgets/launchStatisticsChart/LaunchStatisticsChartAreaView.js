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
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var Moment = require('moment');
    var config = App.getInstance();

    var LaunchStatisticsAreaChart = C3ChartWidgetView.extend({

        tooltipTemplate: 'tpl-widget-launch-statistics-chart-tooltip',

        render: function () {
            var data;
            this.$el.addClass('stacked-area-view');
            this.isTimeLine = !!this.model.getWidgetOptions().timeline;
            this.isZoomEnabled = !!this.model.getWidgetOptions().zoom;
            if (this.isTimeLine) {
                data = [];
                _.each(this.model.getContent(), function (item, key) {
                    data.push({
                        date: key,
                        values: item[0].values
                    });
                });
                this.$el.addClass('timeline-mode');
            } else {
                data = this.model.getContent().result;
            }
            this.scrollers = [];
            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }
            if ((!this.isTimeLine && !this.isDataExists()) || (this.isTimeLine && _.isEmpty(this.model.getContent()))) {
                this.addNoAvailableBock();
                return;
            }
            this.defectTypesCollection = new SingletonDefectTypeCollection();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.defectTypesCollection.ready.done(function () {
                this.launchFilterCollection.ready.done(function () {
                    this.drawStackedAreaChart($('[data-js-chart-container]', this.$el), data);
                }.bind(this));
            }.bind(this));
        },

        drawStackedAreaChart: function ($el, data) {
            var self = this;
            var chartData = {};
            var chartDataOrdered = [];
            var legendScroller;
            var itemNames;
            var itemData = [];
            var colors = {};
            var contentFields = this.model.getContentFields();
            var isSingleColumn;

            // prepare columns array and fill it witch field names
            _.each(data[0].values, function (val, key) {
                var defectModel;
                chartData[key] = [key];
                if (~key.indexOf('$executions$') || ~key.indexOf('$total')) {
                    colors[key] = config.defaultColors[key.split('$')[2]];
                } else {
                    defectModel = _.find(this.defectTypesCollection.models, function (model) {
                        return model.get('locator') === key.split('$')[3];
                    });
                    defectModel && (colors[key] = defectModel.get('color'));
                }
            }.bind(this));

            // fill columns arrays with values
            if (this.isTimeLine) {
                _.each(data, function (item) {
                    itemData.push({
                        date: item.date
                    });
                    _.each(item.values, function (val, key) {
                        chartData[key].push(+val);
                    });
                });
            } else {
                _.each(data, function (item) {
                    itemData.push({
                        id: item.id,
                        name: item.name,
                        number: item.number,
                        startTime: item.startTime
                    });
                    _.each(item.values, function (val, key) {
                        chartData[key].push(+val);
                    });
                });
            }
            isSingleColumn = itemData.length < 2;

            // reorder colums array in accordance with contentFields array
            _.each(contentFields, function (key) {
                chartDataOrdered.push(chartData[key]);
            });

            // get column item names in correct order
            itemNames = _.map(chartDataOrdered, function (item) {
                return item[0];
            });

            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: chartDataOrdered,
                    type: 'area-spline',
                    order: null,
                    groups: [itemNames],
                    colors: colors
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
                axis: {
                    x: {
                        show: !self.isPreview,
                        type: 'category',
                        categories: _.map(itemData, function (item) {
                            var day;
                            if (self.isTimeLine) {
                                day = Moment(item.date).format('dddd').substring(0, 3);
                                return day + ', ' + item.date;
                            }
                            return '#' + item.number;
                        }),
                        tick: {
                            values: self.isTimeLine ? self.getTimelineAxisTicks(itemData.length) : self.getLaunchAxisTicks(itemData.length),
                            width: 60,
                            centered: true,
                            inner: true,
                            multiline: self.isTimeLine,
                            outer: false
                        }
                    },
                    y: {
                        show: false,
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
                    onzoomend: function (domain) {
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
                    left: self.isPreview ? 0 : 20,
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
                    var interactElems = isSingleColumn ? d3.selectAll($('.c3-circle', $el)) : d3.selectAll($('.c3-area', $el));
                    var offset = this.margin.left;
                    var rects = $('.c3-event-rect', $el); // C3 event rectangles
                    var rectWidth = $(rects[0]).attr('width');
                    var rectsStartXCoords = [];
                    var tooltip = d3.selectAll($('.c3-tooltip-container', $el));
                    var id;
                    var x;
                    var rectIndex;

                    $el.css('max-height', 'none');
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
                            var link;
                            if (self.isTimeLine) {
                                link = self.redirectForTimeLine(itemData[rectIndex].date);
                            } else if ((~d.id.indexOf('$executions$') || ~d.id.indexOf('$total'))) {
                                link = self.linkToRedirectService(d.id.split('$')[2], itemData[rectIndex].id);
                            } else {
                                link = self.linkToRedirectService(d.id.split('$')[3], itemData[rectIndex].id);
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
                            launchData = itemData[rectIndex];
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
                                        color: colors[id],
                                        itemName: itemName,
                                        itemCases: isSingleColumn ? d.value : d.values[rectIndex].value
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

            // Configuring custom legend block
            if (!self.isPreview) {
                d3.select(this.chart.element)
                    .insert('div', '.chart')
                    .attr('class', 'legend')
                    .insert('div', '.legend')
                    .attr('data-js-legend-wrapper', '') // wrapper for BaronScroll
                    .selectAll('span')
                    .data(itemNames)
                    .enter()
                    .append('span')
                    .attr('data-id', function (id) { return id; })
                    .html(function (id) {
                        var name;
                        var defectModel;
                        if (~id.indexOf('$executions$') || ~id.indexOf('$total')) {
                            name = Localization.filterNameById[id];
                        } else {
                            defectModel = _.find(self.defectTypesCollection.models, function (model) {
                                return model.get('locator') === id.split('$')[3];
                            });
                            (defectModel) ? (name = defectModel.get('longName')) : (name = id.split('$')[3]);
                        }
                        return '<div class="color-mark"></div>' + name;
                    })
                    .each(function (id) {
                        d3.select(this).select('.color-mark').style('background-color', self.chart.color(id));
                    })
                    .on('mouseover', function (id) {
                        self.chart.focus(id);
                    })
                    .on('mouseout', function (id) {
                        self.chart.revert();
                    })
                    .on('click', function (id) {
                        if ($('.color-mark', $(this)).hasClass('unchecked')) {
                            $('.color-mark', $(this)).removeClass('unchecked');
                            $('.c3-target-' + id.replaceAll(/[$_]/, '-'), $el).show();
                        } else {
                            $('.color-mark', $(this)).addClass('unchecked');
                            $('.c3-target-' + id.replaceAll(/[$_]/, '-'), $el).hide();
                        }
                        self.chart.toggle(id);
                    });
                d3.select(this.chart.element).select('.legend')
                    .append('div')
                    .attr('class', 'legend-gradient')
                    .append('div')
                    .attr('class', 'legend-border');
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
            this.chart && this.removeChartListeners();
            this.chart && (this.chart = this.chart.destroy());
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return LaunchStatisticsAreaChart;
});
