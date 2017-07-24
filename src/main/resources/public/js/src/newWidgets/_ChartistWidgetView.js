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

    var $ = require('jquery');
    var _ = require('underscore');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');

    var ChartistWidgetView = BaseWidgetView.extend({

        loadChartist: function () {
            var async = $.Deferred();
            if (typeof Chartist !== 'undefined') {
                async.resolve();
                return async;
            }
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/chartist.js';
            script.onload = function () {
                async.resolve();
            };
            script.onerror = function (e) {
                async.reject();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        },
        loadChartistLegendPlugin: function () {
            var async = $.Deferred();
            if (Chartist.plugins && typeof Chartist.plugins.legend !== 'undefined') {
                async.resolve();
                return async;
            }
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/chartist-plugin-legend.js';
            script.onload = function () {
                async.resolve();
            };
            script.onerror = function (e) {
                async.reject();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        },
        loadChartistBarLabelsPlugin: function () {
            var async = $.Deferred();
            if (Chartist.plugins && typeof Chartist.plugins.ctBarLabels !== 'undefined') {
                async.resolve();
                return async;
            }
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/chartist-plugin-bar-labels.js';
            script.onload = function () {
                async.resolve();
            };
            script.onerror = function (e) {
                async.reject();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        },
        loadChartistTooltipsPlugin: function () {
            var async = $.Deferred();
            if (Chartist.plugins && typeof Chartist.plugins.tooltip !== 'undefined') {
                async.resolve();
                return async;
            }
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/chartist-plugin-tooltip.js';
            script.onload = function () {
                async.resolve();
            };
            script.onerror = function (e) {
                async.reject();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        },
        isDataExists: function () {
            return (!_.isEmpty(this.model.getContent()) && !_.isEmpty(this.model.getContent().result[0].values));
        },
        updateWidget: function () {
            this.chart && this.chart.update();
        }
    });

    return ChartistWidgetView;
});
