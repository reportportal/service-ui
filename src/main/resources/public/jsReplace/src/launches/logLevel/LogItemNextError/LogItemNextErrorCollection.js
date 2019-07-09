/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
    var Backbone = require('backbone');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;
    var LogItemModel = require('launches/logLevel/LogItemModel');

    var LogItemNextErrorCollection = Backbone.Collection.extend({
        model: LogItemModel,
        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.itemModel = options.itemModel;
        },
        load: function () {
            var path = Urls.getLogsUrl() + '?' + this.getParamsForRequest().join('&');
            var self = this;
            this.request && this.request.abort();
            this.request = call('GET', path)
                .done(function (data) {
                    self.reset(data.content);
                });
            return this.request;
        },
        getParamsForRequest: function () {
            var answer = ['filter.eq.item=' + this.itemModel.get('id')];
            var options = this.filterModel.getOptions();
            answer.push('page.page=1');
            answer.push('page.size=100');
            _.each(options, function (option) {
                if (!~option.search('filter.gte.level')) {
                    answer.push(option);
                }
            });
            answer.push('filter.gte.level=ERROR');
            return answer;
        }
    });

    return LogItemNextErrorCollection;
});
