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

    var $ = require('jquery');
    var Util = require('util');
    var FilterSelectedView = require('modals/addWidget/widgetSettings/SettingFilters/SettingSelectedFilterView');
    var SettingFilterSearchView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFilterSearchView');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');

    var SettingFiltersView = SettingView.extend({
        className: 'modal-add-widget-setting-filters',
        template: 'tpl-modal-add-widget-setting-filters',
        events: {
        },

        initialize: function (options) {
            this.gadgetModel = options.gadgetModel;
            this.isShortForm = options.options.isShortForm;
            this.switchable = options.options.switchable;
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            (this.isShortForm) ? this.renderShortForm() : this.renderBaseForm();
        },
        renderBaseForm: function () {
            if (this.settingView) {
                this.stopListening(this.settingView);
                this.settingView.destroy();
            }
            this.settingView = new SettingFilterSearchView({ gadgetModel: this.gadgetModel });
            $('[data-js-setting-filters-container]', this.$el).html(this.settingView.$el);
            if (!this.switchable) {
                $('[data-js-filter-list-buttons]', this.$el).hide();
            }
            this.settingView.activate();
            this.listenTo(this.settingView, 'cancelFilter submitFilter', this.switchToShortForm);
            this.listenTo(this.settingView, 'send:event', this.sendEvent);
            if (!this.switchable) {
                this.listenTo(this.settingView, 'returnToFiltersList', this.hideToAddEditFilterForm);
                this.listenTo(this.settingView, 'editFilterMode addFilterMode', this.showToAddEditFilterForm);
            }
        },
        renderShortForm: function () {
            if (this.settingView) {
                this.stopListening(this.settingView);
                this.settingView.destroy();
            }
            this.settingView = new FilterSelectedView({ gadgetModel: this.gadgetModel });
            $('[data-js-setting-filters-container]', this.$el).html(this.settingView.$el);
            if (!this.switchable) {
                $('[data-js-filter-edit]', this.$el).hide();
            }
            this.listenTo(this.settingView, 'edit', this.switchToBaseForm);
            this.listenTo(this.settingView, 'send:event', this.sendEvent);
        },
        sendEvent: function (eventOptions) {
            this.trigger('send:event', eventOptions);
        },
        switchToBaseForm: function () {
            this.trigger('showBaseViewMode', true, 'settingFilters');
            this.clearSetting();
            this.renderBaseForm();
        },
        switchToShortForm: function () {
            this.trigger('showBaseViewMode', false);
            this.clearSetting();
            this.renderShortForm();
        },
        showToAddEditFilterForm: function () {
            this.trigger('showBaseViewMode', true, 'settingFilters');
        },
        hideToAddEditFilterForm: function () {
            this.trigger('showBaseViewMode', false);
        },
        clearSetting: function () {
            this.settingView && this.stopListening(this.settingView) && this.settingView.destroy();
            $('[data-js-setting-filters-container]', this.$el).html('');
        },
        activate: function () {
            this.settingView && this.settingView.activate && this.settingView.activate();
            this.activated = true;
        },
        validate: function (options) {
            if (this.settingView && this.settingView.validate) {
                if (options && options.silent) {
                    return this.settingView.validate({ silent: true });
                }
                return this.settingView.validate();
            }
            return true;
        },
        onDestroy: function () {
            this.settingView && this.settingView.destroy();
            this.$el.remove();
        }
    });

    return SettingFiltersView;
});
