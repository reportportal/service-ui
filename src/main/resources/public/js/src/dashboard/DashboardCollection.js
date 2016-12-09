/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';


    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');
    var DashboardModel = require('dashboard/DashboardModel');
    var Service = require('coreService');

    var config = App.getInstance();

    var DashboardCollection = Backbone.Collection.extend({
        model: DashboardModel,

        initialize: function() {
            this.ready = $.Deferred();
            this.update();
        },
        update: function() {
            this.reset([]);
            var self = this;
            this.getDashboards().always(function() {
                self.getSharedDashboards().always(function() {
                    self.ready.resolve();
                })
            })
        },
        getDashboards: function() {
            var async = $.Deferred();
            var self = this;
            Service.getProjectDashboards()
                .done(function(data) {
                    self.add(self.parse(data));
                    async.resolve();
                })
                .fail(function(data) {
                    async.reject(data);
                });
            return async.promise();
        },
        getSharedDashboards: function() {
            var async = $.Deferred();
            var self = this;
            Service.getSharedDashboards()
                .done(function(data) {
                    self.add(self.parseShared(data));
                    async.resolve();
                })
                .fail(function(data) {
                    async.reject(data);
                });
            return async.promise();
        },
        parse: function(data) {
            _.each(data, function(item) {
               item.widgets = JSON.stringify(item.widgets);
            });
            return data;
        },
        parseShared: function(data) {
            var widgetsData = [];
            _.each(data, function(value, key) {
                value.isShared = true;
                value.id = key;
                widgetsData.push(value);
            });
            return widgetsData;
        },

    });


    return DashboardCollection;
});
