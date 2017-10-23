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

    var _ = require('underscore');
    var Util = require('util');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');

    var C3ChartWidgetView = BaseWidgetView.extend({
        isDataExists: function () {
            return (!_.isEmpty(this.model.getContent()) && this.model.getContent().result.length &&
                !_.isEmpty(this.model.getContent().result[0].values));
        },
        getValuesInPercents: function (total, values) {
            var rounded;
            return _.mapValues(values, function (value) {
                rounded = Math.round((value / total) * 100);
                if (rounded === 0 && value) {
                    rounded = 1;
                }
                if (rounded === 100 && value !== total) {
                    rounded = 99;
                }
                return rounded;
            });
        },
        formatDateTime: function (time) {
            return Util.dateFormat(new Date(+time));
        },
        getRoundedToDecimalPlaces: function (num, decimalPlaces) {
            return Math.round(num * (Math.pow(10, decimalPlaces))) / Math.pow(10, decimalPlaces);
        },
        getFormattedLabels: function (id) {
            var ratio = this.chartData[id] / this.total;
            var percents = this.getRoundedToDecimalPlaces(ratio * 100, 2).toFixed(2);
            if (!this.isPreview && percents > 0) {
                return percents + '%';
            }
            return '';
        },
        getLaunchAxisTicks: function (itemsLength) {
            return _.range(0, itemsLength, itemsLength > 6 ? Math.round(itemsLength / 12) : 1);
        },
        getTimelineAxisTicks: function (itemsLength) {
            return _.range( // 6 - ticks to display count, change it if need more or less
                itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0, // start
                itemsLength, // finish
                itemsLength > 5 ? (itemsLength / 5).toFixed() : 1 // step
            );
        },
        updateWidget: function () {
            this.charts && _.each(this.charts, function (chart) {
                chart.flush();
                chart.resize({
                    height: this.$el.parent().height()
                });
            }.bind(this));
            this.chart && this.chart.resize({ height: this.$el.parent().height() }) && this.chart.flush();
        }
    });

    return C3ChartWidgetView;
});

