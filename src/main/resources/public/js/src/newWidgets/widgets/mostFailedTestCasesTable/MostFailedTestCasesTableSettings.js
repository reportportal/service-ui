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

    var getCriteriaItems = function () {
        var executions = {
            statistics$executions$failed: Localization.launchesHeaders.failed,
            statistics$executions$skipped: Localization.launchesHeaders.skipped
        };
        var defects = {
            statistics$defects$product_bug$total: Localization.launchesHeaders.product_bug,
            statistics$defects$automation_bug$total: Localization.launchesHeaders.automation_bug,
            statistics$defects$system_issue$total: Localization.launchesHeaders.system_issue,
            statistics$defects$no_defect$total: Localization.launchesHeaders.no_defect
        };
        return _.map(_.merge(executions, defects), function (key, val) {
            return { name: key, value: val };
        });
    };

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.failedTestCasesTable,
                img: 'most-failure-test-cases-table.svg',
                description: Localization.widgets.failedTestCasesTableDescription,
                widget_type: 'table', // TODO remove after refactoring,
                hasPreview: false
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: getCriteriaItems(),
                        placeholder: Localization.wizard.criteriaSelectTitle,
                        multiple: false,
                        getValue: function (model, self) {
                            var contentFields = model.getContentFields();

                            if (contentFields.length) {
                                return contentFields;
                            }
                            return self.model.get('items')[0].value;
                        },
                        setValue: function (value, model) {
                            Array.isArray(value) ? model.setContentFields(value) : model.setContentFields([value]);
                        }
                    }
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.launchesCount,
                        min: 2,
                        max: 150,
                        def: 30,
                        numOnly: true,
                        action: 'limit'
                    }
                },
                {
                    control: 'inputItems',
                    options: {
                        entity: 'launchName',
                        label: Localization.widgets.typeLaunchName,
                        placeholder: Localization.wizard.enterLaunchName,
                        minItems: 1,
                        maxItems: 1,
                        getValue: function (model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.launchNameFilter) {
                                return widgetOptions.launchNameFilter;
                            }
                            return [];
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            widgetOptions.launchNameFilter = value;
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'static',
                    options: {
                        action: 'metadata_fields',
                        fields: ['name', 'start_time']
                    }
                }
            ]);

            return async.promise();
        }
    };
});
