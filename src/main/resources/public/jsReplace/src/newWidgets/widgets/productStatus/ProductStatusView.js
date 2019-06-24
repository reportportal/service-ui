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
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var ProductStatusService = require('newWidgets/widgets/productStatus/ProductStatusService');
    var ProductStatusRow = require('newWidgets/widgets/productStatus/ProductStatusRowView');
    var Localization = require('localization');

    var ProductStatusView = BaseWidgetView.extend({
        template: 'tpl-product-status-widget',
        templateHeader: 'tpl-product-status-widget-header',
        className: 'product-status-widget',

        afterInitialize: function () {
        },
        afterUpdateSizeClasses: function () {}, // remove resize listener

        render: function () {
            var self = this;
            this.destroyRows();
            this.$el.html(Util.templates(this.template, {}));
            return ProductStatusService.getData(this.model)
                .done(function (data) {
                    $('[data-js-preloader-product-widget]', self.$el).removeClass('show');
                    if (self.checkForEmptyData(data)) {
                        self.addNoAvailableBock();
                    } else {
                        var headerData = self.getHeaderData();
                        self.renderHeader(headerData);
                        self.renderRows(headerData, data);
                        Util.setupBaronScroll($('[data-js-table-container]', self.$el), false, { direction: 'm' });
                    }
                });
        },
        checkForEmptyData: function (data) {
            var answer = true;
            _.each(data, function (item) {
                if (item.launches.length) {
                    answer = false;
                    return false;
                }
                return true;
            });
            return answer;
        },
        updateWidget: function () {
            this.render();
        },
        renderHeader: function (headerData) {
            var columns = [];
            _.each(headerData, function (item) {
                if (item.type === 'basic') {
                    columns.push({
                        text: Localization.launchesHeaders[item.text],
                        type: item.text
                    });
                } else if (item.type === 'custom') {
                    columns.push({
                        text: item.text,
                        type: 'custom'
                    });
                }
            });
            $('[data-js-table-container]', this.$el).html(Util.templates(this.templateHeader, columns));
        },
        getHeaderData: function () {
            var widgetOptions = this.model.getWidgetOptions();
            var answer = [{
                text: 'name',
                type: 'basic'
            }];
            if (widgetOptions.distinctLaunches) {
                answer = [{
                    text: 'filter_name',
                    type: 'basic'
                }];
            }
            _.each(widgetOptions.customColumns, function (objString) {
                try {
                    var obj = JSON.parse(objString);
                    answer.push({
                        text: obj.name,
                        type: 'custom',
                        tag: obj.value
                    });
                } catch (e) {}
            });
            _.each(widgetOptions.basicColumns, function (text) {
                answer.push({
                    text: text,
                    type: 'basic'
                });
            });
            return answer;
        },
        renderRows: function (headerData, rowsData) {
            var widgetOptions = this.model.getWidgetOptions();
            var self = this;
            var preRowsData = [];
            var allLaunches = [];
            _.each(rowsData, function (rowData) {
                if (widgetOptions.distinctLaunches) {
                    if (rowData.launches.length) {
                        preRowsData.push({
                            type: 'distinct_launch',
                            data: self.getTotalLaunch(rowData.filterData, rowData.launches)
                        });
                    }
                } else {
                    preRowsData.push({
                        type: 'filter',
                        data: rowData.filterData
                    });
                    _.each(rowData.launches, function (launch) {
                        preRowsData.push({
                            type: 'launch',
                            data: launch
                        });
                    });
                }
                allLaunches = allLaunches.concat(rowData.launches);
            });
            preRowsData.push({
                type: 'total',
                data: this.getTotalStatistics(allLaunches)
            });
            _.each(preRowsData, function (data) {
                var view = new ProductStatusRow(headerData, data);
                $('[data-js-table-container]', self.$el).append(view.$el);
                self.renderedRows.push(view);
            });
        },
        getTotalStatistics: function (launches) {
            var statisticData = {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                product_bug: 0,
                automation_bug: 0,
                system_issue: 0,
                no_defect: 0,
                to_investigate: 0
            };
            _.each(launches, function (launch) {
                statisticData = {
                    total: statisticData.total +
                        parseInt(launch.statistics.executions.total, 10),
                    passed: statisticData.passed +
                        parseInt(launch.statistics.executions.passed, 10),
                    failed: statisticData.failed +
                        parseInt(launch.statistics.executions.failed, 10),
                    skipped: statisticData.skipped +
                        parseInt(launch.statistics.executions.skipped, 10),
                    product_bug: statisticData.product_bug +
                        parseInt(launch.statistics.defects.product_bug.total, 10),
                    automation_bug: statisticData.automation_bug +
                        parseInt(launch.statistics.defects.automation_bug.total, 10),
                    system_issue: statisticData.system_issue +
                        parseInt(launch.statistics.defects.system_issue.total, 10),
                    no_defect: statisticData.no_defect +
                        parseInt(launch.statistics.defects.no_defect.total, 10),
                    to_investigate: statisticData.to_investigate +
                        parseInt(launch.statistics.defects.to_investigate.total, 10)
                };
            });
            return statisticData;
        },
        getTotalLaunch: function (filterData, launches) {
            var result = {
                id: filterData.id,
                name: filterData.name,
                launchesStatus: [],
                start_time: (launches[0] && launches[0].start_time) || 0,
                end_time: 0,
                status: 'PASSED',
                tags: [],
                approximateDuration: 0,
                statistics: {
                    defects: {
                        product_bug: {},
                        automation_bug: {},
                        no_defect: {},
                        system_issue: {},
                        to_investigate: {}
                    },
                    executions: {
                        failed: 0,
                        passed: 0,
                        skipped: 0,
                        total: 0
                    }
                }
            };
            _.each(launches, function (launch) {
                result.launchesStatus.push(launch.status);
                result.start_time = Math.min(result.start_time, launch.start_time);
                result.end_time = Math.max(result.end_time, launch.end_time);
                if (launch.status === 'FAILED') {
                    result.status = 'FAILED';
                }
                launch.tags && (result.tags = result.tags.concat(launch.tags));
                result.approximateDuration = Math.max(result.approximateDuration, launch.approximateDuration);
                _.each(launch.statistics.defects, function (val, defect) {
                    _.each(val, function (value, key) {
                        var oldValue = result.statistics.defects[defect][key];
                        var newValue = parseInt(value, 10);
                        oldValue && (newValue += oldValue);
                        result.statistics.defects[defect][key] = newValue;
                    });
                });
                _.each(launch.statistics.executions, function (value, execution) {
                    var oldValue = result.statistics.executions[execution];
                    var newValue = parseInt(value, 10);
                    oldValue && (newValue += oldValue);
                    result.statistics.executions[execution] = newValue;
                });
            });
            result.tags = _.uniq(result.tags);
            return result;
        },

        destroyRows: function () {
            !this.renderedRows && (this.renderedRows = []);
            _.each(this.renderedRows, function (view) {
                view.destroy();
            });
            this.renderedRows = [];
        }
    });

    return ProductStatusView;
});
