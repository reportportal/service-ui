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
    var Util = require('util');
    var Moment = require('moment');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');

    var MostFailedTestCases = BaseWidgetView.extend({

        tpl: 'tpl-widget-most-failed-table',
        getData: function () {
            var contentData = this.model.getContent() || {};
            var lastLaunch = contentData.lastLaunch;
            var items;
            delete contentData.lastLaunch;
            items = _.map(contentData, function (val, key) {
                return {
                    name: key,
                    runs: val[0].values['All runs'],
                    failed: val[0].values['Failed'],
                    affected: val[0].values['Affected by'],
                    depth: val[0].values['Launch depth'],
                    lastDate: val[0].values['Last Failure']
                };
            });
            return {
                items: items,
                lastLaunch: lastLaunch ? lastLaunch[0] : {}
            };
        },
        render: function () {
            var data = this.getData();
            var widgetOptions = this.model.getWidgetOptions();
            var launchNameFilter = widgetOptions.launchNameFilter || [];
            var params;
            if (!this.isEmptyData(data.items)) {
                params = {
                    items: data.items,
                    lastLaunch: {
                        id: data.lastLaunch.id,
                        link: this.linkToRedirectService('most_failed', data.lastLaunch.id),
                        name: launchNameFilter.length ? launchNameFilter[0] : ''
                    },
                    dateFormat: Util.dateFormat,
                    moment: Moment
                };
                this.$el.html(Util.templates(this.tpl, params));
                Util.hoverFullTime(this.$el);
                !this.isPreview && Util.setupBaronScroll($('.most-failed-launches', this.$el));
            } else {
                this.addNoAvailableBock();
            }
        }
    });

    return MostFailedTestCases;
});
