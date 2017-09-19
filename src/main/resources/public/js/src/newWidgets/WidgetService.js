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

    var LaunchStatisticsLineChart = require('newWidgets/widgets/launchStatisticsLineChart/index');
    var LaunchStatisticsTrendChart = require('newWidgets/widgets/launchStatisticsTrendChart/index');
    var OverallStatisticsWidget = require('newWidgets/widgets/overallStatistics/index');
    var LaunchesDurationChart = require('newWidgets/widgets/launchesDurationChart/index');
    var LaunchStatisticsComboPieChart = require('newWidgets/widgets/launchExecutionAndIssueStatistics/index');
    var ProjectActivityWidget = require('newWidgets/widgets/projectActivity/index');
    var TestCasesGrowthTrendChart = require('newWidgets/widgets/testCasesGrowthTrendChart/index');

    var LaunchesTableWidget = require('newWidgets/widgets/LaunchesTableWidgetView');
    var MostFailedTestCases = require('newWidgets/widgets/MostFailedTestCasesWidgetView');
    var UniqueBugTable = require('newWidgets/widgets/UniqueBugTableWidgetView');
    var InvestigatedTrendChart = require('newWidgets/widgets/InvestigatedTrendChartView');
    var LaunchesComparisonChart = require('newWidgets/widgets/LaunchesComparisonChartView');
    var NotPassedCasesChart = require('newWidgets/widgets/NotPassedCasesChartView');
    var FailedCasesTrendChart = require('newWidgets/widgets/FailedCasesTrendChartView');
    var PassingRateSummaryChart = require('newWidgets/widgets/PassingRateSummaryChartView');
    var PassingRatePerLaunchChart = require('newWidgets/widgets/PassingRatePerLaunchChartView');
    var ProductStatus = require('newWidgets/widgets/productStatus/index');
    var CumulativeTrendChart = require('newWidgets/widgets/cumulativeTrendChart/index');

    var LastLaunchPieChart = require('newWidgets/widgets/LastLaunchPieChartView');
    var PercentageOfInvestigationChart = require('newWidgets/widgets/PercentageOfInvestigationChartView');
    var PercentageOfProductBugsChart = require('newWidgets/widgets/PercentageOfProductBugsChartView');
    var PercentageOfAutoBugsChart = require('newWidgets/widgets/PercentageOfAutoBugsChartView');
    var PercentageOfSystemIssuesChart = require('newWidgets/widgets/PercentageOfSystemIssuesChartView');
    var LaunchesQuantityChart = require('newWidgets/widgets/LaunchesQuantityChartView');
    var IssuesTrendChart = require('newWidgets/widgets/IssuesTrendChartView');
    var IssuesLineChart = require('newWidgets/widgets/IssuesLineChartView');

    var $ = require('jquery');
    var _ = require('underscore');
    var Localization = require('localization');
    var Util = require('util');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var App = require('app');

    var appConfig = App.getInstance();

    /* uiControls: [
        {
             control: 'checkbox',
             options: {
                label: 'Select filters' // label after checkbox
                action: '' // default actions: 'latest_launches', ...
                setValue(value, model) {}, // if you want to override method
                getValue(model) {} // if you want to override method
            }
        },
    ]*/
    var WIDGETS = {
        old_line_chart: LaunchStatisticsLineChart,
        statistic_trend: LaunchStatisticsTrendChart,
        overall_statistics: OverallStatisticsWidget,
        launches_duration_chart: LaunchesDurationChart,
        launch_statistics: LaunchStatisticsComboPieChart,
        activity_stream: ProjectActivityWidget,
        cases_trend: TestCasesGrowthTrendChart,

        product_status: ProductStatus,
        cumulative: CumulativeTrendChart
    };

    var WidgetService = {
        getAllWidgetsConfig: function () {
            var config = {
                investigated_trend: {
                    gadget_name: Localization.widgets.percentageOfLaunches,
                    img: 'investigated-percentage-of-launches.svg',
                    description: Localization.widgets.percentageOfLaunchesDescription,
                    widget_type: 'column_chart',
                    gadget: 'investigated_trend',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
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
                        },
                        {
                            control: 'switcher',
                            options: {
                                items: [
                                    { name: Localization.widgets.launchMode, value: 'launch' },
                                    { name: Localization.widgets.timelineMode, value: 'timeline' }
                                ],
                                action: 'switch_timeline_mode'
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'criteria',
                                fields: function () {
                                    return _.keys(this.getTotalDefects());
                                }.bind(this)
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                launches_table: {
                    gadget_name: Localization.widgets.launchesTable,
                    img: 'launch-table.svg',
                    description: Localization.widgets.launchesTableDescription,
                    widget_type: 'launches_table',
                    gadget: 'launches_table',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
                        },
                        {
                            control: 'dropDown',
                            options: {
                                label: Localization.widgets.widgetCriteria,
                                items: this.getLaunchesTableWidgetData(),
                                placeholder: Localization.wizard.criteriaSelectTitle,
                                multiple: true,
                                notEmpty: false,
                                getValue: function (model, self) {
                                    var staticCriteria = ['name', 'number', 'last_modified', 'status'];
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
                                    var staticCriteria = ['name', 'number', 'last_modified', 'status'];
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
                    ]
                },
                unique_bug_table: {
                    gadget_name: Localization.widgets.uniqueBugsTable,
                    img: 'unique-bugs-table.svg',
                    description: Localization.widgets.uniqueBugsTableDescription,
                    widget_type: 'table',
                    gadget: 'unique_bug_table',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
                        },
                        {
                            control: 'input',
                            options: {
                                name: Localization.widgets.maxLaunches,
                                min: 1,
                                max: 150,
                                def: 10,
                                numOnly: true,
                                action: 'limit'
                            }
                        }
                    ]
                },
                most_failed_test_cases: {
                    gadget_name: Localization.widgets.failedTestCasesTable,
                    widget_type: 'table',
                    gadget: 'most_failed_test_cases',
                    img: 'most-failure-test-cases-table.svg',
                    description: Localization.widgets.failedTestCasesTableDescription,
                    uiControl: [
                        {
                            control: 'dropDown',
                            options: {
                                label: Localization.widgets.widgetCriteria,
                                items: this.getFailed(true),
                                placeholder: Localization.wizard.criteriaSelectTitle,
                                multiple: false,
                                getValue: function (model, self) {
                                    var contentFields = model.getContentFields();

                                    if (contentFields.length) {
                                        return contentFields;
                                    }
                                    return [self.model.get('items')[0].value];
                                },
                                setValue: function (value, model) {
                                    model.setContentFields(value);
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
                    ]
                },
                bug_trend: {
                    gadget_name: Localization.widgets.failedTrendChart,
                    img: 'failed-cases-trend-chart.svg',
                    description: Localization.widgets.failedTrendChartDescription,
                    widget_type: 'bug_trend',
                    gadget: 'bug_trend',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
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
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'criteria',
                                fields: function () {
                                    return _.keys(this.getTotalDefects());
                                }.bind(this)
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                not_passed: {
                    gadget_name: Localization.widgets.nonPassedTrendChart,
                    img: 'non-passed-test-cases-trend.svg',
                    description: Localization.widgets.nonPassedTrendChartDescription,
                    widget_type: 'not_passed_chart',
                    gadget: 'not_passed',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
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
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'criteria',
                                fields: ['statistics$executions$failed', 'statistics$executions$skipped', 'statistics$executions$total']
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                launches_comparison_chart: {
                    gadget_name: Localization.widgets.comparisonChart,
                    img: 'different-launches-comparison-chart.svg',
                    description: Localization.widgets.comparisonChartDescription,
                    widget_type: 'column_chart',
                    gadget: 'launches_comparison_chart',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'criteria',
                                fields: function () {
                                    return _.keys(this.getComparison());
                                }.bind(this)
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'limit',
                                value: 2
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                passing_rate_per_launch: {
                    gadget_name: Localization.widgets.passingRatePerLaunchChart,
                    img: 'passing-rate-launch.svg',
                    description: Localization.widgets.passingRatePerLaunchChartDescription,
                    widget_type: 'bar_chart',
                    gadget: 'passing_rate_per_launch',
                    uiControl: [
                        {
                            control: 'inputItems',
                            options: {
                                entity: 'launchName',
                                label: Localization.widgets.typeLaunchName,
                                placeholder: Localization.widgets.selectLaunch,
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
                            control: 'switcher',
                            options: {
                                items: [
                                    { name: Localization.widgets.barMode, value: 'barMode' },
                                    { name: Localization.widgets.pieChartMode, value: 'pieChartMode' }
                                ],
                                action: 'switch_view_mode'
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'limit',
                                value: 30
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                passing_rate_summary: {
                    gadget_name: Localization.widgets.passingRateSummaryChart,
                    img: 'passing-rate-summery.svg',
                    description: Localization.widgets.passingRateSummaryChartDescription,
                    widget_type: 'bar_chart',
                    gadget: 'passing_rate_summary',
                    uiControl: [
                        {
                            control: 'filters',
                            options: {}
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
                        },
                        {
                            control: 'switcher',
                            options: {
                                items: [
                                    { name: Localization.widgets.barMode, value: 'barMode' },
                                    { name: Localization.widgets.pieChartMode, value: 'pieChartMode' }
                                ],
                                action: 'switch_view_mode'
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'criteria',
                                fields: ['statistics$executions$total', 'statistics$executions$passed']
                            }
                        },
                        {
                            control: 'static',
                            options: {
                                action: 'metadata_fields',
                                fields: ['name', 'number', 'start_time']
                            }
                        }
                    ]
                },
                // ------------------ STATUS PAGE WIDGETS ------------------
                last_launch: {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: '',
                    description: Localization.widgets.executionIssueStatisticsDescription,
                    widget_type: 'combine_pie_chart',
                    gadget: 'last_launch',
                    noCriteria: true,
                    notShowOnWizard: true,
                    staticCriteria: {}, // this.getLastLaunchStats(),
                    limit: {
                        display: false,
                        min: 1,
                        max: 1,
                        def: 1
                    }
                }
            };
            _.each(WIDGETS, function (widget, key) {
                var conf = widget.getConfig();
                conf.gadget = key;
                config[key] = conf;
            });
            return config;
        },
        getSettingsGadget: function (gadget) {
            var async = $.Deferred();
            if (WIDGETS[gadget]) {
                WIDGETS[gadget].getSettings().done(function (data) {
                    async.resolve({
                        newWidget: true,
                        uiControl: data
                    });
                });
                return async;
            }
            return this.getFullWidgetConfig(gadget);
        },

        getWidgetConfig: function (gadget) {
            var configs = this.getAllWidgetsConfig();
            return configs[gadget];
        },
        getFullWidgetConfig: function (gadget) {
            var widget = this.getWidgetConfig(gadget);
            var def = $.Deferred();
            var defectTypes = new SingletonDefectTypeCollection();
            var self = this;
            defectTypes.ready.done(function () {
                switch (gadget) {
                case 'last_launch':
                    widget.staticCriteria = self.getLastLaunchStats();
                    break;
                default :
                    break;
                }
                def.resolve(widget);
            });
            return def;
        },
        getExecutionsAndDefects: function (isFormatForControl) {
            var result;
            if (!isFormatForControl) {
                result = _.merge(this.getExecutions(), this.getSubDefects());
            } else {
                result = _.map(_.merge(this.getExecutions(), this.getSubDefects()), function (key, val) {
                    return { name: key, value: val };
                });
            }
            return result;
        },
        getExecutions: function () {
            return {
                statistics$executions$total: Localization.launchesHeaders.total,
                statistics$executions$passed: Localization.launchesHeaders.passed,
                statistics$executions$failed: Localization.launchesHeaders.failed,
                statistics$executions$skipped: Localization.launchesHeaders.skipped
            };
        },
        getFailed: function (isFormatForControl) {
            var result;
            var exec = {
                statistics$executions$failed: Localization.launchesHeaders.failed,
                statistics$executions$skipped: Localization.launchesHeaders.skipped
            };
            var defects = this.getTotalDefects();
            delete defects.statistics$defects$to_investigate$total;
            if (!isFormatForControl) {
                result = _.merge(exec, defects);
            } else {
                result = _.map(_.merge(exec, defects), function (key, val) {
                    return { name: key, value: val };
                });
            }
            return result;
        },
        getDefects: function () {
            return {
                statistics$defects$product_bug: Localization.launchesHeaders.product_bug,
                statistics$defects$automation_bug: Localization.launchesHeaders.automation_bug,
                statistics$defects$system_issue: Localization.launchesHeaders.system_issue,
                statistics$defects$no_defect: Localization.launchesHeaders.no_defect,
                statistics$defects$to_investigate: Localization.launchesHeaders.to_investigate
            };
        },
        getTotalDefects: function () {
            return {
                statistics$defects$product_bug$total: Localization.launchesHeaders.product_bug,
                statistics$defects$automation_bug$total: Localization.launchesHeaders.automation_bug,
                statistics$defects$system_issue$total: Localization.launchesHeaders.system_issue,
                statistics$defects$no_defect$total: Localization.launchesHeaders.no_defect,
                statistics$defects$to_investigate$total: Localization.launchesHeaders.to_investigate
            };
        },
        getLastLaunchStats: function () {
            return _.merge(this.getExecutions(), this.getDefects());
        },
        getComparison: function () {
            return _.merge(this.getExecutions(), this.getTotalDefects());
        },
        getDefaultTableData: function () {
            return [
                { id: 'tags', keys: ['tags'], name: Localization.forms.tags },
                { id: 'user', keys: ['user'], name: Localization.forms.user },
                { id: 'start_time', keys: ['start_time'], name: Localization.forms.startTime },
                { id: 'end_time', keys: ['end_time'], name: Localization.forms.finishTime },
                { id: 'description', keys: ['description'], name: Localization.forms.description }
            ];
        },
        getLaunchesTableWidgetData: function () {
            var launchData = {
                tags: Localization.forms.tags,
                user: Localization.forms.user,
                start_time: Localization.forms.startTime,
                end_time: Localization.forms.finishTime,
                description: Localization.forms.description
            };
            var data = _.merge(this.getExecutions(), this.getTotalDefects(), launchData);

            return _.map(data, function (key, val) {
                return { name: key, value: val };
            });
        },
        getGroupDefects: function (exceptionKeys) {
            var defects = {};
            _.each(this.getSubDefects(), function (v, k) {
                var dd = k.split('$');
                var key = dd[2];
                var id = dd[3];
                var sd = appConfig.patterns.defectsLocator;
                if (!exceptionKeys || !_.find(exceptionKeys, key)) {
                    if (defects[key]) {
                        defects[key].keys.push(k);
                    } else {
                        defects[key] = {
                            name: '',
                            id: key,
                            keys: [k]
                        };
                    }
                    if (sd.test(id)) {
                        defects[key].name = v;
                    }
                }
            });
            return _.values(defects);
        },
        getSubDefects: function () {
            var collection = new SingletonDefectTypeCollection();
            var pref = 'statistics$defects$';
            var subDefects = {};
            var defects = collection.toJSON();
            var issueTypes = Util.getIssueTypes();

            _.each(issueTypes, function (type) {
                subDefects[type] = {};
            });
            _.each(defects, function (d) {
                var type = d.typeRef.toLowerCase();
                var key = pref + type + '$' + d.locator;
                subDefects[type][key] = d.longName;
            });
            return _.reduce(_.values(subDefects), function (m, n) {
                return _.extend(m, n);
            }, {});
        },
        getExecutionsDefectsAndTableData: function () {
            var exec = _.map(this.getExecutions(), function (v, k) {
                return { id: k, keys: [k], name: v };
            });
            var defects = this.getGroupDefects(['no_defect']);
            return exec.concat(defects, this.getDefaultTableData());
        },
        getDefaultWidgetImg: function () {
            return 'undefined.svg';
        },

        getWidgetView: function (gadget) {
            switch (gadget) {
            case 'old_line_chart':
                return LaunchStatisticsLineChart;
            case 'statistic_trend':
                return LaunchStatisticsTrendChart;
            case 'investigated_trend':
                return InvestigatedTrendChart;
            case 'launch_statistics':
                return LaunchStatisticsComboPieChart;
            case 'overall_statistics':
                return OverallStatisticsWidget;
            case 'not_passed':
                return NotPassedCasesChart;
            case 'cases_trend':
                return TestCasesGrowthTrendChart;
            case 'unique_bug_table':
                return UniqueBugTable;
            case 'bug_trend':
                return FailedCasesTrendChart;
            case 'activity_stream':
                return ProjectActivityWidget;
            case 'launches_comparison_chart':
                return LaunchesComparisonChart;
            case 'launches_duration_chart':
                return LaunchesDurationChart;
            case 'launches_table':
                return LaunchesTableWidget;
            case 'most_failed_test_cases':
                return MostFailedTestCases;
            case 'passing_rate_per_launch':
                return PassingRatePerLaunchChart;
            case 'passing_rate_summary':
                return PassingRateSummaryChart;
            case 'product_status':
                return ProductStatus;
            case 'cumulative':
                return CumulativeTrendChart;

                // status page widgets
            case 'activities':
                return ProjectActivityWidget;
            case 'last_launch':
                return LastLaunchPieChart;
            case 'investigated':
                return PercentageOfInvestigationChart;
            case 'bugs_percentage':
                return PercentageOfProductBugsChart;
            case 'auto_bugs_percentage':
                return PercentageOfAutoBugsChart;
            case 'system_issues_percentage':
                return PercentageOfSystemIssuesChart;
            case 'launches_quantity':
                return LaunchesQuantityChart;
            case 'issues_chart_trend':
            case 'issues_chart':
                return IssuesTrendChart;
            case 'issues_chart_line':
                return IssuesLineChart;
            default:
                return null;
            }
        }
    };

    return WidgetService;
});
