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
            this.pagingPage = 1;
            this.pagingSize = 50;
        },
        onChangeFilter:function() {
            this.pagingPage = 1;
            this.load();
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
        },
        setPaging: function(curPage, size) {
            this.pagingPage = curPage;
            if(size) {
                this.pagingSize = size;
            }
            this.load();
        },

        getParamsForRequest: function() {
            var answer = ['filter.eq.item='+this.itemModel.get('id')];
            answer.push('page.page=' + this.pagingPage);
            answer.push('page.size=' + this.pagingSize);
            answer = answer.concat(this.filterModel.getOptions());
            return answer;
        }
    })

    return LogItemCollection;
});