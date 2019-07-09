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

    var SettingInputItemsView = require('modals/addWidget/widgetSettings/SettingInputItemsView');
    var SettingDropDownView = require('modals/addWidget/widgetSettings/SettingDropDownView');
    var SettingCheckBoxView = require('modals/addWidget/widgetSettings/SettingCheckBoxView');
    var SettingSwitcherView = require('components/SettingSwitcherView');
    var SettingCustomColumnsView = require('modals/addWidget/widgetSettings/SettingCustomColumn/SettingCustomColumnsView');
    var SettingFiltersView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFiltersView');
    var SettingInputView = require('modals/addWidget/widgetSettings/SettingInputView');
    var SettingStaticData = require('modals/addWidget/widgetSettings/SettingStaticData');

    var WidgetSettingsView = Epoxy.View.extend({
        className: 'modal-add-widget-settings-list rp-form',
        events: {
        },
        bindings: {
        },
        initialize: function (options) {
            this.lastFilterId = options.lastFilterId;
            this.isShortForm = options.isShortForm || false;
            this.renderedView = [];
        },
        activate: function () {
            var self = this;
            this.destroyViews();
            this.lastFilterId && this.model.set('filter_id', this.lastFilterId);
            WidgetService.getSettingsGadget(this.model.get('gadget')).done(function (widgetConfig) {
                _.each(widgetConfig.uiControl, function (controlObj) {
                    var constructor;
                    var options = controlObj.options;
                    options.isShortForm = this.isShortForm;
                    switch (controlObj.control) {
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
                    case 'customColumns':
                        constructor = SettingCustomColumnsView;
                        break;
                    case 'filters':
                        constructor = SettingFiltersView;
                        options.switchable = self.isShortForm;
                        break;
                    case 'input':
                        constructor = SettingInputView;
                        break;
                    case 'static':
                        constructor = SettingStaticData;
                        break;
                    default:
                        break;
                    }
                    constructor && self.renderSetting(constructor, options);
                }, self);
                if (!self.model.get('itemsCount')) {
                    self.model.set('itemsCount', 50);
                }
            });
        },
        renderSetting: function (ViewConstructor, options) {
            var view = new ViewConstructor({
                gadgetModel: this.model,
                options: options
            });

            this.listenTo(view, 'showBaseViewMode', this.viewModeHandler);
            this.listenTo(view, 'send:event', this.sendEvent);
            this.renderedView.push(view);
            this.$el.append(view.$el);
            // set default state for model
            view.setValue(view.getValue(this.model, view), this.model);
            view.activate && view.activate();
        },
        sendEvent: function (eventOptions) {
            this.trigger('send:event', eventOptions);
        },
        viewModeHandler: function (showBaseViewMode, settingView) {
            if (showBaseViewMode) {
                this.trigger('change:view', { mode: 'expandedSettingView' });
                this.$el.attr('expanded-setting', settingView);
            } else {
                this.trigger('change:view', { mode: 'allSettingsView' });
                this.$el.removeAttr('expanded-setting');
            }
        },
        validate: function (options) {
            var result = true;
            if (options && options.forPreview) {
                if (!this.renderedView.length) {
                    return false;
                }
                _.each(this.renderedView, function (view) {
                    if (!view.activated || !view.validate({ silent: true })) {
                        result = false;
                    }
                });
                return result;
            }
            _.each(this.renderedView, function (view) {
                if (!view.validate()) {
                    result = false;
                }
            });
            return result;
        },
        destroyViews: function () {
            _.each(this.renderedView, function (view) {
                view.destroy();
            });
            this.renderedView = [];
        },
        onDestroy: function () {
            this.destroyViews();
        }
    });

    return WidgetSettingsView;
});
