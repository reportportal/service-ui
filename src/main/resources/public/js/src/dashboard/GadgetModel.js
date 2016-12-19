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
    var WidgetsConfig = require('widget/widgetsConfig');
    var Localization = require('localization');

    var widgetConfig = WidgetsConfig.getInstance();
    var config = App.getInstance();

    var GadgetModel = Epoxy.Model.extend({
        defaults: {
            id: '',
            width: 1,
            height: 1,
            x: 0,
            y: 0,
            name: '',
            description: '',
            gadget: '',
            owner: '',
            isShared: false,

            widgetData: {},
        },
        computeds: {
            gadgetName: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return '';
                    return widgetConfig.widgetTypes[gadget].gadget_name;
                }
            },
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
                        return '';
                    }
                    return Localization.widgets.widgetSharedBy + ' ' + owner;
                }
            },
        },
        initialize: function() {

        },
        update: function() {
            var self = this;
            return Service.loadDashboardWidget(this.get('id'))
                .done(function(data) {
                    self.set({
                        name: data.name,
                        owner: data.owner,
                        isShared: data.isShared,
                        gadget: data.content_parameters.gadget,
                        widgetData: data,
                    })
                })
        }
    });

    return GadgetModel;
});
