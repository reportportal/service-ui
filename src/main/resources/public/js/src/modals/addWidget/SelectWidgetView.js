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
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var WidgetService = require('newWidgets/WidgetService');
    var App = require('app');

    var config = App.getInstance();

    var SelectWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-select-widget',
        template: 'tpl-modal-add-widget-select-widget',
        events: {
            'change input[type="radio"]': 'onChangeType'
        },

        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                widgets: WidgetService.getDefaultConfig()
            }));
        },
        onChangeType: function () {
            var gadget = $('input:checked', this.$el).val();
            var self = this;
            config.trackingDispatcher.trackEventNumber(291);
            $.when(WidgetService.getFullWidgetConfig(gadget)).done(function (widget) {
                self.updateModel(gadget, widget);
            });
        },
        updateModel: function (gadget, curWidget) {
            var defaultCriteria = [];
            var defaultActions = [];
            this.model.set({
                gadget: gadget,
                itemsCount: (curWidget.limit && curWidget.limit.def) || 50,
                widgetDescription: '',
                widgetOptions: '{}',
                content_fields: '[]'
            });
            if (curWidget.criteria && !curWidget.noCriteria) {
                if (curWidget.defaultCriteria) {
                    defaultCriteria = curWidget.defaultCriteria;
                } else {
                    defaultCriteria = [];
                    _.each(curWidget.criteria, function (value, key) {
                        if (typeof value === 'object') {
                            _.each(value.keys, function (valueKey) {
                                defaultCriteria = defaultCriteria.concat(valueKey.split(','));
                            });
                        } else {
                            defaultCriteria.push(key);
                        }
                    });
                }
            }
            if (curWidget.staticCriteria) {
                _.each(curWidget.staticCriteria, function (val, key) {
                    defaultCriteria.push(key);
                });
            }
            this.model.setContentFields(_.uniq(defaultCriteria));
            if (curWidget.actions) {
                _.each(curWidget.actions, function (a) {
                    Array.prototype.push.apply(defaultActions, a.actions);
                });
                this.model.setWidgetOptions({ actionType: defaultActions });
            }
        },
        onDestroy: function () {
        }
    });

    return SelectWidgetView;
});
