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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');

    var config = App.getInstance();

    var LaunchStatisticsExecutionsView = Epoxy.View.extend({
        template: 'tpl-launch-suite-item-executions',
        initialize: function(options) {
            this.$container = options.$container;
            this.type = options.type;
            this.render();
        },
        bindings: {
            '[data-js-executions-total]': 'text: totalStatistics',
            '[data-js-all-cases-url]': 'attr:{href:allCasesUrl}'
        },
        computeds: {
            totalStatistics: function(){
                var statistics = this.getBinding('statistics');
                return statistics['executions'][this.type];
            },
            allCasesUrl: function(){
                var url = this.getBinding('url'),
                    id = this.getBinding('id'),
                    owner = this.getBinding('owner'),
                    positionalFilter = owner !== undefined ? '&filter.eq.launch=' : '&filter.in.path=',
                    statusFilter = '';

                switch (this.type) {
                    case 'total':
                        statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                        break;
                    case 'passed':
                    case 'failed':
                    case 'skipped':
                        statusFilter = '&filter.in.status=' + this.type.toUpperCase() + '&filter.in.type=STEP';
                        break;
                    default:
                        break;
                }
                return url + '?page.page=1&page.sort=start_time,ASC'
                    + '&filter.eq.has_childs=false'
                    + statusFilter
                    + positionalFilter + id;
            }
        },
        render: function() {
            var model = this.model.toJSON({computed: true});
            this.$el.html(Util.templates(this.template, {
                type: this.type,
                model: model,
                total: this.getTotalStatistics()
            }));
            this.$container.append(this.$el);
        },
        getTotalStatistics: function(){
            var statistics = this.model.get('statistics');
            return parseInt(statistics['executions'][this.type]);
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    return LaunchStatisticsExecutionsView;
});
