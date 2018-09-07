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
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var MostTimeConsumingTestCasesBarView = C3ChartWidgetView.extend({
        template: 'tpl-widget-time-consuming-bar',
        tooltipTemplate: 'tpl-widget-time-consuming-bar-tooltip',

        render: function () {
            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            this.$el.html(Util.templates(this.template, {}));
            this.drawBarChart($('[data-js-bar-container]', this.$el), this.model.getContent().result);
        },
        isDataExists: function () {
            return (!_.isEmpty(this.model.getContent()) && this.model.getContent().result.length);
        },
        drawBarChart: function ($el, data) {
            var self = this;
            var chartData = ['duration'];
            var timeType;
            var itemData = [];
            var max = 0;
            var topBlockElem;

            // data preparation
            _.each(data, function (item) {
                var duration = parseInt(item.duration === 0 ? 10 : item.duration, 10);
                max = duration > max ? duration : max;
                itemData.push({
                    id: item.id,
                    name: item.name,
                    status: item.status,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    duration: duration,
                    uniqueId: item.uniqueId
                });
                chartData.push(duration);
            });

            timeType = this.getTimeType(max);
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: [chartData],
                    type: 'bar',
                    color: function (color, d) {
                        return self.getColor(itemData[d.index]);
                    },
                    onclick: function (d) {
                        var link = self.getFilterByUIDRedirectLink(self.model.getContent().lastLaunch[0].id, itemData[d.index].uniqueId) + '&log.item=' + itemData[d.index].id;
                        link && config.router.navigate(link, { trigger: true });
                    }
                },
                bar: {
                    width: {
                        ratio: 0.8
                    }
                },
                axis: {
                    rotated: true,
                    x: {
                        show: false
                    },
                    y: {
                        tick: {
                            format: function (d) {
                                return (parseInt(d, 10) / timeType.value).toFixed(2);
                            }
                        },
                        label: {
                            text: Localization.time[timeType.type],
                            position: 'outer-center'
                        }
                    }
                },
                padding: {
                    top: 40,
                    left: 30,
                    right: 30,
                    bottom: 10
                },
                tooltip: {
                    grouped: true,
                    position: function (d, width, height) {
                        var left = d3.mouse(self.chart.element)[0] - (width / 2);
                        var top = d3.mouse(self.chart.element)[1] - height;

                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d) {
                        var item = itemData[d[0].index];
                        return Util.templates(self.tooltipTemplate, {
                            name: item.name,
                            duration: Util.timeFormat(item.start_time, item.end_time),
                            startTime: Util.dateFormat(new Date(+item.start_time))
                        });
                    }
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-bars-duration path', $el)).each(function () {
                        var elem = d3.select(this);
                        if (+(parseInt(elem.datum().value, 10) / timeType.value).toFixed(2) === 0) {
                            elem.style('stroke-width', '1px').style('stroke', self.getColor(itemData[elem.datum().index]));
                        }
                    });
                },
                legend: {
                    show: false // we use custom legend
                }
            });
            topBlockElem = d3.select(this.chart.element).insert('div', '.chart').attr('class', 'top-block');
            this.setupInfoBlock(topBlockElem, this.model.getContent().lastLaunch[0].name);
        },
        getColor: function(data){
            if (data && data.status === 'PASSED') {
                return config.defaultColors.passed;
            }
            return config.defaultColors.failed;
        },
        setupInfoBlock: function (el, launchName) {
            d3.select(el[0][0])
                .html(function () {
                    return Localization.launches.launchName + ':' + '<span>' + launchName + '</span>';
                });
        },
        getTimeType: function (max) {
            var time = { value: 3600000, type: Localization.time.hours };
            if (max > 0) {
                if (max < 60000) {
                    time = { value: 1000, type: Localization.time.seconds };
                } else if (max <= 2 * 3600000) {
                    time = { value: 60000, type: Localization.time.minutes };
                }
            }
            return time;
        }
    });

    return MostTimeConsumingTestCasesBarView;
});
