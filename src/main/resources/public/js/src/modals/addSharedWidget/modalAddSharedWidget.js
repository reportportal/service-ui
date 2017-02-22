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

    var Epoxy = require('backbone-epoxy');
    var Backbone = require('backbone');
    var ModalView = require('modals/_modalView');
    var SharedWidgetItem = require('modals/addSharedWidget/SharedWidgetItem');
    var PreviewWidgetView = require('newWidgets/PreviewWidgetView');
    var Util = require('util');
    var $ = require('jquery');
    var Service = require('coreService');
    var WidgetsConfig = require('widget/widgetsConfig');
    var App = require('app');

    var config = App.getInstance();
    var widgetConfig = WidgetsConfig.getInstance();

    var SharedWidgetModel = Epoxy.Model.extend({
        defaults: {
            active: false,
            added: false,
            id: '',
            name: '',
            owner: '',
            description: '',
            content_fields: '[]',
            widgetOptions: '{}',
        },
        computeds: {
            gadgetName: {
                deps: ['gadget'],
                get: function(gadget) {
                    if(!gadget) return '';
                    return widgetConfig.widgetTypes[gadget].gadget_name;
                }
            },
        }
    })

    var SharedWidgetCollection = Backbone.Collection.extend({
        model: SharedWidgetModel,
        initialize: function () {
            this.listenTo(this, 'change:active', this.onChangeActive);
        },
        onChangeActive: function (model, active) {
            if (active) {
                _.each(this.models, function (curModel) {
                    if (curModel != model) {
                        curModel.set({active: false});
                    }
                })
            }
        },
        load: function() {
            var self = this;
            return Service.getSharedWidgets()
                .done(function(data) {
                    self.reset(_.map(data, function(item) {
                        return {
                            id: item.id,
                            gadget: item.content_parameters.gadget,
                            name: item.name,
                            owner: item.owner,
                            description: item.description,
                            content_fields: (item.content_parameters.content_fields) ? JSON.stringify(item.content_parameters.content_fields) : '[]',
                            widgetOptions: (item.content_parameters.widgetOptions) ? JSON.stringify(item.content_parameters.widgetOptions) : '{}',
                        }
                    }));
                })
                .fail(function () {
                    Util.ajaxFailMessenger(null, 'connectToServer');
                });
        }
    });


    var ModalAddSharedWidget = ModalView.extend({
        template: 'tpl-modal-add-shared-widget',
        className: 'modal-add-shared-widget',

        events: {
            'click [data-js-add-widget]': 'onClickAddWidget',
        },
        bindings: {
            '[data-js-preview-block]': 'classes: {hide: not(name)}',
            '[data-js-active-widget-name]': 'text: name',
            '[data-js-add-widget]': 'attr: {disabled: not(name)}',
        },

        initialize: function(options) {
            this.render();
            $('[data-js-action-block]', this.$el).addClass('load');
            this.dashboardModel = options.dashboardModel;
            this.collection = new SharedWidgetCollection();
            this.listenTo(this.collection, 'change:active', this.onChangeActive);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        renderViews: function() {
            this.destroyViews();
            var $container = $('[data-js-widgets-list]', this.$el);
            if(this.collection.isEmpty()){
                $('[data-js-widgets-empty]', this.$el).removeClass('hide');
                return;
            }
            var self = this;
            _.each(this.collection.models, function(model) {
                if(_.find(self.dashboardModel.getWidgets(), function(w){ return w.widgetId === model.get('id'); })){
                    model.set('added', true);
                }
                var view = new SharedWidgetItem({model: model, dashboardModel: self.dashboardModel});
                self.renderedViews.push(view);
                $container.append(view.$el);
            });
        },
        onShown: function(){
            var self = this;
            this.collection.load()
                .done(function() {
                    self.renderViews();
                })
                .always(function() {
                    $('[data-js-action-block]', self.$el).removeClass('load');
                    self.baronScroll = Util.setupBaronScroll($('[data-js-widgets-list-scroll]', self.$el));
                    Util.setupBaronScrollSize(self.baronScroll, {maxHeight: 480});
                });
        },
        destroyViews: function() {
            if (this.renderedViews && this.renderedViews.length) {
                _.each(this.renderedViews, function(view) {
                    view.destroy();
                })
            }
            this.renderedViews = [];
        },
        onChangeActive: function(model, active) {
            if(active) {
                this.model.set({name: model.get('name'), id: model.get('id')});
                this.previewWidgetView && this.previewWidgetView.destroy();
                this.previewWidgetView = new PreviewWidgetView({sharedWidgetModel: model});
                $('[data-js-widget-preview]', this.$el).html(this.previewWidgetView.$el);
            }
        },
        onClickAddWidget: function() {
            this.dashboardModel.addWidget(this.model);
            this.successClose({widgetId: this.model.get('id')});
        },
        onDestroy: function() {
            this.destroyViews();
        }

    });

    return ModalAddSharedWidget;
});
