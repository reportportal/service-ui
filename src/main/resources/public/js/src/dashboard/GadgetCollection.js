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
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var GadgetModel = require('dashboard/GadgetModel');
    var Service = require('coreService');
    var Util = require('util');

    var config = App.getInstance();

    var GadgetCollection = Backbone.Collection.extend({
        model: GadgetModel,
        initialize: function(data, options) {
            this.dashboardModel = options.dashboardModel;
            this.listenTo(this, 'change:x change:y change:width change:height', _.debounce(this.onChangePosition, 10));
            this.listenTo(this, 'remove', this.onRemoveGadget);
        },
        onChangePosition: function() {
            var gadgetsData = [];
            _.each(this.models, function(model) {
                gadgetsData.push({
                    widgetId: model.get('id'),
                    widgetPosition: [model.get('x'), model.get('y')],
                    widgetSize: [model.get('width'), model.get('height')],
                })
            });
            Service.updateDashboard(this.dashboardModel.get('id'), {updateWidgets: gadgetsData})
                .fail(function(error) {
                    Util.ajaxFailMessenger(error, 'updateDashboard');
                })
        },
        onRemoveGadget: function(model) {
            Service.updateDashboard(this.dashboardModel.get('id'), {deleteWidget: model.get('id')})
                .fail(function(error) {
                    Util.ajaxFailMessenger(error, 'updateDashboard');
                })
        },
        parse: function(gadgetData) {
            return _.map(gadgetData, function(gadget) {
                return {
                    id: gadget.widgetId,
                    x: gadget.widgetPosition[0],
                    y: gadget.widgetPosition[1],
                    width: gadget.widgetSize[0],
                    height: gadget.widgetSize[1],
                }
            });
        }
    });


    return GadgetCollection;
});
