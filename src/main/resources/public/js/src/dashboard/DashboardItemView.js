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

    var Util = require('util');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var Widget = require('widgets');

    var config = App.getInstance();

    var DashboardItemView = Epoxy.View.extend({
        className: 'dashboard-item-view',
        template: 'tpl-dashboard-item',

        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
        },

        bindings: {
        },

        initialize: function(options) {
            this.widgetsView = [];
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.activateGridStack();
        },
        createWidget: function (w) {
            var user = config.userModel;
            var widgets = this.model.get('widgets');
            var self = this;
            var navigationInfo = new (Epoxy.Model.extend({
                getCurrentDashboard: function() {
                    return self.model;
                }
            }));
            var $container = $('[data-js-grid-stack]', this.$el);
            var currWidget = w;
            var widgetId = currWidget.widgetId;
            var widgetSize = currWidget.widgetSize;
            var wisgetPosition = currWidget.widgetPosition;
            var widgetHeight = (widgetSize && !_.isEmpty(widgetSize) && widgetSize[1]) ? widgetSize[1] : config.defaultWidgetHeight;
            var widgetWidth = (widgetSize && !_.isEmpty(widgetSize) && widgetSize[0]) ? widgetSize[0] : config.defaultWidgetWidth;
            var widget = new Widget.WidgetView({
                    container: $container,
                    id: widgetId,
                    navigationInfo: navigationInfo,
                    width: widgetWidth,
                    height: widgetHeight,
                    top: wisgetPosition[1],
                    left: wisgetPosition[0],
                    context: this.context
                }).render();
            // this.widgets.push(widget);
            var grid = $container.data('gridstack');
            if (grid) {
                grid.add_widget(widget.$el, wisgetPosition[0], wisgetPosition[1], widgetWidth, widgetHeight);
                widget.loadWidget();
            }
        },
        createWidgets: function() {
            this.widgetsView = [];
            var self = this;
            var widgets = this.model.getWidgets();
            widgets.sort(function (a, b) {
                var posA = a.widgetPosition[1], posB = b.widgetPosition[1];
                return posA - posB;
            });
            _.each(widgets, function(widget) {
                self.createWidget(widget);
                // $('[data-js-grid-stack]', self.$el).append($el);
            })
            return this.widgetsView;
        },
        activateGridStack: function() {
            var gridStack = $('[data-js-grid-stack]', this.$el);

            var options = {
                    cell_height: config.widgetGridCellHeight,
                    vertical_margin: config.widgetGridVerticalMargin,
                    handle: '.drag-handle',
                    // widgets: this.createWidgets(),
                    draggable: {
                        containment: gridStack,
                        handle: '.drag-handle'
                    },
                    resizable: {
                        handles: 'se, sw'
                    }
                };
            gridStack.gridstack(options);
            gridStack.on('change', function (e, items) {
                console.dir(items);
            });
            gridStack.on('resizestart', function (event, ui) {
                var element = $(event.target);
                element.css('visibility', 'hidden');
            });
            gridStack.on('resizestop', function (event, ui) {
                var element = $(event.target);
                element.css('visibility', 'visible');
            });
            this.createWidgets();
        },
        onClickEdit: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var self = this;
            (new ModalEditDashboard({
                dashboardCollection: this.model.collection,
                dashboardModel: this.model,
                mode: 'edit',
            })).show().done(function(newModel) {
                self.model.set(newModel.toJSON());
            })
        },
        onClickRemove: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var self = this;
            (new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete, this.model.get('name')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            })).show().done(function() {
                var collection = self.model.collection;
                self.model.collection.remove(self.model);
                self.destroy();
                collection.resetActive();
            })
        },

        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        },
    });


    return DashboardItemView;
});
