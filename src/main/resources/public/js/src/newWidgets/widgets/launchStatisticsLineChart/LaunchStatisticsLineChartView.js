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
    var Service = require('coreService');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var Moment = require('moment');
    var config = App.getInstance();

    var LaunchStatisticsLineChart = C3ChartWidgetView.extend({
        template: 'tpl-widget-launch-statistics-line-chart',
        tooltipTemplate: 'tpl-widget-launch-statistics-line-chart-tooltip',
        className: 'launch-statistics-line-chart',

        render: function () {
            var data;
            this.isTimeLine = !!this.model.getWidgetOptions().timeline;
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
                    this.$el.html(Util.templates(this.template, {}));
                    this.drawStackedBarChart($('[data-js-chart-container]', this.$el), data);
                }.bind(this));
            }.bind(this));
        },

        drawStackedBarChart: function ($el, data) {
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
                var splitted = key.split('$');
                var shortKey = splitted[splitted.length - 1];
                if (~['passed', 'failed', 'skipped', 'total'].indexOf(shortKey)) {
                    colors[shortKey] = config.defaultColors[shortKey];
                } else {
                    defectModel = _.find(this.defectTypesCollection.models, function (model) {
                        return model.get('locator') === shortKey;
                    });
                    defectModel && (colors[shortKey] = defectModel.get('color'));
                }
                chartData[shortKey] = [shortKey];
            }.bind(this));

            // fill columns arrays with values
            if (this.isTimeLine) {
                _.each(data, function (item) {
                    itemData.push({
                        date: item.date
                    });
                    _.each(item.values, function (val, key) {
                        var splitted = key.split('$');
                        var shortKey = splitted[splitted.length - 1];
                        chartData[shortKey].push(val);
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
                        var splitted = key.split('$');
                        var shortKey = splitted[splitted.length - 1];
                        chartData[shortKey].push(val);
                    });
                });
            }
            isSingleColumn = itemData.length < 2;
            // reorder colums array in accordance with contentFields array
            _.each(contentFields, function (key) {
                var splitted = key.split('$');
                var shortKey = splitted[splitted.length - 1];
                chartDataOrdered.push(chartData[shortKey]);
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
                            // ticks count calculation
                            values: self.isTimeLine ?
                                _.range( // 6 - ticks to display count, change it if need more or less
                                    itemData.length > 6 ? ((itemData.length / 6 / 2).toFixed() / 2).toFixed() : 0, // start
                                    itemData.length, // finish
                                    itemData.length > 6 ? (itemData.length / 6).toFixed() : 1 // step
                                ) :
                                _.range(
                                    0,
                                    itemData.length,
                                    itemData.length > 25 ? 3 : 1
                                ),
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
                // zoom: {
                //     enabled: true,
                //     rescale: true
                // },
                // subchart: {
                //     show: true
                // },
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
                    var interactElems = isSingleColumn ? d3.selectAll('.c3-circle', $el) : d3.selectAll('.c3-area', $el);
                    var offset = this.margin.left;
                    var rects = $('.c3-event-rect', $el); // C3 event rectangles
                    var rectWidth = $(rects[0]).attr('width');
                    var rectsStartXCoords = [];
                    var tooltip = d3.select('.c3-tooltip-container', $el);
                    var areaLocator;
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
                        .on('click', function () {
                            var link;
                            if (self.isTimeLine) {
                                link = self.redirectForTimeLine(itemData[rectIndex].date); // uses rectIndex calculated in mousemove event
                            } else {
                                link = self.linkToRedirectService(areaLocator, itemData[rectIndex].id); // uses areaLocator & rectIndex calculated in mousemove event
                            }
                            link && config.router.navigate(link, { trigger: true });
                        })
                        .on('mousemove', function (d) {
                            var itemName;
                            var defectModel;
                            var launchData;
                            areaLocator = d.id;
                            x = d3.mouse(self.chart.element)[0] - offset;
                            rectIndex = _.findIndex(rectsStartXCoords, function (coord) {
                                return x - rectWidth < coord;
                            });
                            launchData = itemData[rectIndex];
                            if (~['passed', 'failed', 'skipped', 'total'].indexOf(areaLocator)) {
                                itemName = Localization.launchesHeaders[areaLocator];
                            } else {
                                defectModel = self.defectTypesCollection.getDefectByLocator(areaLocator);
                                if (defectModel) {
                                    itemName = defectModel.get('longName');
                                } else {
                                    itemName = areaLocator;
                                }
                            }
                            tooltip
                                .html(function () {
                                    return Util.templates(self.tooltipTemplate, {
                                        launchName: launchData.name,
                                        launchNumber: launchData.number,
                                        startTime: self.isTimeLine ? launchData.date : self.formatDateTime(launchData.startTime),
                                        color: colors[areaLocator],
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
                        if (~['passed', 'failed', 'skipped', 'total'].indexOf(id)) {
                            name = Localization.launchesHeaders[id];
                        } else {
                            defectModel = self.defectTypesCollection.getDefectByLocator(id);
                            if (defectModel) {
                                name = defectModel.get('longName');
                            } else {
                                return '<div class="invalid-color-mark"></div><span class="invalid">' + id + '</span>';
                            }
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
                            $('.c3-target-' + id.replace('_', '-'), $el).show();
                        } else {
                            $('.color-mark', $(this)).addClass('unchecked');
                            $('.c3-target-' + id.replace('_', '-'), $el).hide();
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
        redirectForTimeLine: function (date) {
            var range = 86400000;
            var filterId = this.model.get('filter_id');
            Service.getFilterData([filterId])
                .done(function (response) {
                    var time = Moment(date);
                    var dateFilter = {
                        condition: 'btw',
                        filtering_field: 'start_time',
                        is_negative: false,
                        value: time.format('x') + ',' + (parseInt(time.format('x'), 10) + range)
                    };
                    var filtersCollection = new SingletonLaunchFilterCollection();
                    var newFilter = filtersCollection.generateTempModel();
                    var entities = response[0].entities || [];
                    var link = newFilter.get('url');

                    entities.push(dateFilter);
                    newFilter.set('newEntities', JSON.stringify(entities));
                    link += '?' + newFilter.getOptions().join('&');
                    if (link) {
                        config.router.navigate(link, { trigger: true });
                    }
                });
        },
        updateWidget: function () {
            this.chart && this.removeChartListeners() && this.chart.resize({ height: this.$el.parent().height() }) && this.chart.flush();
        },
        removeChartListeners: function () {
            var interactElems = (this.chart.data.shown()[0].values.length < 2) ?
                    d3.selectAll('[data-js-chart-container] .c3-circle', this.$el) :
                    d3.selectAll('[data-js-chart-container] .c3-area', this.$el);
            interactElems.on('click mousemove mouseover mouseout', null);
            return true;
        },
        onBeforeDestroy: function () {
            this.chart && this.removeChartListeners();
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return LaunchStatisticsLineChart;
});
