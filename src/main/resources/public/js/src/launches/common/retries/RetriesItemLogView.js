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
    var LogItemInfoStackTraceView = require('launches/logLevel/LogItemInfoTabs/LogItemInfoStackTraceView');

    var RetriesItemLogView = Epoxy.View.extend({
        template: 'tpl-retries-item-log',
        className: 'retries-item-log-view',
        events: {
        },
        bindings: {
            '[data-js-number]': 'text: number',
            '[data-js-link]': 'attr: {href: link}'
        },
        computeds: {
            link: {
                deps: [''],
                get: function () {
                    var baseUrl = this.retryLastModel.get('url') + '&log.retry=' + this.model.get('id');
                    if (this.retryLastModel.get('has_childs')) {
                        baseUrl += '&log.item=' + this.retryLastModel.get('id');
                    }
                    return baseUrl;
                }
            }
        },
        initialize: function (options) {
            this.retryLastModel = options.lastRetryModel;
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.stackTrace = new LogItemInfoStackTraceView({
                itemModel: this.model,
                parentModel: new Epoxy.Model()
            });
            $('[data-js-message-container]', this.$el).html(this.stackTrace.$el);
            this.baron = Util.setupBaronScroll($('[data-js-message-container] ', this.$el));
            this.stackTrace.onShow(true, true);
        },
        onDestroy: function () {
            this.$el.empty();
            delete this;
        }
    });

    return RetriesItemLogView;
});
