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
            width: config.defaultWidgetWidth,
            height: config.defaultWidgetHeight,
            x: 0,
            y: 0,
            name: '',
            description: '',
            gadget: '',
            owner: '',
            isShared: false,

            // widgetData
            filter_id: '',
            itemsCount: 50,
            widgetDescription: '',
            widgetOptions: '{}',
            content_fields: '[]',
        },
        computeds: {
            gadgetName: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return '';
                    return widgetConfig.widgetTypes[gadget].gadget_name;
                }
            },
            gadgetDescription: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return '';
                    return widgetConfig.widgetTypes[gadget].description.escapeScript();
                }
            },
            gadgetPreviewImg: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return 'img/popup/' + widgetConfig.defaultWidgetImg;
                    return 'img/popup/' + widgetConfig.widgetTypes[gadget].img;
                }
            },
            gadgetIsFilter: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return false;
                    return !widgetConfig.widgetTypes[gadget].noFilters;
                }
            },
            gadgetIsFilterFill: {
                deps: ['gadget', 'gadgetIsFilter', 'filter_id'],
                get: function(gadget, gadgetIsFilter, filter_id) {
                    if(!gadgetIsFilter) return true;
                    return !!filter_id;
                }
            },
            isMy: {
                deps: ['owner'],
                get: function(owner) {
                    return owner == config.userModel.get('name');
                }
            },
            isMyDashboard: function() {
                if (!this.collection) {
                    return true;
                }
                return this.collection.dashboardModel.get('isMy');
            },
            sharedTitle: {
                deps: ['isMy', 'owner'],
                get: function(isMy, owner) {
                    if(isMy) {
                        return '';
                    }
                    return Localization.widgets.widgetCreatedBy + ' ' + owner;
                }
            },
            isTimeline: {
                deps: ['widgetOptions'],
                get: function(widgetOptions) {
                    var options = this.getWidgetOptions();
                    if( options.timeline && options.timeline.length ) {
                        return true;
                    }
                    return false;
                }
            }
        },
        initialize: function() {

        },
        update: function() {
            var self = this;
            return Service.loadDashboardWidget(this.get('id'))
                .done(function(data) {
                    self.parseData(data);
                });
        },
        getWidgetOptions: function() {
            try {
                return JSON.parse(this.get('widgetOptions'));
            } catch (err) {
                return {};
            }
        },
        setWidgetOptions: function(options) {
            this.set({widgetOptions: JSON.stringify(options)});
        },
        getContentFields: function() {
            try {
                return JSON.parse(this.get('content_fields'));
            } catch (err) {
                return [];
            }
        },
        setContentFields: function(options) {
            this.set({content_fields: JSON.stringify(options)});
        },
        parseData: function(data) {
            var modelData = {
                name: data.name,
                description: data.description,
                owner: data.owner,
                isShared: data.isShared,
                gadget: data.content_parameters && data.content_parameters.gadget,
                widgetData: data,
                widgetOptions: '{}',
                filter_id: data.filter_id,
            };
            if(data.content_parameters) {
                if(data.content_parameters.content_fields) {
                    modelData.content_fields = JSON.stringify(data.content_parameters.content_fields);
                }
                if(data.content_parameters.itemsCount) {
                    modelData.itemsCount = data.content_parameters.itemsCount;
                }
                if(data.content_parameters.widgetOptions) {
                    modelData.widgetOptions = JSON.stringify(data.content_parameters.widgetOptions);
                }

            }
            this.set(modelData)
        }
    });

    return GadgetModel;
});
