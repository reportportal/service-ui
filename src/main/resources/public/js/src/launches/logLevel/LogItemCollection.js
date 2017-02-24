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
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var LogItemModel = require('launches/logLevel/LogItemModel');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;

    var LogItemCollection = Backbone.Collection.extend({
        model: LogItemModel,

        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.itemModel = options.itemModel;
            this.listenTo(this.filterModel, 'change:newSelectionParameters change:newEntities', this.onChangeFilter);
            this.pagingPage = options.pagingPage || 1;
            this.pagingSize = options.pagingSize || 50;
            this.loadDebounce = _.debounce(this.load.bind(this), 10);
        },
        onChangeFilter:function() {
            this.pagingPage = 1;
            this.loadDebounce();
            this.trigger('change:options', this.getParamsForUrl());
        },
        load: function() {
            this.trigger('loading:true');
            var path = Urls.getLogsUrl() + '?' + this.getParamsForRequest().join('&');
            var self = this;
            this.request && this.request.abort();
            this.request = call('GET', path)
                .done(function(data) {
                    self.trigger('change:paging', data.page);
                    self.reset(data.content);
                })
                .always(function() {
                    self.trigger('loading:false')
                });
            return this.request;
        },
        setPaging: function(curPage, size) {
            this.pagingPage = curPage;
            if(size) {
                this.pagingSize = size;
            }
            var async = this.loadDebounce();
            this.trigger('change:options', this.getParamsForUrl());
            return async;
        },

        getParamsForRequest: function(notPage) {
            var answer = ['filter.eq.item='+this.itemModel.get('id')];
            !notPage && answer.push('page.page=' + this.pagingPage);
            answer.push('page.size=' + this.pagingSize);
            answer = answer.concat(this.filterModel.getOptions());
            return answer;
        },
        getParamsForUrl: function() {
            var answer = [];
            answer.push('log.page.page=' + this.pagingPage);
            answer.push('log.page.size=' + this.pagingSize);
            var filterOptions = _.map(this.filterModel.getOptions(), function(option) {
                return 'log.' + option
            });
            answer = answer.concat(filterOptions);
            return answer;
        },
        findLogPage: function(logId, cleanFilters) {
            var async = $.Deferred();
            var path = Urls.getLogsUrl() + '/' + logId + '/page';
            var params = this.getParamsForRequest();
            if(cleanFilters) {
                var newParams = [];
                _.each(params, function(param) {
                    if(!~param.search(/(binary_content|in\.level|cnt\.message)/)) {
                        newParams.push(param);
                    }
                });
                params = newParams;
            }
            path += '?' + params.join('&');
            call('GET', path)
                .done(function(data) {
                    async.resolve(data.number);
                })
                .fail(function() { async.reject(); });
            return async;
        }
    })

    return LogItemCollection;
});
