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

    var LaunchStatisticsChart = require('newWidgets/widgets/launchStatisticsChart/index');
    var OverallStatisticsWidget = require('newWidgets/widgets/overallStatistics/index');
    var LaunchesDurationChart = require('newWidgets/widgets/launchesDurationChart/index');
    var LaunchStatisticsComboPieChart = require('newWidgets/widgets/launchExecutionAndIssueStatistics/index');
    var ProjectActivityWidget = require('newWidgets/widgets/projectActivity/index');
    var TestCasesGrowthTrendChart = require('newWidgets/widgets/testCasesGrowthTrendChart/index');
    var InvestigatedTrendChart = require('newWidgets/widgets/investigatedTrendChart/index');
    var LaunchesTableWidget = require('newWidgets/widgets/launchesTable/index');
    var UniqueBugsTable = require('newWidgets/widgets/uniqueBugsTable/index');
    var MostFailedTestCasesTable = require('newWidgets/widgets/mostFailedTestCasesTable/index');
    var FailedCasesTrendChart = require('newWidgets/widgets/failedCasesTrendChart/index');
    var NotPassedCasesChart = require('newWidgets/widgets/notPassedTestCasesTrendChart/index');
    var LaunchesComparisonChart = require('newWidgets/widgets/launchesComparison/index');
    var PassingRatePerLaunchChart = require('newWidgets/widgets/passingRatePerLaunch/index');
    var PassingRateSummaryChart = require('newWidgets/widgets/passingRateSummary/index');
    var ProductStatus = require('newWidgets/widgets/productStatus/index');
    var CumulativeTrendChart = require('newWidgets/widgets/cumulativeTrendChart/index');
    var FlakyTestCasesTable = require('newWidgets/widgets/flakyTestCasesTable/index');
    var MostTimeConsumingTestCases = require('newWidgets/widgets/mostTimeConsumingTestCases/index');

    // ------------------ PROJECT INFO PAGE WIDGETS ------------------
    var LastLaunchPieChart = require('newWidgets/widgets/projectInfoWidgets/LastLaunchPieChartView');
    var PercentageOfInvestigationChart = require('newWidgets/widgets/projectInfoWidgets/PercentageOfInvestigationChartView');
    var PercentageOfProductBugsChart = require('newWidgets/widgets/projectInfoWidgets/PercentageOfProductBugsChartView');
    var PercentageOfAutoBugsChart = require('newWidgets/widgets/projectInfoWidgets/PercentageOfAutomationBugsChartView');
    var PercentageOfSystemIssuesChart = require('newWidgets/widgets/projectInfoWidgets/PercentageOfSystemIssuesChartView');
    var LaunchesQuantityChart = require('newWidgets/widgets/projectInfoWidgets/LaunchesQuantityChartView');
    var LaunchStatisticsBarChartView = require('newWidgets/widgets/projectInfoWidgets/LaunchStatisticsBarChartView');

    var WIDGETS = {
        statistic_trend: LaunchStatisticsChart,
        overall_statistics: OverallStatisticsWidget,
        launches_duration_chart: LaunchesDurationChart,
        launch_statistics: LaunchStatisticsComboPieChart,
        activity_stream: ProjectActivityWidget,
        cases_trend: TestCasesGrowthTrendChart,
        investigated_trend: InvestigatedTrendChart,
        launches_table: LaunchesTableWidget,
        unique_bug_table: UniqueBugsTable,
        most_failed_test_cases: MostFailedTestCasesTable,
        bug_trend: FailedCasesTrendChart,
        not_passed: NotPassedCasesChart,
        launches_comparison_chart: LaunchesComparisonChart,
        passing_rate_per_launch: PassingRatePerLaunchChart,
        passing_rate_summary: PassingRateSummaryChart,
        // product_status: ProductStatus,
        // cumulative: CumulativeTrendChart,
        //most_time_consuming: MostTimeConsumingTestCases,
        flaky_test_cases: FlakyTestCasesTable
    };

    var WidgetService = {
        getAllWidgetsConfig: function () {
            var config = {
                // ------------------ STATUS PAGE WIDGETS ------------------
                last_launch: {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: '',
                    description: Localization.widgets.executionIssueStatisticsDescription,
                    widget_type: 'combine_pie_chart',
                    gadget: 'last_launch',
                    noCriteria: true,
                    notShowOnWizard: true,
                    staticCriteria: {},
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
            defectTypes.ready.done(function () {
                switch (gadget) {
                case 'last_launch':
                    widget.staticCriteria = {
                        statistics$executions$total: Localization.launchesHeaders.total,
                        statistics$executions$passed: Localization.launchesHeaders.passed,
                        statistics$executions$failed: Localization.launchesHeaders.failed,
                        statistics$executions$skipped: Localization.launchesHeaders.skipped,
                        statistics$defects$product_bug: Localization.launchesHeaders.product_bug,
                        statistics$defects$automation_bug: Localization.launchesHeaders.automation_bug,
                        statistics$defects$system_issue: Localization.launchesHeaders.system_issue,
                        statistics$defects$no_defect: Localization.launchesHeaders.no_defect,
                        statistics$defects$to_investigate: Localization.launchesHeaders.to_investigate
                    };
                    break;
                default :
                    break;
                }
                def.resolve(widget);
            });
            return def;
        },
        getDefaultWidgetImg: function () {
            return 'undefined.svg';
        },
        getWidgetView: function (gadget) {
            if (WIDGETS[gadget]) {
                return WIDGETS[gadget];
            }
            switch (gadget) {
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
                return LaunchStatisticsBarChartView;
            default:
                return null;
            }
        }
    };

    return WidgetService;
});
