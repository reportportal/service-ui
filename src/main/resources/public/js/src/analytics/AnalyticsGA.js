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

'use strict';

define(function (require) {
    var AnalyticsObject = require('analytics/AnalyticsObject');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var AnalyticsGA = AnalyticsObject.extend({
        initialize: function () {
            if ('DEBUG_STATE') {
                return;
            }
            window.ga = window.ga || function () {
                (ga.q = ga.q || []).push(arguments);
            };
            ga.l = +new Date();
            ga('create', 'UA-96321031-1', 'auto');
            ga('send', 'pageview');
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://www.google-analytics.com/analytics.js';
            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);
            var registryInfoModel = new SingletonRegistryInfoModel();
            registryInfoModel.ready.done(function () {
                var services = registryInfoModel.get('services');
                var instanceId = '';
                if (services && services.API && services.API.extensions && services.API.extensions.instanceId) {
                    instanceId = services.API.extensions.instanceId;
                }
                ga('set', 'campaignMedium', instanceId);
            });
        },
        send: function (data) {
            if ('DEBUG_STATE') {
                return;
            }
            ga('send', 'event', data[0], data[1], data[2]);
        },
        pageView: function (data) {
            if ('DEBUG_STATE') {
                return;
            }
            ga('send', 'pageview', data[0]);
        }
    });

    return AnalyticsGA;
});
