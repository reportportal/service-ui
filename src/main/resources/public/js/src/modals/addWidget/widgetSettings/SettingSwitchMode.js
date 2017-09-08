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
    var WidgetService = require('newWidgets/WidgetService');
    var App = require('app');

    var config = App.getInstance();

    var SettingSwitchMode = SettingView.extend({
        className: 'modal-add-widget-setting-switch-mode',
        template: 'tpl-modal-add-widget-setting-switch-mode',
        events: {
            'click [data-js-switch-item]': 'onClickItem'
        },
        bindings: {
        },
        initialize: function () {
            this.curWidget = WidgetService.getWidgetConfig(this.model.get('gadget'));
            if (!this.curWidget.mode) {
                this.destroy();
                return false;
            }
            this.render();
            this.setDefaultState();
            return true;
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.curWidget.mode));
        },
        onClickItem: function (e) {
            var $el = $(e.currentTarget);
            var key = $el.data('key');
            var curOptions = this.model.getWidgetOptions();
            config.trackingDispatcher.trackEventNumber(300);
            e.preventDefault();
            if (!$el.hasClass('active')) {
                $('[data-js-switch-item]', this.$el).removeClass('active');
                $el.addClass('active');
                switch (key) {
                case 'launch':
                    delete curOptions.timeline;
                    this.model.setWidgetOptions(curOptions);
                    break;
                case 'timeline':
                    curOptions.timeline = ['DAY'];
                    this.model.setWidgetOptions(curOptions);
                    break;
                case 'lineMode':
                    delete curOptions.chartMode;
                    this.model.setWidgetOptions(curOptions);
                    break;
                case 'chartMode':
                    curOptions.chartMode = [];
                    this.model.setWidgetOptions(curOptions);
                    break;
                    // -------- New widget's cases (Chartist & C3) --------
                case 'pieChartMode':
                case 'barMode':
                case 'donutChartMode':
                case 'trendChartMode':
                    curOptions.chartMode = [key];
                    this.model.setWidgetOptions(curOptions);
                    break;
                default:
                    break;
                }
            }
        },
        setDefaultState: function () {
            var curOptions = this.model.getWidgetOptions();
            var keys = _.keys(curOptions);
            var mode = this.curWidget.mode.defaultVal;

            // -------- New widget's functionality (Chartist) --------
            if (this.model.get('gadget') === 'passing_rate_per_launch' || this.model.get('gadget') === 'passing_rate_summary') {
                if (curOptions.chartMode && curOptions.chartMode.length) {
                    $('[data-key="' + curOptions.chartMode[0] + '"]', this.$el).addClass('active');
                } else {
                    $('[data-key="' + this.curWidget.mode.defaultVal + '"]', this.$el).addClass('active');
                    curOptions.chartMode = [this.curWidget.mode.defaultVal];
                    this.model.setWidgetOptions(curOptions);
                }
                return;
            }
            // -----------------------------------------------

            if (keys.length) {
                _.each(keys, function (val) {
                    if (val === 'timeline' || val === 'chartMode') {
                        mode = val;
                    }
                });
            }
            $('[data-key="' + mode + '"]', this.$el).addClass('active');
        }
    });

    return SettingSwitchMode;
});
