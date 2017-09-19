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
    var DropDownComponent = require('components/DropDownComponent');
    var Localization = require('localization');

    var actionTypes = {};

    var SettingDropDownView = SettingView.extend({
        className: 'modal-add-widget-setting-drop-down',
        template: 'tpl-modal-add-widget-setting-drop-down',
        bindings: {
            '[data-js-label-name]': 'html:label'
        },
        initialize: function (data) {
            var options = _.extend({
                items: [],
                label: '',
                multiple: false,
                placeholder: '',
                notEmpty: true,
                value: ''
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
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        activate: function () {
            this.model.set({ value: this.getValue(this.gadgetModel, this) });
            this.dropDown = new DropDownComponent({
                data: this.model.get('items'),
                placeholder: this.model.get('placeholder'),
                multiple: this.model.get('multiple'),
                defaultValue: this.model.get('value')
            });
            $('[data-js-drop-down-container]', this.$el).html(this.dropDown.$el);
            this.listenTo(this.dropDown, 'change', this.onChangeDropDown);
            this.listenTo(this.model, 'change:value', this.validate);
            this.activated = true;
        },
        onChangeDropDown: function (value) {
            this.model.set({ value: value });
            this.setValue(value, this.gadgetModel, true);
        },
        validate: function (options) {
            if (this.model.get('notEmpty') && !this.model.get('value').length) {
                if (options && options.silent) {
                    return false;
                }
                this.dropDown.setErrorState(Localization.validation.moreAtItem);
                return false;
            }
            return true;
        },
        onDestroy: function () {
            this.dropDown && this.dropDown.destroy();
        }
    });

    return SettingDropDownView;
});
