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
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Localization = require('localization');

    var SettingSwitchMode = SettingView.extend({
        className: 'modal-add-widget-setting-switch-mode',
        template: 'modal-add-widget-setting-switch-mode',
        events: {
            'click [data-js-launch-mode]': 'onClickLaunch',
            'click [data-js-timeline-mode]': 'onClickTimeline',
        },
        bindings: {
        },
        initialize: function() {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.curWidget = this.widgetConfig.widgetTypes[this.model.get('gadget')];
            if (!this.curWidget.mode) {
                this.destroy();
                return false;
            }
            this.curWidget.mode.timeline = this.model.getWidgetOptions().timeline;
            this.render();
            this.$launchMode = $('[data-js-launch-mode]', this.$el);
            this.timelineMode = $('[data-js-timeline-mode]', this.$el)
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.curWidget.mode))
        },
        onClickLaunch: function(e) {
            e.preventDefault();
            if(!this.$launchMode.hasClass('active')) {
                this.$launchMode.addClass('active');
                this.timelineMode.removeClass('active');
                var curOptions = this.model.getWidgetOptions();
                delete curOptions.timeline;
                this.model.setWidgetOptions(curOptions);
            }
        },
        onClickTimeline: function(e) {
            e.preventDefault();
            if(!this.timelineMode.hasClass('active')) {
                this.timelineMode.addClass('active');
                this.$launchMode.removeClass('active');
                var curOptions = this.model.getWidgetOptions();
                curOptions.timeline = ['DAY'];
                this.model.setWidgetOptions(curOptions);
            }
        }
    });

    return SettingSwitchMode;
});
