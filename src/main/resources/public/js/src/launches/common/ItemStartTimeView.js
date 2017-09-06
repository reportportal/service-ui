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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var App = require('app');
    var Localization = require('localization');
    var Moment = require('moment');

    var ItemDurationView = Epoxy.View.extend({
        className: 'launch-suite-start-time',
        tagName: 'span',
        template: 'tpl-launch-suite-item-start-time',
        events: {
            click: 'onClickItem'
        },
        bindings: {
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            ':el': 'classes:{"exact-driven":startTimeFormat}'
        },
        computeds: {

        },
        initialize: function () {
            this.viewModel = new SingletonUserStorage();
            this.render();
            // var timeFormat = this.userStorage.get('startTimeFormat');
            // if (!silent) {
            //     if (timeFormat === 'exact') {
            //         timeFormat = '';
            //     } else {
            //         timeFormat = 'exact';
            //     }
            //     this.userStorage.set('startTimeFormat', timeFormat);
            // }
            // if (timeFormat) {
            //     this.$el.addClass('exact-driven');
            // } else {
            //     this.$el.removeClass('exact-driven');
            // }
        },
        onClickItem: function () {
            var timeFormat = this.viewModel.get('startTimeFormat');
            if (timeFormat === 'exact') {
                timeFormat = '';
            } else {
                timeFormat = 'exact';
            }
            this.viewModel.set('startTimeFormat', timeFormat);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onDestroy: function () {
            this.$el.empty();
            delete this;
        }
    });

    return ItemDurationView;
});
