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

    var ProductStatusView = BaseWidgetView.extend({

    });

    ProductStatusView.getConfig = function () {
        return {
            gadget_name: 'Product status',
            img: 'filter_results.png',
            description: 'product status description',
            widget_type: 'product_status', // TODO remove after refactoring
            noFilters: true // TODO remove after refactoring
        };
    };
    ProductStatusView.getSettings = function () {
        var async = $.Deferred();
        async.resolve([
            {
                control: 'inputItems',
                options: {
                    entity: 'filter',
                    label: 'Select filters',
                    minItems: 1,
                    getValue: function (model) {
                        var widgetOptions = model.getWidgetOptions();
                        if (widgetOptions.filters) {
                            return widgetOptions.filters;
                        }
                        return [];
                    },
                    setValue: function (value, model) {
                        var widgetOptions = model.getWidgetOptions();
                        widgetOptions.filters = value;
                        model.setWidgetOptions(widgetOptions);
                    }
                }
            },
            {
                control: 'dropDown',
                options: {
                    label: 'Basic column',
                    items: [
                        { name: 'Status', value: 'status' },
                        { name: 'Total', value: 'total' },
                        { name: 'Passed', value: 'passed' },
                        { name: 'Failed', value: 'failed' },
                        { name: 'Skipped', value: 'skipped' },
                        { name: 'Product Bug', value: 'product_bug' },
                        { name: 'Auto Bug', value: 'auto_bug' },
                        { name: 'System Issue', value: 'system_issue' },
                        { name: 'To Investigate', value: 'to_investigate' },
                        { name: 'Passing Rate', value: 'Passing Rate' }
                    ],
                    multiple: true,
                    getValue: function (model, self) {
                        var widgetOptions = model.getWidgetOptions();
                        if (widgetOptions.basicColumns) {
                            return widgetOptions.basicColumns;
                        }
                        return _.map(self.model.get('items'), function (item) {
                            return item.value;
                        });
                    },
                    setValue: function (value, model) {
                        var widgetOptions = model.getWidgetOptions();
                        widgetOptions.basicColumns = value;
                        model.setWidgetOptions(widgetOptions);
                    }
                }
            },
            {
                control: 'checkbox',
                options: {
                    label: 'Distinct launches'
                }
            },
            {
                control: 'switcher',
                options: {
                    items: [
                            { name: 'All launches', value: 'all' },
                            { name: 'Latest launches', value: 'latest' }
                    ],
                    action: 'switch_latest_mode'
                }
            }
        ]);

        return async.promise();
    };
    return ProductStatusView;
});
