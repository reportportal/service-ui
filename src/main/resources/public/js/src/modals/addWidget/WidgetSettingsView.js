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

    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var WidgetService = require('newWidgets/WidgetService');
    var SettingCriteriaView = require('modals/addWidget/widgetSettings/SettingCriteriaView');
    var SettingItemsView = require('modals/addWidget/widgetSettings/SettingItemsView');
    var SettingSwitchMode = require('modals/addWidget/widgetSettings/SettingSwitchMode');
    var SettingActionView = require('modals/addWidget/widgetSettings/SettingActionView');
    var SettingUsersView = require('modals/addWidget/widgetSettings/SettingUsersView');
    var SettingLaunchView = require('modals/addWidget/widgetSettings/SettingLaunchView');

    var SettingInputItemsView = require('modals/addWidget/widgetSettings/SettingInputItemsView');
    var SettingDropDownView = require('modals/addWidget/widgetSettings/SettingDropDownView');
    var SettingCheckBoxView = require('modals/addWidget/widgetSettings/SettingCheckBoxView');
    var SettingSwitcherView = require('modals/addWidget/widgetSettings/SettingSwitcherView');

    var WidgetCriteriaView = Epoxy.View.extend({
        className: 'modal-add-widget-criteria-list rp-form',
        events: {
        },
        bindings: {
        },
        initialize: function () {
            this.renderedView = [];
        },
        renderView: function (ViewConstructor, data) {
            var view = new ViewConstructor({ model: this.model });
            if (!view.unActive) {
                this.renderedView.push(view);
                this.$el.append(view.$el);
                view.activate && view.activate();
            }
        },
        activate: function () {
            _.each(this.renderedView, function (view) {
                view.destroy();
            });
            this.renderedView = [];
            this.renderView(SettingCriteriaView);
            this.renderView(SettingActionView);
            this.renderView(SettingItemsView);
            this.renderView(SettingSwitchMode);
            this.renderView(SettingUsersView);
            this.renderView(SettingLaunchView);

            var widgetConfig = WidgetService.getWidgetConfig(this.model.get('gadget'));
            _.each(widgetConfig.uiControl, function (controlObg) {
                var constructor;
                switch (controlObg.control) {
                case 'inputItems':
                    constructor = SettingInputItemsView;
                    break;
                case 'dropDown':
                    constructor = SettingDropDownView;
                    break;
                case 'checkbox':
                    constructor = SettingCheckBoxView;
                    break;
                case 'switcher':
                    constructor = SettingSwitcherView;
                    break;
                default:
                    break;
                }
                constructor && this.renderSetting(constructor, controlObg.options);
            }, this);
        },
        renderSetting: function (ViewConstructor, options) {
            var view = new ViewConstructor({
                gadgetModel: this.model,
                options: options
            });
            this.renderedView.push(view);
            this.$el.append(view.$el);
            view.activate && view.activate();
        },
        validate: function () {
            var result = true;
            _.each(this.renderedView, function (view) {
                if (!view.validate()) {
                    result = false;
                }
            });
            return result;
        }

    });

    return WidgetCriteriaView;
});
