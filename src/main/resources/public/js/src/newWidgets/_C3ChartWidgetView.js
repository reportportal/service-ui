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
    var App = require('app');
    var Moment = require('moment');
    var config = App.getInstance();
    var Service = require('coreService');
    var FilterModel = require('filters/FilterModel');

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
        },
        onBeforeDestroy: function () {
            this.chart && (this.chart = this.chart.destroy());
        },
        redirectForTimeLine: function (date) {
            var range = 86400000;
            var filterId = this.model.get('filter_id');
            Service.getFilterData([filterId])
                .done(function (response) {
                    var filterModel = new FilterModel();
                    var link;
                    var entities;
                    var time = Moment(date);
                    var dateFilter = {
                        condition: 'btw',
                        filtering_field: 'start_time',
                        is_negative: false,
                        value: time.format('x') + ',' + (parseInt(time.format('x'), 10) + range)
                    };
                    filterModel.parseServerData(response[0]);
                    entities = filterModel.getEntitiesObj() || [];
                    entities.push(dateFilter);
                    filterModel.set('newEntities', JSON.stringify(entities));
                    link = filterModel.get('url') + 'all?' + filterModel.getOptions().join('&');
                    filterModel.destroy();
                    if (link) {
                        config.router.navigate(link, { trigger: true });
                    }
                });
        }
    });

    return C3ChartWidgetView;
});

