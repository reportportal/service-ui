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

    var Util = require('util');
    var Epoxy = require('backbone-epoxy');
    var $ = require('jquery');
    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var SettingCustomColumnCollection = require('modals/addWidget/widgetSettings/SettingCustomColumn/SettingCustomColumnCollection');
    var SettingCustomColumnView = require('modals/addWidget/widgetSettings/SettingCustomColumn/SettingCustomColumnView');

    var actionTypes = {
        custom_columns: {
            setValue: function (value, model) {
                var widgetOptions = model.getWidgetOptions();
                var stringValues;
                if (value) {
                    stringValues = _.map(value, function (item) {
                        return JSON.stringify(item);
                    });
                    widgetOptions.customColumns = stringValues;
                } else {
                    widgetOptions.customColumns = [];
                }
                model.setWidgetOptions(widgetOptions);
            },
            getValue: function (model) {
                var result = [];
                if (model.getWidgetOptions().customColumns &&
                    model.getWidgetOptions().customColumns.length) {
                    _.each(model.getWidgetOptions().customColumns, function (stringItem) {
                        try {
                            result.push(JSON.parse(stringItem));
                        } catch (error) {}
                    });
                }
                return result;
            }
        }
    };

    var SettingCustomColumnsView = SettingView.extend({
        className: 'modal-add-widget-setting-custom-columns',
        template: 'tpl-modal-add-widget-setting-custom-columns',
        events: {
            'click [data-js-add-item]': 'onClickAddItem'
        },
        initialize: function (data) {
            var options = _.extend({
                label: '',
                value: []
            }, data.options);
            this.model = new Epoxy.Model(options);
            this.gadgetModel = data.gadgetModel;
            this.render();
            if (options.action && actionTypes[options.action]) {
                this.setValue = actionTypes[options.action].setValue;
                this.getValue = actionTypes[options.action].getValue;
            }
            options.setValue && (this.setValue = options.setValue);
            options.getValue && (this.getValue = options.getValue);
            this.collection = new SettingCustomColumnCollection();
            this.renderedItems = [];
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        activate: function () {
            this.collection.add(this.getValue(this.gadgetModel, this));
            this.renderItems();
            this.listenTo(this.collection, 'change', this.onChangeCollection);
            this.listenTo(this.collection, 'remove', this.renderItems);
        },
        onChangeCollection: function () {
            var result = [];
            _.each(this.collection.models, function (model) {
                if (model.get('name') !== '' && model.get('value') !== '') {
                    result.push(model.toJSON());
                }
            });
            this.setValue(result, this.gadgetModel, this);
        },
        onClickAddItem: function () {
            this.collection.add({});
            this.renderItems();
        },
        renderItems: function () {
            var self = this;
            if(!this.collection.models.length) {
                this.collection.add({});
            }
            this.destroyItems();
            _.each(this.collection.models, function (model, number) {
                var view = new SettingCustomColumnView({ model: model, number: number + 1 });
                self.renderedItems.push(view);
                $('[data-js-items-container]', self.$el).append(view.$el);
            });
            this.onChangeCollection();
        },
        destroyItems: function () {
            _.each(this.renderedItems, function (view) {
                view.destroy();
            });
            this.renderedItems = [];
        },
        validate: function () {
            return true;
        },
        onDestroy: function () {
            this.destroyItems();
        }
    });

    return SettingCustomColumnsView;
});
