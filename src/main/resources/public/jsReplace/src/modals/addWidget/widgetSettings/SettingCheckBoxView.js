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
    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');

    var actionTypes = {
        latest_launches: {
            setValue: function (value, model) {
                var widgetOptions = model.getWidgetOptions();
                if (value) {
                    widgetOptions.latest = [];
                } else {
                    delete widgetOptions.latest;
                }
                model.setWidgetOptions(widgetOptions);
            },
            getValue: function (model) {
                return !!(model.getWidgetOptions().latest);
            }
        }
    };

    var SettingCheckBoxView = SettingView.extend({
        className: 'modal-add-widget-setting-checkbox',
        template: 'tpl-modal-add-widget-setting-checkbox',
        bindings: {
            '[data-js-label-name]': 'html:label',
            '[data-js-checkbox-item]': 'checked:value'
        },
        initialize: function (data) {
            var options = _.extend({
                label: '',
                value: false
            }, data.options);
            this.model = new Epoxy.Model(options);
            this.gadgetModel = data.gadgetModel;
            this.render(options);
            if (options.action && actionTypes[options.action]) {
                this.setValue = actionTypes[options.action].setValue;
                this.getValue = actionTypes[options.action].getValue;
            }
            options.setValue && (this.setValue = options.setValue);
            options.getValue && (this.getValue = options.getValue);
        },
        render: function (options) {
            this.$el.html(Util.templates(this.template, { beta: options.beta }));
        },
        activate: function () {
            this.model.set({ value: this.getValue(this.gadgetModel, this) });
            this.listenTo(this.model, 'change:value', this.onChangeValue);
            this.activated = true;
        },
        onChangeValue: function () {
            this.setValue(this.model.get('value'), this.gadgetModel, this);
        },
        validate: function () {
            return true;
        },
        onDestroy: function () {
        }
    });

    return SettingCheckBoxView;
});
