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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var config = App.getInstance();

    var TwitterNewsItemView = Epoxy.View.extend({
        className: 'post-news-item',
        template: 'tpl-twitter-news-item',
        events: {
            'click [data-js-social-link]': 'onClickSocialLink'
        },
        bindings: {
            '[data-js-text]': 'html: textHtml'
        },

        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template));
        },
        onClickSocialLink: function () {
            config.trackingDispatcher.trackEventNumber(527);
        }
    });

    return TwitterNewsItemView;
});
