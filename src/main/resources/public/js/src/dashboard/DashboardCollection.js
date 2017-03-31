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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var App = require('app');
    var DashboardModel = require('dashboard/DashboardModel');
    var Service = require('coreService');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Util = require('util');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var DashboardCollection = Backbone.Collection.extend({
        model: DashboardModel,

        initialize: function(options) {
            this.ready = $.Deferred();
            this.defaultPath = '#' + appModel.get('projectId') + '/dashboard';
            this.update(options.startId);
            var self = this;
            this.ready.done(function() {
                self.listenTo(self, 'add', self.onAddDashboard);
                self.listenTo(self, 'remove', self.onRemoveDashboard);
                self.listenTo(self, 'change:active', self.onChangeActive);
            })
        },
        onAddDashboard: function(model) {
            var dashboard = {
                name: model.get('name'),
                share: model.get('isShared'),
                description: model.get('description')
            };
            Service.addOwnDashboard(dashboard)
                .done(function (data) {
                    model.set({id: data.id});
                    Util.ajaxSuccessMessenger('dashboardAdded');
                })
                .fail(function (request) {
                    Util.ajaxFailMessenger(request, 'dashboardAdded');
                });
        },
        onRemoveDashboard: function(model) {
            var self = this;
            return Service.deleteDashboard(model.get('id'))
                .done(function () {
                    Util.ajaxSuccessMessenger('dashboardDelete');
                })
                .fail(function (error) {
                    self.update();
                    Util.ajaxFailMessenger(error, 'dashboardDelete');
                });
        },
        update: function(startId) {
            this.reset([]);
            var self = this;
            this.getDashboards(startId).done(function(dashboards) {
                self.getSharedDashboards(startId).done(function(sharedDashboards) {
                    self.reset(dashboards.concat(sharedDashboards));
                    self.ready.resolve();
                })
            })
        },
        getDashboards: function(startId) {
            var async = $.Deferred();
            var self = this;
            Service.getProjectDashboards()
                .done(function(data) {
                    async.resolve(self.parse(data, startId));
                })
                .fail(function(data) {
                    async.reject(data);
                });
            return async.promise();
        },
        getSharedDashboards: function(startId) {
            var async = $.Deferred();
            var self = this;
            Service.getSharedDashboards()
                .done(function(data) {
                    async.resolve(self.parseShared(data, startId));
                })
                .fail(function(data) {
                    async.reject(data);
                });
            return async.promise();
        },
        parse: function(data, startId) {
            _.each(data, function(item) {
                if (item.id == startId) {
                    item.active = true;
                }
                item.widgets = JSON.stringify(item.widgets);
            });
            return data;
        },
        parseShared: function(data, startId) {
            var widgetsData = [];
            _.each(data, function(value, key) {
                if (key == startId) {
                    value.active = true;
                }
                value.isShared = true;
                value.id = key;
                value.notLoad = true;
                widgetsData.push(value);
            });
            return widgetsData;
        },
        createNewDashboard: function() {
            var self = this;
            (new ModalEditDashboard({
                dashboardCollection: this,
                dashboardModel: (new DashboardModel),
                mode: 'save',
            })).show().done(function(newModel) {
                var data = newModel.toJSON();
                data.name = data.name.trim();
                data.owner = config.userModel.get('name');
                self.add(data);
            })
        },
        onChangeActive: function(model, active) {
            if(active) {
                _.each(this.models, function(itemModel) {
                    if (model.get('id') != itemModel.get('id')) {
                        itemModel.set({active: false}, {silent: true});
                    }
                })
            }
        },
        resetActive: function() {
            _.each(this.models, function(model) {
                model.set({active: false});
            });
            this.trigger('reset:active');
        }

    });


    return DashboardCollection;
});
