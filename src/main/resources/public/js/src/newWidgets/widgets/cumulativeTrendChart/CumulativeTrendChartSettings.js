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
    var Localization = require('localization');
    var staticFields = ['statistics$executions$failed', 'statistics$executions$skipped', 'statistics$executions$passed'];
    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.cumulativeTrendChart,
                img: 'cumulative_trend_chart.svg',
                description: Localization.widgets.cumulativeTrendChartDescription,
                widget_type: 'trends_chart', // TODO remove after refactoring
                hasPreview: true
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'filters',
                    options: {}
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.tagPrefix,
                        numOnly: false,
                        max: 126,
                        description: Localization.wizard.tagPrefixDescription,
                        placeholder: Localization.wizard.tagPrefixPlaceholder,
                        action: 'tagPrefix'
                    }
                },
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: [
                            { name: Localization.launchesHeaders.product_bug, value: 'statistics$defects$product_bug$total' },
                            { name: Localization.launchesHeaders.automation_bug, value: 'statistics$defects$automation_bug$total' },
                            { name: Localization.launchesHeaders.system_issue, value: 'statistics$defects$system_issue$total' },
                            { name: Localization.launchesHeaders.no_defect, value: 'statistics$defects$no_defect$total' },
                            { name: Localization.launchesHeaders.to_investigate, value: 'statistics$defects$to_investigate$total' }
                        ],
                        notEmpty: false,
                        placeholder: Localization.wizard.choiceCriteria,
                        multiple: true,
                        getValue: function (model, self) {
                            var result = [];
                            var contentFields = model.getContentFields();
                            if (contentFields.length) {
                                _.each(contentFields, function (field) {
                                    if (!~staticFields.indexOf(field)) {
                                        result.push(field);
                                    }
                                });
                                return result;
                            }
                            return _.map(self.model.get('items'), function (item) {
                                return item.value;
                            });
                        },
                        setValue: function (value, model) {
                            model.setContentFields(staticFields.concat(value));
                        }
                    }
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.items,
                        min: 1,
                        max: 10,
                        def: 10,
                        numOnly: true,
                        action: 'limit'
                    }
                }
            ]);

            return async.promise();
        }
    };
});
