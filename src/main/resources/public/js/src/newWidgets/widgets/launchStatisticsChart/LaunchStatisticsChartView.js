/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var LaunchStatisticsChartAreaView = require('newWidgets/widgets/launchStatisticsChart/LaunchStatisticsChartAreaView');
    var LaunchStatisticsChartBarView = require('newWidgets/widgets/launchStatisticsChart/LaunchStatisticsChartBarView');

    var LaunchStatisticsChart = Epoxy.View.extend({
        template: 'tpl-widget-launch-statistics-chart',
        className: 'launch-statistics-chart',
        initialize: function (options) {
            this.render(options);
        },
        render: function (options) {
            var opts = options;
            opts.el = this.$el;
            this.widgetView = this.isInitBarWidget(this.model.getWidgetOptions()) ?
                new LaunchStatisticsChartBarView(opts) :
                new LaunchStatisticsChartAreaView(opts);
            this.$el.html(Util.templates(this.template, {}));
        },
        isInitBarWidget: function (widgetOptions) {
            return (widgetOptions && widgetOptions.viewMode && widgetOptions.viewMode.length && widgetOptions.viewMode[0] === 'barMode');
        },
        addSizeClasses: function (gadgetSize) {
            if (this.widgetView && !this.widgetView.isPreview) {
                this.widgetView.addSizeClasses(gadgetSize);
            }
        },
        updateSizeClasses: function (newGadgetSize) {
            this.widgetView && this.widgetView.updateSizeClasses(newGadgetSize);
        },
        onShow: function () {
            this.widgetView && this.widgetView.onShow();
        },
        onDestroy: function () {
            this.widgetView && this.widgetView.onDestroy();
        }
    });

    return LaunchStatisticsChart;
});
