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
    var urls = require('dataUrlResolver');
    var coreService = require('coreService');
    var Moment = require('moment');
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
                    var headerData = self.getHeaderData();
                    self.renderHeader(headerData);
                    self.renderRows(headerData, data);
                    Util.setupBaronScroll($('[data-js-table-container]', self.$el), false, { direction: 'm' });
                });
        },
        updateWidget: function () {
            this.render();
        },
        renderHeader: function (headerData) {
            var columns = [Localization.launchesHeaders.name];
            _.each(headerData, function (item) {
                columns.push(Localization.launchesHeaders[item.text]);
            });
            $('[data-js-table-container]', this.$el).html(Util.templates(this.templateHeader, columns));
        },
        getHeaderData: function () {
            var widgetOptions = this.model.getWidgetOptions();
            var answer = [{
                text: 'name',
                type: 'basic'
            }];
            _.each(widgetOptions.basicColumns, function (text) {
                answer.push({
                    text: text,
                    type: 'basic'
                });
            });
            return answer;
        },
        renderRows: function (headerData, rowsData) {
            console.dir(rowsData);
            var result = [];
            var self = this;
            var preRowsData = [];
            _.each(rowsData, function (rowData) {
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
            });
            preRowsData.push({
                type: 'total',
                data: {}
            });
            _.each(preRowsData, function (data) {
                var view = new ProductStatusRow(headerData, data);
                $('[data-js-table-container]', self.$el).append(view.$el);
                self.renderedRows.push(view);
            });
            // _.each(this.getHeaderData(), function (headerKey, numKey) {
            //     var total = '';
            //     _.each(preRowsData, function (rowData, columnNum) {
            //         var cellData;
            //         if (!result[columnNum]) {
            //             result[columnNum] = {
            //                 rowData: rowData,
            //                 cellData: []
            //             };
            //         }
            //         if (rowData.type === 'filter') {
            //             result[columnNum].cellData = [{
            //                 type: 'filter',
            //                 text: rowData.data.name,
            //                 id: rowData.data.id
            //             }];
            //         } else if (rowData.type === 'total') {
            //             result[columnNum].cellData.push({
            //                 type: headerKey,
            //                 text: total
            //             });
            //         } else {
            //             cellData = self.getLaunchDataByColumn(rowData, headerKey);
            //             total += parseInt(cellData.count, 10);
            //             result[columnNum].cellData.push(cellData);
            //         }
            //     });
            // });
            // _.each(result, function (itemData) {
            //     var view = new ProductStatusRow(itemData);
            //     $('[data-js-table-container]', self.$el).append(view.$el);
            //     self.renderedRows.push(view);
            // });
            console.dir(result);
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
