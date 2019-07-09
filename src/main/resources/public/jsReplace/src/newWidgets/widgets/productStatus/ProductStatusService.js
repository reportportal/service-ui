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
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var Service = require('coreService');
    var FilterModel = require('filters/FilterModel');
    var App = require('app');

    var config = App.getInstance();

    return {
        getAllData: function (widgetModel) {
            var self = this;
            var async = $.Deferred();
            var widgetOptions = widgetModel.getWidgetOptions();
            Service.getFilterData(widgetOptions.filters)
                .done(function (filtersData) {
                    var result = {};
                    var currentResolveAsync = 0;
                    _.each(filtersData, function (filterData) {
                        var filterModel = new FilterModel();
                        filterModel.parseServerData(filterData);
                        self.getLaunchesByFilter(filterModel, widgetModel)
                            .done(function (response) {
                                var finishedLaunches = [];
                                _.each(response.content, function (item) {
                                    if (item.status !== config.launchStatus.inProgress) {
                                        finishedLaunches.push(item);
                                    }
                                });
                                result[filterData.id] = finishedLaunches;
                                filterModel.destroy();
                                currentResolveAsync += 1;
                                if (currentResolveAsync >= filtersData.length) {
                                    async.resolve(_.map(filtersData, function (filter) {
                                        return {
                                            filterData: filter,
                                            launches: result[filter.id]
                                        };
                                    }));
                                }
                            });
                    });
                })
                .fail(function () {
                    async.reject();
                });
            return async;
        },
        getData: function (widgetModel) {
            var async = $.Deferred();
            this.getAllData(widgetModel)
                .done(function (response) {
                    async.resolve(response);
                });

            return async;
        },
        getLaunchesByFilter: function (filterModel, widgetModel) {
            var path = Urls.getGridUrl('launch', false);
            var widgetOptions = widgetModel.getWidgetOptions();
            if (widgetOptions.latest && widgetOptions.latest.length) {
                path = Urls.getGridUrl('launch/latest');
            }
            var params = [];
            params.push('page.page=1');
            params.push('page.size=50');
            params = params.concat(filterModel.getOptions());

            path += '?' + params.join('&');
            return CallService.call('GET', path);
        }
    };
});
