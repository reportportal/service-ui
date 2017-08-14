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

define(function (require, exports, module) {
    'use strict';

    var LaunchesTableWidget = require('newWidgets/widgets/LaunchesTableWidgetView');
    var MostFailedTestCases = require('newWidgets/widgets/MostFailedTestCasesWidgetView');
    var UniqueBugTable = require('newWidgets/widgets/UniqueBugTableWidgetView');
    var OverallStatisticsWidget = require('newWidgets/widgets/OverallStatisticsWidgetView');
    var ProjectActivityWidget = require('newWidgets/widgets/ProjectActivityWidgetView');
    var LineLaunchStatisticsChart = require('newWidgets/widgets/LineLaunchStatisticsChartView');
    var TrendLaunchStatisticsChart = require('newWidgets/widgets/TrendLaunchStatisticsChartView');
    var InvestigatedTrendChart = require('newWidgets/widgets/InvestigatedTrendChartView');
    var LaunchesComparisonChart = require('newWidgets/widgets/LaunchesComparisonChartView');
    var LaunchesDurationChart = require('newWidgets/widgets/LaunchesDurationChartView');
    var TestCasesGrowthTrendChart = require('newWidgets/widgets/TestCasesGrowthTrendChartView');
    var NotPassedCasesChart = require('newWidgets/widgets/NotPassedCasesChartView');
    var FailedCasesTrendChart = require('newWidgets/widgets/FailedCasesTrendChartView');
    var LaunchStatisticsComboPieChart = require('newWidgets/widgets/LaunchStatisticsComboPieChartView');
    var PassingRateSummaryChart = require('newWidgets/widgets/PassingRateSummaryChartView');
    var PassingRatePerLaunchChart = require('newWidgets/widgets/PassingRatePerLaunchChartView');
    var ProductStatus = require('newWidgets/widgets/ProductStatusView');

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

    var WidgetService = {

        getDefaultConfig: function () {
            return {
                old_line_chart: {
                    gadget_name: Localization.widgets.statisticsLineChart,
                    img: 'trends_chart.png',
                    description: Localization.widgets.statisticsLineChartDescription,
                    widget_type: 'line_chart',
                    gadget: 'old_line_chart',
                    criteria: {}, // this.getExecutionsAndDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            launch: Localization.widgets.launchMode,
                            timeline: Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                statistic_trend: {
                    gadget_name: Localization.widgets.statisticsTrendChart,
                    img: 'launch_statistics_trend_chart.png',
                    description: Localization.widgets.statisticsTrendChartDescription,
                    widget_type: 'trends_chart',
                    gadget: 'statistic_trend',
                    criteria: {}, // this.getExecutionsAndDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            launch: Localization.widgets.launchMode,
                            timeline: Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }

                },
                overall_statistics: {
                    gadget_name: Localization.widgets.overallStatisticsPanel,
                    img: 'overall_statistics_panel.png',
                    description: Localization.widgets.overallStatisticsPanelDescription,
                    widget_type: 'statistics_panel',
                    gadget: 'overall_statistics',
                    criteria: {}, // this.getExecutionsAndDefects(),
                    uiControl: [
                        {
                            control: 'checkbox',
                            options: {
                                label: Localization.widgets.latestLaunches,
                                action: 'latest_launches'
                            }
                        }
                    ],
                    mode: {
                        type: 'radio',
                        defaultVal: 'lineMode',
                        items: {
                            lineMode: Localization.widgets.panelMode,
                            chartMode: Localization.widgets.chartMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                launches_duration_chart: {
                    gadget_name: Localization.widgets.durationChart,
                    img: 'different_launches_comparison.png',
                    description: Localization.widgets.durationChartDescription,
                    widget_type: 'column_chart',
                    gadget: 'launches_duration_chart',
                    noCriteria: true,
                    uiControl: [
                        {
                            control: 'checkbox',
                            options: {
                                label: Localization.widgets.latestLaunches,
                                action: 'latest_launches'
                            }
                        }
                    ],
                    staticCriteria: {
                        start_time: '',
                        end_time: '',
                        name: '',
                        number: '',
                        status: ''
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                launch_statistics: {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: 'launch_statistics_pie.png',
                    description: Localization.widgets.executionIssueStatisticsDescription,
                    widget_type: 'combine_pie_chart',
                    gadget: 'launch_statistics',
                    noCriteria: true,
                    staticCriteria: {}, // this.getExecutionsAndDefects(),
                    limit: {
                        display: false,
                        min: 1,
                        max: 1,
                        def: 1
                    }
                },
                last_launch: {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: 'launch_statistics_pie.png',
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
                },
                activity_stream: {
                    gadget_name: Localization.widgets.projectActivityPanel,
                    img: 'activity_stream.png',
                    description: Localization.widgets.projectActivityPanelDescription,
                    widget_type: 'activity_panel',
                    gadget: 'activity_stream',
                    noCriteria: true,
                    noFilters: true,
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    },
                    actions: {
                        start: { actions: ['start'], text: Localization.forms.startLaunch },
                        finish: { actions: ['finish'], text: Localization.forms.finishLaunch },
                        delete: { actions: ['delete'], text: Localization.forms.deleteLaunch },
                        share: { actions: ['share'], text: Localization.forms.shareWidgetDashboard },
                        unshare: { actions: ['unshare'], text: Localization.forms.unShareWidgetDashboard },
                        post_issue: { actions: ['post_issue', 'attach_issue'], text: Localization.forms.postIssue },
                        create_user: { actions: ['create_user'], text: Localization.forms.createUser },
                        update_bts: {
                            actions: ['create_bts', 'update_bts', 'delete_bts'],
                            text: Localization.forms.updateBts
                        },
                        update_project: { actions: ['update_project'], text: Localization.forms.updateProject },
                        update_defects: {
                            actions: ['update_defect', 'delete_defect'],
                            text: Localization.forms.updateDefects
                        }
                    },
                    usersFilter: true,
                    staticCriteria: {
                        name: 'name',
                        userRef: Localization.forms.user,
                        last_modified: 'Last_modified',
                        actionType: 'ActionType',
                        objectType: 'ObjectType',
                        projectRef: Localization.forms.project,
                        loggedObjectRef: 'LoggedObjectRef',
                        history: Localization.forms.history
                    }
                },
                cases_trend: {
                    gadget_name: Localization.widgets.growthTrendChart,
                    img: 'test-cases-growth-trend-chart.png',
                    description: Localization.widgets.growthTrendChartDescription,
                    widget_type: 'cases_trend_chart',
                    gadget: 'cases_trend',
                    noCriteria: true,
                    staticCriteria: {
                        statistics$executions$total: Localization.launchesHeaders.total
                    },
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            launch: Localization.widgets.launchMode,
                            timeline: Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                investigated_trend: {
                    gadget_name: Localization.widgets.percentageOfLaunches,
                    img: 'to_investigate_trend.png',
                    description: Localization.widgets.percentageOfLaunchesDescription,
                    widget_type: 'column_chart',
                    gadget: 'investigated_trend',
                    noCriteria: true,
                    staticCriteria: {}, // this.getTotalDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            launch: Localization.widgets.launchMode,
                            timeline: Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                launches_table: {
                    gadget_name: Localization.widgets.launchesTable,
                    img: 'filter_results.png',
                    description: Localization.widgets.launchesTableDescription,
                    widget_type: 'launches_table',
                    gadget: 'launches_table',
                    criteria: [], // this.getExecutionsDefectsAndTableData(),
                    staticCriteria: {
                        name: Localization.forms.name,
                        number: Localization.forms.number,
                        last_modified: Localization.forms.lastModified,
                        status: Localization.forms.status
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                unique_bug_table: {
                    gadget_name: Localization.widgets.uniqueBugsTable,
                    img: 'unique_bugs_table.png',
                    description: Localization.widgets.uniqueBugsTableDescription,
                    widget_type: 'table',
                    gadget: 'unique_bug_table',
                    noCriteria: true,
                    limit: {
                        display: true,
                        name: Localization.widgets.maxLaunches,
                        min: 1,
                        max: 150,
                        def: 10
                    }
                },
                most_failed_test_cases: {
                    gadget_name: Localization.widgets.failedTestCasesTable,
                    widget_type: 'table',
                    gadget: 'most_failed_test_cases',
                    img: 'filter_results_failure.png',
                    description: Localization.widgets.failedTestCasesTableDescription,
                    noFilters: true,
                    launchesFilter: true,
                    criteriaSelectType: 'radio',
                    limit: {
                        display: true,
                        name: Localization.widgets.launchesCount,
                        min: 2,
                        max: 150,
                        def: 30
                    },
                    defaultCriteria: ['statistics$executions$failed'],
                    criteria: {} // this.getFailed()
                },
                bug_trend: {
                    gadget_name: Localization.widgets.failedTrendChart,
                    img: 'failed-cases-trend-chart.png',
                    description: Localization.widgets.failedTrendChartDescription,
                    widget_type: 'bug_trend',
                    gadget: 'bug_trend',
                    noCriteria: true,
                    staticCriteria: {}, // this.getTotalDefects(),
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                not_passed: {
                    gadget_name: Localization.widgets.nonPassedTrendChart,
                    img: 'non-passed_test-cases_trend.png',
                    description: Localization.widgets.nonPassedTrendChartDescription,
                    widget_type: 'not_passed_chart',
                    gadget: 'not_passed',
                    noCriteria: true,
                    staticCriteria: {
                        statistics$executions$failed: Localization.launchesHeaders.failed,
                        statistics$executions$skipped: Localization.launchesHeaders.skipped,
                        statistics$executions$total: Localization.launchesHeaders.total

                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                launches_comparison_chart: {
                    gadget_name: Localization.widgets.comparisonChart,
                    img: 'launches_duration.png',
                    description: Localization.widgets.comparisonChartDescription,
                    widget_type: 'column_chart',
                    gadget: 'launches_comparison_chart',
                    noCriteria: true,
                    staticCriteria: {}, // this.getComparison(),
                    limit: {
                        display: false,
                        min: 2,
                        max: 2,
                        def: 2
                    }
                },
                passing_rate_per_launch: {
                    gadget_name: Localization.widgets.passingRatePerLaunchChart,
                    img: 'passing_rate_per_launch.png',
                    description: Localization.widgets.passingRatePerLaunchChartDescription,
                    widget_type: 'bar_chart',
                    gadget: 'passing_rate_per_launch',
                    noCriteria: true,
                    noFilters: true,
                    launchesFilter: true,
                    staticCriteria: {},
                    mode: {
                        type: 'radio',
                        defaultVal: 'barMode',
                        items: {
                            barMode: Localization.widgets.barMode,
                            pieChartMode: Localization.widgets.pieChartMode
                        }
                    },
                    limit: {
                        display: false,
                        min: 30,
                        max: 30,
                        def: 30
                    }
                },
                passing_rate_summary: {
                    gadget_name: Localization.widgets.passingRateSummaryChart,
                    img: 'passing_rate_summary.png',
                    description: Localization.widgets.passingRateSummaryChartDescription,
                    widget_type: 'bar_chart',
                    gadget: 'passing_rate_summary',
                    noCriteria: true,
                    staticCriteria: {
                        statistics$executions$total: Localization.launchesHeaders.total,
                        statistics$executions$passed: Localization.launchesHeaders.passed
                    },
                    mode: {
                        type: 'radio',
                        defaultVal: 'barMode',
                        items: {
                            barMode: Localization.widgets.barMode,
                            pieChartMode: Localization.widgets.pieChartMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                }
                // product_status: {
                //     gadget_name: 'product status',
                //     img: 'passing_rate_summary.png',
                //     description: 'product status description',
                //     gadget: 'product_status',
                //     noFilters: true,
                //     uiControl: [
                //         {
                //             control: 'inputItems',
                //             options: {
                //                 entity: 'filter',
                //                 label: 'Select filters'
                //             }
                //         },
                //         {
                //             control: 'dropDown',
                //             options: {
                //                 label: 'Basic column',
                //                 items: [
                //                     { name: 'Test', value: 'test' },
                //                     { name: 'Test2', value: 'test2' }
                //                 ],
                //                 multiple: true
                //             }
                //         },
                //         {
                //             control: 'checkbox',
                //             options: {
                //                 label: 'Distinct launches'
                //             }
                //         },
                //         {
                //             control: 'checkbox',
                //             options: {
                //                 label: 'Latest launches'
                //             }
                //         }
                //     ]
                // }
            };
        },

        getWidgetConfig: function (gadget) {
            var config = this.getDefaultConfig();
            return config[gadget];
        },
        getFullWidgetConfig: function (gadget) {
            var widget = this.getWidgetConfig(gadget);
            var def = $.Deferred();
            var defectTypes = new SingletonDefectTypeCollection();
            var self = this;
            defectTypes.ready.done(function () {
                switch (gadget) {
                case 'old_line_chart':
                    widget.criteria = self.getExecutionsAndDefects();
                    break;
                case 'statistic_trend':
                    widget.criteria = self.getExecutionsAndDefects();
                    break;
                case 'investigated_trend':
                    widget.staticCriteria = self.getTotalDefects();
                    break;
                case 'launch_statistics':
                    widget.staticCriteria = self.getExecutionsAndDefects();
                    break;
                case 'overall_statistics':
                    widget.criteria = self.getExecutionsAndDefects();
                    break;
                case 'bug_trend':
                    widget.staticCriteria = self.getTotalDefects();
                    break;
                case 'launches_comparison_chart':
                    widget.staticCriteria = self.getComparison();
                    break;
                case 'launches_table':
                    widget.criteria = self.getExecutionsDefectsAndTableData();
                    break;
                case 'most_failed_test_cases':
                    widget.criteria = self.getFailed();
                    break;
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
        getExecutionsAndDefects: function () {
            return _.merge(this.getExecutions(), this.getSubDefects());
        },
        getExecutions: function () {
            return {
                statistics$executions$total: Localization.launchesHeaders.total,
                statistics$executions$passed: Localization.launchesHeaders.passed,
                statistics$executions$failed: Localization.launchesHeaders.failed,
                statistics$executions$skipped: Localization.launchesHeaders.skipped
            };
        },
        getFailed: function () {
            var exec = {
                statistics$executions$failed: Localization.launchesHeaders.failed,
                statistics$executions$skipped: Localization.launchesHeaders.skipped
            };
            var defects = this.getTotalDefects();
            delete defects.statistics$defects$to_investigate$total;
            return _.merge(exec, defects);
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
            return 'no_chart.png';
        },

        getWidgetView: function (gadget) {
            switch (gadget) {
            case 'old_line_chart':
                return LineLaunchStatisticsChart;
            case 'statistic_trend':
                return TrendLaunchStatisticsChart;
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
