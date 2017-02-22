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
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Service = require('coreService');
    var Localization = require('localization');
    var Util = require('util');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var DashboardModel = Epoxy.Model.extend({
        defaults: {
            isShared: false,
            name: '',
            description: null,
            owner: '',
            widgets: '[]',

            active: false,
            notLoad: false,
        },
        computeds: {
            isMy: {
                deps: ['owner'],
                get: function(owner) {
                    return owner == config.userModel.get('name');
                }
            },
            sharedTitle: {
                deps: ['isMy', 'owner'],
                get: function(isMy, owner) {
                    if(isMy) {
                        return Localization.dashboard.dashboardShared;
                    }
                    return Localization.dashboard.dashboardSharedBy + ' ' + owner;
                }
            },
            url: {
                deps: ['id'],
                get: function(id) {
                    return '#' + appModel.get('projectId') + '/dashboard/' + id;
                }
            }
        },
        initialize: function() {
            this.listenTo(this, 'change:isShared change:description change:name', _.debounce(this.onChangeData, 10)) ;
            this.listenTo(this, 'change:widgets', this.onChangeWidgets);
        },
        onChangeData: function() {
            var data = {
                name: this.get('name'),
                share: this.get('isShared'),
            };
            if(this.get('description')) {
                data.description = this.get('description');
            }
            Service.updateDashboard(this.get('id'), data)
                .done(function () {
                    Util.ajaxSuccessMessenger('dashboardUpdated');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateDashboard');
                });
        },
        update: function() {
            var self = this;
            return Service.getProjectDashboard(this.get('id')).done(function(data){
                self.setWidgets(data.widgets, true);
            })
        },
        addWidget: function(model) {
            var widgets = this.getWidgets();
            var self = this;
            var widgetData = {
                widgetId: model.get('id'),
                widgetPosition: [model.get('x'), model.get('y')],
                widgetSize: [model.get('width'), model.get('height')],
            };
            return Service.addWidgetToDashboard(widgetData, this.get('id'))
                .done(function() {
                    widgets.push(widgetData);
                    self.setWidgets(widgets, true);
                    Util.ajaxSuccessMessenger('addedWidget');
                    self.trigger('add:widget', model);
                });

        },
        onChangeWidgets: function() {
            Service.updateDashboard(this.get('id'), {updateWidgets: this.getWidgets()})
                .fail(function(error) {
                    Util.ajaxFailMessenger(error, 'updateDashboard');
                })
        },
        getWidgets: function () {
            try {
                return JSON.parse(this.get('widgets'));
            } catch (err) {
                return [];
            }
        },
        setWidgets: function (widgets, silent) {
            this.set({widgets: JSON.stringify(widgets)}, {silent: (silent || false)});
        },

    });


    return DashboardModel;
});
