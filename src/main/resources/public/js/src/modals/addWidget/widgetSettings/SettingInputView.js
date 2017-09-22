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
    var Localization = require('localization');
    var Validators = require('validators');
    var App = require('app');
    var config = App.getInstance();
    var actionTypes = {
        limit: {
            getValue: function (gadgetModel, self) {
                if (!gadgetModel.get('itemsCount')) {
                    return self.model.get('def');
                }
                return gadgetModel.get('itemsCount');
            },
            setValue: function (value, gadgetModel) {
                gadgetModel.set('itemsCount', value);
            }
        },
        tagPrefix: {
            getValue: function (gadgetModel, self) {
                var widgetOptions = gadgetModel.getWidgetOptions();
                if (widgetOptions.prefix && widgetOptions.prefix.length) {
                    return widgetOptions.prefix[0];
                }
                return '';
            },
            setValue: function (value, gadgetModel) {
                var widgetOptions = gadgetModel.getWidgetOptions();
                widgetOptions.prefix = [value];
                gadgetModel.setWidgetOptions(widgetOptions);
            }
        }
    };

    var SettingInputView = SettingView.extend({
        className: 'modal-add-widget-setting-input',
        template: 'tpl-modal-add-widget-setting-input',
        events: {
        },
        bindings: {
            '[data-js-input]': 'value: value, attr: {placeholder: placeholder}',
            '[data-js-description]': 'html: description, classes: {hide: not(description)}'
        },
        initialize: function (data) {
            var options = _.extend({
                name: Localization.widgets.items,
                min: 1,
                max: 150,
                def: 50,
                value: '',
                description: '',
                placeholder: ''
            }, data.options);
            if (options.numOnly) {
                this.$el.addClass('num-only');
            }
            this.model = new Epoxy.Model(options);
            this.gadgetModel = data.gadgetModel;
            this.render();
            if (options.action && actionTypes[options.action]) {
                this.setValue = actionTypes[options.action].setValue;
                this.getValue = actionTypes[options.action].getValue;
            }
            options.setValue && (this.setValue = options.setValue);
            options.getValue && (this.getValue = options.getValue);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                name: this.model.get('name')
            }));
        },
        bindValidators: function () {
            if (this.model.get('numOnly')) {
                Util.hintValidator($('[data-js-input]', this.$el), [{
                    validator: 'minMaxNumberRequired',
                    type: 'itemsSize',
                    min: this.model.get('min'),
                    max: this.model.get('max')
                }]);
            } else {
                Util.hintValidator($('[data-js-input]', this.$el), [{
                    validator: 'minMaxRequired',
                    type: 'valueSize',
                    min: this.model.get('min'),
                    max: this.model.get('max')
                }]);
            }
        },
        activate: function () {
            this.listenTo(this.model, 'change:value', this.onChangeValue);
            this.model.set({ value: this.getValue(this.gadgetModel, this) });
            this.bindValidators();
            this.activated = true;
        },
        onChangeValue: function () {
            if (this.validate()) {
                this.setValue(this.model.get('value'), this.gadgetModel, this);
                config.trackingDispatcher.trackEventNumber(299);
            }
        },
        validate: function (options) {
            if (options && options.silent) {
                if (this.model.get('numOnly')) {
                    return !Validators.minMaxNumberRequired(this.model.get('value').toString(), {
                        type: 'itemsSize',
                        min: this.model.get('min'),
                        max: this.model.get('max')
                    }, Util);
                }
                return !Validators.minMaxRequired(this.model.get('value').toString(), {
                    type: 'itemsSize',
                    min: this.model.get('min'),
                    max: this.model.get('max')
                }, Util);
            }
            return !$('[data-js-input]', this.$el).trigger('validate').data('validate-error');
        }
    });

    return SettingInputView;
});
