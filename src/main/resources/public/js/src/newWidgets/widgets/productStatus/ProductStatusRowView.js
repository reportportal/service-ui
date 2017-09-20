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
    var ProductStatusLaunchName = require('newWidgets/widgets/productStatus/ProductStatusLaunchNameView');
    var ProductStatusFilterName = require('newWidgets/widgets/productStatus/ProductStatusFilterNameView');
    var ItemStartTimeView = require('launches/common/ItemStartTimeView');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Util = require('util');
    var Localization = require('localization');

    var ProductStatusView = Epoxy.View.extend({
        templateFilter: 'tpl-product-status-widget-row-filter',
        template: 'tpl-product-status-widget-row',
        className: 'product-status-widget-row rp-table-row',
        tagName: 'tr',

        initialize: function (headerData, cellData) {
            this.rendererViews = [];
            this.clickable = true;
            if (cellData.type === 'filter') {
                this.renderFilter(headerData, cellData.data);
            } else if (cellData.type === 'total') {
                this.renderTotal(headerData, cellData.data);
            } else {
                if (cellData.type === 'distinct_launch') {
                    this.clickable = false;
                }
                this.renderLaunch(headerData, cellData.data);
            }
        },
        renderFilter: function (headerData, data) {
            this.$el.html(Util.templates(this.templateFilter, {
                name: data.name,
                colspan: headerData.length
            }));
        },
        renderTotal: function (headerData, data) {
            var renderData = [];
            _.each(headerData, function (column) {
                var answer = {
                    type: column.text,
                    text: ''
                };
                switch (column.text) {
                case 'name':
                    answer.text = Localization.launchesHeaders.total;
                    break;
                case 'filter_name':
                    answer.text = Localization.launchesHeaders.total;
                    break;
                case 'total':
                    answer.text = data.total;
                    break;
                case 'passed':
                    answer.text = data.passed;
                    break;
                case 'failed':
                    answer.text = data.failed;
                    break;
                case 'skipped':
                    answer.text = data.skipped;
                    break;
                case 'product_bug':
                    answer.text = data.product_bug;
                    break;
                case 'auto_bug':
                    answer.text = data.automation_bug;
                    break;
                case 'system_issue':
                    answer.text = data.system_issue;
                    break;
                case 'no_defect':
                    answer.text = data.no_defect;
                    break;
                case 'to_investigate':
                    answer.text = data.to_investigate;
                    break;
                case 'passing_rate':
                    var count = 100;
                    answer.text = '';
                    if (parseInt(data.total, 10) !== 0) {
                        count = parseInt((data.passed / data.total) * 100, 10);
                        answer.text = count + '%';
                    }
                    if (count < 100) {
                        answer.text = '<span class="less-100">' + answer.text + '</span>';
                    }
                    break;
                default:
                    answer.text = '';
                }
                renderData.push(answer);
            });
            this.$el.html(Util.templates(this.template, renderData));
        },
        allCasesUrl: function (type) {
            var url = this.launchModel.get('url');
            var statusFilter = '';

            switch (type) {
            case 'total':
                statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                break;
            case 'passed':
            case 'failed':
            case 'skipped':
                statusFilter = '&filter.in.status=' + type.toUpperCase() + '&filter.in.type=STEP';
                break;
            default:
                break;
            }
            return url + '?filter.eq.has_childs=false' + statusFilter;
        },
        renderLaunch: function (headerData, data) {
            var self = this;
            var afterFuncs = [];
            var renderData = [];
            this.launchModel = new LaunchSuiteStepItemModel(data);
            _.each(headerData, function (column) {
                renderData.push(self.getLaunchDataByColumn(data, column, afterFuncs));
            });
            this.$el.html(Util.templates(this.template, renderData));
            _.each(afterFuncs, function (func) {
                func.call(self);
            });
        },
        getLaunchDataByColumn: function (launchData, column, afterFuncs) {
            var columnKey = column.text;
            var self = this;
            var answer = {
                type: columnKey,
                text: ''
            };
            if (column.type === 'basic') {
                switch (columnKey) {
                case 'name':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new ProductStatusLaunchName({
                            model: this.launchModel,
                            el: $('[data-js-cell-name]', this.$el)
                        }));
                    });
                    break;
                case 'filter_name':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new ProductStatusFilterName({
                            model: this.launchModel,
                            el: $('[data-js-cell-filter_name]', this.$el)
                        }));
                    });
                    break;
                case 'start_time':
                    answer.text = '';
                    afterFuncs.push(function () {
                        var view = new ItemStartTimeView({
                            model: this.launchModel
                        });
                        this.rendererViews.push(view);
                        $('[data-js-cell-start_time]', this.$el).html(view.$el);
                    });
                    break;
                case 'status':
                    answer.text = launchData.status;
                    break;
                case 'total':
                    if (this.clickable) {
                        answer.text = '<a href="' + self.allCasesUrl('total') + '">' +
                            launchData.statistics.executions.total + '</a>';
                    } else {
                        answer.text = launchData.statistics.executions.total;
                    }
                    break;
                case 'passed':
                    if (this.clickable) {
                        answer.text = '<a href="' + self.allCasesUrl('passed') + '">' +
                        launchData.statistics.executions.passed + '</a>';
                    } else {
                        answer.text = launchData.statistics.executions.passed;
                    }
                    break;
                case 'failed':
                    if (this.clickable) {
                        answer.text = '<a href="' + self.allCasesUrl('failed') + '">' +
                        launchData.statistics.executions.failed + '</a>';
                    } else {
                        answer.text = launchData.statistics.executions.failed;
                    }
                    break;
                case 'skipped':
                    if (this.clickable) {
                        answer.text = '<a href="' + self.allCasesUrl('skipped') + '">' +
                        launchData.statistics.executions.skipped + '</a>';
                    } else {
                        answer.text = launchData.statistics.executions.skipped;
                    }
                    break;
                case 'product_bug':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new LaunchSuiteDefectsView({
                            model: this.launchModel,
                            el: $('[data-js-cell-product_bug]', this.$el),
                            type: 'product_bug',
                            clickable: this.clickable
                        }));
                    });
                    break;
                case 'auto_bug':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new LaunchSuiteDefectsView({
                            model: this.launchModel,
                            el: $('[data-js-cell-auto_bug]', this.$el),
                            type: 'automation_bug',
                            clickable: this.clickable
                        }));
                    });
                    break;
                case 'system_issue':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new LaunchSuiteDefectsView({
                            model: this.launchModel,
                            el: $('[data-js-cell-system_issue]', this.$el),
                            type: 'system_issue',
                            clickable: this.clickable
                        }));
                    });
                    break;
                case 'no_defect':
                    answer.text = '';
                    afterFuncs.push(function () {
                        this.rendererViews.push(new LaunchSuiteDefectsView({
                            model: this.launchModel,
                            el: $('[data-js-cell-no_defect]', this.$el),
                            type: 'no_defect',
                            clickable: this.clickable
                        }));
                    });
                    break;
                case 'to_investigate':
                    if (this.clickable) {
                        answer.text = '<a><span>' + launchData.statistics.defects.to_investigate.total + '</span></a>';
                        afterFuncs.push(function () {
                            var defectCollection = new SingletonDefectTypeCollection();
                            var toInvest;
                            defectCollection.ready.done(function () {
                                var investigateFilter = '';
                                if (launchData.statistics.defects.to_investigate.total) {
                                    toInvest = defectCollection.findWhere({ typeRef: 'TO_INVESTIGATE' });
                                    if (toInvest) {
                                        investigateFilter = 'filter.eq.has_childs=false&filter.in.issue$issue_type=' + toInvest.get('locator');
                                        $('[data-js-cell-to_investigate] a', self.$el).attr({
                                            href: self.launchModel.get('url') + '?' + investigateFilter
                                        });
                                    }
                                }
                            });
                        });
                    } else {
                        answer.text = '<span>' + launchData.statistics.defects.to_investigate.total + '</span>';
                    }
                    break;
                case 'passing_rate':
                    var count = 100;
                    answer.text = '';
                    if (parseInt(launchData.statistics.executions.total, 10) !== 0) {
                        count = parseInt((launchData.statistics.executions.passed / launchData.statistics.executions.total) * 100, 10);
                        answer.text = count + '%';
                    }
                    if (count < 100) {
                        answer.text = '<span class="less-100">' + answer.text + '</span>';
                    }
                    break;
                default:
                    answer.text = '';
                }
            } else if (column.type === 'custom') {
                var values = [];
                _.each(launchData.tags, function (tag) {
                    if (tag.indexOf(column.tag) === 0) {
                        values.push(tag.replace(column.tag, ''));
                    }
                });
                answer.text = values.join(', ');
            }

            return answer;
        }
    });

    return ProductStatusView;
});
