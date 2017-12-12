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
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var App = require('app');
    var appConfig = App.getInstance();

    var staticCriteria = ['name', 'number', 'last_modified', 'status'];
    var getDynamicCriteriaItems = function () {
        var launchData = {
            tags: Localization.forms.tags,
            user: Localization.forms.user,
            start_time: Localization.forms.startTime,
            end_time: Localization.forms.finishTime,
            description: Localization.forms.description
        };
        var executionsData = {
            statistics$executions$total: Localization.launchesHeaders.total,
            statistics$executions$passed: Localization.launchesHeaders.passed,
            statistics$executions$failed: Localization.launchesHeaders.failed,
            statistics$executions$skipped: Localization.launchesHeaders.skipped
        };
        var totalDefectsData = {
            statistics$defects$product_bug$total: Localization.launchesHeaders.product_bug,
            statistics$defects$automation_bug$total: Localization.launchesHeaders.automation_bug,
            statistics$defects$system_issue$total: Localization.launchesHeaders.system_issue,
            // statistics$defects$no_defect$total: Localization.launchesHeaders.no_defect,
            statistics$defects$to_investigate$total: Localization.launchesHeaders.to_investigate
        };
        var data = _.merge(executionsData, totalDefectsData, launchData);

        return _.map(data, function (key, val) {
            return { name: key, value: val };
        });
    };
    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.launchesTable,
                img: 'launch-table.svg',
                description: Localization.widgets.launchesTableDescription,
                widget_type: 'launches_table', // TODO remove after refactoring,
                hasPreview: false
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
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: getDynamicCriteriaItems(),
                        placeholder: Localization.wizard.criteriaSelectTitle,
                        multiple: true,
                        notEmpty: true,
                        getValue: function (model, self) {
                            var defectLocatorPattern = appConfig.patterns.defectsLocator;
                            var contentFields = model.getContentFields();
                            var result;
                            if (!contentFields.length) {
                                result = _.map(self.model.get('items'), function (item) {
                                    return item.value;
                                });
                            } else {
                                result = [];
                                _.each(contentFields, function (field) {
                                    var splittedDefectField;
                                    if (!~staticCriteria.indexOf(field)) {
                                        if (~field.indexOf('statistics$defects$')) {
                                            splittedDefectField = field.split('$');
                                            if (defectLocatorPattern.test(splittedDefectField[3])) {
                                                splittedDefectField.length = 3;
                                                result.push(splittedDefectField.join('$') + '$total');
                                            }
                                        } else {
                                            result.push(field);
                                        }
                                    }
                                });
                            }
                            return result;
                        },
                        setValue: function (value, model) {
                            var result;
                            var pref = 'statistics$defects$';
                            var typeRef;
                            var key;
                            var type;
                            var defects = [];
                            var executions = [];
                            var launchCriteria = [];
                            var defectsCollection = new SingletonDefectTypeCollection();

                            defectsCollection.ready.done(function () {
                                _.each(value, function (criteria) {
                                    if (~criteria.indexOf('statistics$defects$')) {
                                        typeRef = criteria.split('$')[2].toUpperCase();
                                        _.each(defectsCollection.models, function (defectModel) {
                                            if (defectModel.get('typeRef') === typeRef) {
                                                type = defectModel.get('typeRef').toLowerCase();
                                                key = pref + type + '$' + defectModel.get('locator');
                                                defects.push(key);
                                            }
                                        });
                                    } else if (~criteria.indexOf('statistics$executions$')) {
                                        executions.push(criteria);
                                    } else {
                                        launchCriteria.push(criteria);
                                    }
                                });
                            });

                            result = staticCriteria.concat(defects, launchCriteria, executions);
                            model.setContentFields(result);
                        }
                    }
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.items,
                        min: 1,
                        max: 150,
                        def: 50,
                        numOnly: true,
                        action: 'limit'
                    }
                }
            ]);

            return async.promise();
        }
    };
});
