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
    var $ = require('jquery');
    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var Epoxy = require('backbone-epoxy');

    var actionTypes = {
        switch_view_mode: {
            setValue: function (value, model) {
                var widgetOptions = model.getWidgetOptions();
                widgetOptions.viewMode = [value];
                model.setWidgetOptions(widgetOptions);
            },
            getValue: function (model, self) {
                var viewMode = model.getWidgetOptions().viewMode;
                if (!viewMode || !viewMode.length) {
                    return self.model.get('items')[0];
                }
                return viewMode[0];
            }
        },
        switch_latest_mode: {
            setValue: function (value, model) {
                var widgetOptions = model.getWidgetOptions();
                if (value === 'latest') {
                    widgetOptions.latest = [];
                } else {
                    delete widgetOptions.latest;
                }
                model.setWidgetOptions(widgetOptions);
            },
            getValue: function (model, self) {
                var latestMode = !!(model.getWidgetOptions().latest);
                if (latestMode) {
                    return 'latest';
                }
                return 'all';
            }
        },
        switch_timeline_mode: {
            setValue: function (value, model) {
                var widgetOptions = model.getWidgetOptions();
                if (value === 'timeline') {
                    widgetOptions.timeline = ['DAY'];
                } else {
                    delete widgetOptions.timeline;
                }
                model.setWidgetOptions(widgetOptions);
            },
            getValue: function (model, self) {
                var timelineMode = !!(model.getWidgetOptions().timeline);
                if (timelineMode) {
                    return 'timeline';
                }
                return 'launch';
            }
        }
    };

    var SettingSwitcherView = SettingView.extend({
        className: 'setting-switcher',
        template: 'tpl-setting-switcher',
        events: {
            'click [data-js-switch-item]': 'onClickItem'
        },
        bindings: {
        },
        initialize: function (data) {
            var options = _.extend({
                items: [],
                value: 0
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
            this.$el.html(Util.templates(this.template, this.model.get('items')));
        },
        activate: function () {
            var self = this;
            var curVal = this.getValue(this.gadgetModel, this);
            _.each(this.model.get('items'), function (item, index) {
                if (item.value === curVal) {
                    self.model.set({ value: index });
                    return false;
                }
                return true;
            });
            this.listenTo(this.model, 'change:value', this.onChangeValue);
            this.onChangeValue();
            this.activated = true;
        },
        onChangeValue: function () {
            $('[data-js-switch-item]', this.$el).removeClass('active');
            if(this.model.get('value') >= 0){
                this.setValue(this.model.get('items')[this.model.get('value')].value, this.gadgetModel, this);
                $('[data-js-switch-item]', this.$el).eq(this.model.get('value')).addClass('active');
            }
        },
        onClickItem: function (e) {
            var curNum = $(e.currentTarget).data('num');
            this.model.set({ value: curNum });
        },
        validate: function () {
            return true;
        },
        onDestroy: function () {
        }
    });

    return SettingSwitcherView;
});
