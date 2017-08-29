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
    var App = require('app');
    var config = App.getInstance();

    var ProjectEventsCollection = Backbone.Collection.extend({
        model: ProjectEventsItemModel,

        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.pagingModel = options.pagingModel;
            this.listenTo(this.filterModel, 'change:newEntities change:entities', this.changeFilterOptions);
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.changeSelectionParameters);
        },
        changeFilterOptions: function (model, value) {
            if (model.get('newEntities') !== '' ||
                (model.changed.entities && model.get('entities') !== model._previousAttributes.newEntities)) {
                this.pagingModel.set('number', 1);
                this.load();
            }
        },
        changeSelectionParameters: function () {
            this.load();
        },
        getParamsFilter: function (onlyPage) {
            var params = [];
            params.push('page.page=' + this.pagingModel.get('number'));
            params.push('page.size=' + this.pagingModel.get('size'));
            if (onlyPage) {
                return params;
            }
            params = params.concat(this.filterModel.getOptions());
            return params;
        },
        update: function () {
        },
        load: function () {
            var self = this;
            var async = $.Deferred();
            var mainHash = window.location.hash.split('?')[0];
            var params = this.getParamsFilter();
            var query = '?' + params.join('&');

            config.router.navigate(mainHash + query, { trigger: false, replace: true });
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
