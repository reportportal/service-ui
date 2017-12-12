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
    var Localization = require('localization');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var App = require('app');
    var config = App.getInstance();

    var FlakyTestCases = BaseWidgetView.extend({

        template: 'tpl-widget-flaky-test-cases-table',
        itemTemplate: 'tpl-widget-flaky-test-cases-table-item',
        className: 'flaky-test-cases',
        events: {
            'click [data-js-date]': 'formatDate',
            'click [data-js-link]': 'onClickItem'
        },

        render: function () {
            var self = this;
            var contentData = this.model.getContent();
            var itemsHtml = '';
            var launchData;
            if (this.isEmpty(contentData)) {
                this.addNoAvailableBock();
                return;
            }
            launchData = {
                id: contentData.lastLaunch[0].id,
                name: contentData.lastLaunch[0].name,
                number: contentData.lastLaunch[0].number
            };
            this.$el.html(Util.templates(this.template, launchData));
            _.each(contentData.flaky, function (item) {
                itemsHtml += Util.templates(self.itemTemplate, {
                    name: item.name,
                    link: self.getFilterByUIDRedirectLink(launchData.id, item.uniqueId),
                    percents: item.percentage,
                    count: item.switchCounter + ' ' + Localization.ui.of + ' ' + item.total,
                    statuses: item.statuses,
                    date: Util.dateFormat(item.lastTime),
                    dateFrom: Moment(Util.dateFormat(item.lastTime)).fromNow()
                });
            });
            this.scroller = Util.setupBaronScroll($('[data-js-scroll]', this.$el));
            $('[data-js-items-container]', this.$el).html(itemsHtml);

            this.userStorage = new SingletonUserStorage();
            this.timeFormat = this.userStorage.get('startTimeFormat');
            if (this.timeFormat !== 'exact') {
                $('[data-js-date]', this.$el).toggleClass('date-from-now');
            }
        },
        onClickItem: function (e) {
            config.trackingDispatcher.trackEventNumber(344);
            config.router.navigate($(e.currentTarget).attr('data-js-link'), { trigger: true });
        },
        formatDate: function () {
            (this.timeFormat === 'exact') ? this.timeFormat = '' : this.timeFormat = 'exact';
            this.userStorage.set('startTimeFormat', this.timeFormat);
            $('[data-js-date]', this.$el).toggleClass('date-from-now');
        },
        isEmpty: function (data) {
            return !(data && data.flaky && data.flaky.length);
        },
        onBeforeDestroy: function () {
            this.scroller && this.scroller.baron && this.scroller.baron().dispose();
        }
    });

    return FlakyTestCases;
});
