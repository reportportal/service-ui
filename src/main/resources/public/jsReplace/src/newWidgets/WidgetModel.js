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
define(function (require, exports, module) {
    'use strict';

    var Epoxy = require('backbone-epoxy');

    var WidgetModel = Epoxy.Model.extend({
        defaults: {
            content: {},
            content_parameters: {},
            filter_id: '',
            share: false,
            name: '',
            owner: '',
            interval: 3 // default interval for status page widgets
        },
        computeds: {
            isTimeline: {
                deps: ['content_parameters'],
                get: function (widgetOptions) {
                    var options = this.getWidgetOptions();
                    if (options.timeline && options.timeline.length) {
                        return true;
                    }
                    return false;
                }
            },
            gadget: {
                deps: ['content_parameters'],
                get: function (params) {
                    return this.getParameters().gadget;
                }
            }
        },
        initialize: function () {

        },
        getContent: function () {
            try {
                return JSON.parse(this.get('content'));
            } catch (err) {
                return [];
            }
        },
        setContent: function (options) {
            this.set({ content: JSON.stringify(options) });
        },
        getParameters: function () {
            try {
                return JSON.parse(this.get('content_parameters'));
            } catch (err) {
                return {};
            }
        },
        setParameters: function (options) {
            this.set({ content_parameters: JSON.stringify(options) });
        },
        getContentFields: function () {
            return this.getParameters().content_fields || [];
        },
        setContentFields: function (data) {
            var params = this.getParameters();
            params.content_fields = data;
            this.setParameters(params);
        },
        getWidgetOptions: function () {
            return this.getParameters().widgetOptions || {};
        },
        parse: function (data) {
            return {
                id: data.id,
                content: JSON.stringify(data.content),
                content_parameters: JSON.stringify(data.content_parameters),
                filter_id: data.filter_id,
                share: data.share,
                name: data.name,
                owner: data.owner,
                interval: data.interval || 3
            };
        }
    });

    return WidgetModel;
});
