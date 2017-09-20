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

    var Backbone = require('backbone');
    var $ = require('jquery');
    var ProjectEventsItemModel = require('projectEvents/projectEventsItemModel');
    var Service = require('coreService');

    var ProjectEventsCollection = Backbone.Collection.extend({
        model: ProjectEventsItemModel,

        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.pagingModel = options.pagingModel;
            this.listenTo(this.filterModel, 'change:newEntities', this.changeFilterOptions);
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.changeSelectionParameters);
        },
        changeFilterOptions: function () {
            this.pagingModel.set('number', 1);
            this.load();
        },
        changeSelectionParameters: function () {
            this.load();
        },
        getParamsFilter: function () {
            var params = [];
            params.push('page.page=' + this.pagingModel.get('number'));
            params.push('page.size=' + this.pagingModel.get('size'));
            params = params.concat(this.filterModel.getOptions());
            return params;
        },
        load: function () {
            var self = this;
            var async = $.Deferred();
            var params = this.getParamsFilter();
            var query = '?' + params.join('&');
            this.trigger('loading', true);

            Service.getProjectEvents(query)
                .done(function (data) {
                    if (!data.content.length && data.page.totalPages !== 0) {
                        self.reset(data.content);
                        self.trigger('loading', false);
                        return false;
                    }
                    self.pagingModel.set(data.page);
                    self.reset(data.content);
                    self.trigger('loading', false);
                    async.resolve(data);
                })
                .fail(function () {
                    async.reject();
                    self.trigger('loading', false);
                });
            return async;
        }
    });

    return ProjectEventsCollection;
});
