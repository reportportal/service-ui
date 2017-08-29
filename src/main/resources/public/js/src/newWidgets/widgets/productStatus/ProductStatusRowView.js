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
    var Epoxy = require('backbone-epoxy');
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var LaunchSuiteDefectsView = require('launches/common/LaunchSuiteDefectsView');
    var Util = require('util');
    var Localization = require('localization');

    var ProductStatusView = Epoxy.View.extend({
        template: 'tpl-product-status-widget-row',
        className: 'product-status-widget-row',
        tagName: 'tr',

        initialize: function (data) {
            this.rendererViews = [];
            this.launchModel = new LaunchSuiteStepItemModel(data.rowData.data);
            this.render(data.cellData);
        },
        render: function (data) {
            this.$el.html(Util.templates(this.template, data));
            if ($('[data-js-cell-product_bug]', this.$el).length) {
                this.rendererViews.push(new LaunchSuiteDefectsView({
                    model: this.launchModel,
                    el: $('[data-js-cell-product_bug]', this.$el),
                    type: 'product_bug'
                }));
            }
            if ($('[data-js-cell-auto_bug]', this.$el).length) {
                this.rendererViews.push(new LaunchSuiteDefectsView({
                    model: this.launchModel,
                    el: $('[data-js-cell-auto_bug]', this.$el),
                    type: 'automation_bug'
                }));
            }
            if ($('[data-js-cell-system_issue]', this.$el).length) {
                this.rendererViews.push(new LaunchSuiteDefectsView({
                    model: this.launchModel,
                    el: $('[data-js-cell-system_issue]', this.$el),
                    type: 'system_issue'
                }));
            }
        },
        getLaunchDataByColumn: function (launchData, columnKey) {
            var answer = {
                type: columnKey
            };
            switch (columnKey) {
                case 'name':
                    answer.text = launchData.data.name;
                    answer.count = '';
                    break;
                case 'status':
                    answer.text = launchData.data.status;
                    answer.count = '';
                    break;
                case 'total':
                    answer.text = launchData.data.statistics.executions.total;
                    answer.count = answer.text;
                    break;
                case 'passed':
                    answer.text = launchData.data.statistics.executions.passed;
                    answer.count = answer.text;
                    break;
                case 'failed':
                    answer.text = launchData.data.statistics.executions.failed;
                    answer.count = answer.text;
                    break;
                case 'skipped':
                    answer.text = launchData.data.statistics.executions.skipped;
                    answer.count = answer.text;
                    break;
                case 'to_investigate':
                    answer.text = launchData.data.statistics.defects.to_investigate.total;
                    answer.count = answer.text;
                    break;
                case 'passing_rate':
                    answer.count = parseInt((launchData.data.statistics.executions.passed / launchData.data.statistics.executions.total) * 100, 10);
                    answer.text = answer.count + '%';
                    break;
                default:
                    answer.text = '';
            }
            return answer;
        },
    });

    return ProductStatusView;
});
