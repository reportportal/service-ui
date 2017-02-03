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

    var Localization = require('localization');
    var Util = require('util');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var App = require('app');
    var appConfig = App.getInstance();

    var config = function(){

        return {
            defaultWidgetImg: 'no_chart.png',
            widgetTypes: {
                'old_line_chart': {
                    gadget_name: Localization.widgets.statisticsLineChart,
                    img: 'trends_chart.png',
                    description: Localization.widgets.statisticsLineChartDescription,
                    widget_type: 'line_chart',
                    gadget: 'old_line_chart',
                    criteria: getExecutionsAndDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            'launch': Localization.widgets.launchMode,
                            'timeline': Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'statistic_trend': {
                    gadget_name: Localization.widgets.statisticsTrendChart,
                    img: 'launch_statistics_trend_chart.png',
                    description: Localization.widgets.statisticsTrendChartDescription,
                    widget_type: 'trends_chart',
                    gadget: 'statistic_trend',
                    criteria: getExecutionsAndDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            'launch': Localization.widgets.launchMode,
                            'timeline': Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }

                },
                'overall_statistics': {
                    gadget_name: Localization.widgets.overallStatisticsPanel,
                    img: 'overall_statistics_panel.png',
                    description: Localization.widgets.overallStatisticsPanelDescription,
                    widget_type: 'statistics_panel',
                    gadget: 'overall_statistics',
                    criteria: getExecutionsAndDefects(),
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'launches_duration_chart': {
                    gadget_name: Localization.widgets.durationChart,
                    img: 'different_launches_comparison.png',
                    description: Localization.widgets.durationChartDescription,
                    widget_type: 'column_chart',
                    gadget: 'launches_duration_chart',
                    noCriteria: true,
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
                'launch_statistics': {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: 'launch_statistics_pie.png',
                    description: Localization.widgets.executionIssueStatisticsDescription,
                    widget_type: 'combine_pie_chart',
                    gadget: 'launch_statistics',
                    noCriteria: true,
                    staticCriteria: getExecutionsAndDefects(),
                    limit: {
                        display: false,
                        min: 1,
                        max: 1,
                        def: 1
                    }
                },
                'last_launch': {
                    gadget_name: Localization.widgets.executionIssueStatistics,
                    img: 'launch_statistics_pie.png',
                    description: Localization.widgets.executionIssueStatisticsDescription,
                    widget_type: 'combine_pie_chart',
                    gadget: 'last_launch',
                    noCriteria: true,
                    notShowOnWizard: true,
                    staticCriteria: getLastLaunchStats(),
                    limit: {
                        display: false,
                        min: 1,
                        max: 1,
                        def: 1
                    }
                },
                'activity_stream': {
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
                        start: {actions: ['start'], text: Localization.forms.startLaunch},
                        finish: {actions: ['finish'], text: Localization.forms.finishLaunch},
                        delete: {actions: ['delete'], text: Localization.forms.deleteLaunch},
                        share: {actions: ['share'], text: Localization.forms.shareWidgetDashboard},
                        unshare: {actions: ['unshare'], text: Localization.forms.unShareWidgetDashboard},
                        post_issue: {actions: ['post_issue', 'attach_issue'], text: Localization.forms.postIssue},
                        create_user: {actions: ['create_user'], text: Localization.forms.createUser},
                        update_bts: {actions: ['create_bts', 'update_bts', 'delete_bts'], text: Localization.forms.updateBts},
                        update_project: {actions: ['update_project'], text: Localization.forms.updateProject},
                        update_defects: {actions: ['update_defect', 'delete_defect'], text: Localization.forms.updateDefects}
                    },
                    usersFilter: true,
                    staticCriteria: {
                        'name': 'name',
                        'userRef': Localization.forms.user,
                        'last_modified': 'Last_modified',
                        'actionType': 'ActionType',
                        'objectType': 'ObjectType',
                        'projectRef': Localization.forms.project,
                        'loggedObjectRef': 'LoggedObjectRef',
                        'history': Localization.forms.history
                    }
                },
                'cases_trend': {
                    gadget_name: Localization.widgets.growthTrendChart,
                    img: 'test-cases-growth-trend-chart.png',
                    description: Localization.widgets.growthTrendChartDescription,
                    widget_type: 'cases_trend_chart',
                    gadget: 'cases_trend',
                    noCriteria: true,
                    staticCriteria: {
                        'statistics$executions$total': Localization.launchesHeaders.total
                    },
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            'launch': Localization.widgets.launchMode,
                            'timeline': Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'investigated_trend': {
                    gadget_name: Localization.widgets.percentageOfLaunches,
                    img: 'to_investigate_trend.png',
                    description: Localization.widgets.percentageOfLaunchesDescription,
                    widget_type: 'column_chart',
                    gadget: 'investigated_trend',
                    noCriteria: true,
                    staticCriteria: getTotalDefects(),
                    mode: {
                        type: 'radio',
                        defaultVal: 'launch',
                        items: {
                            'launch': Localization.widgets.launchMode,
                            'timeline': Localization.widgets.timelineMode
                        }
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'launches_table': {
                    gadget_name: Localization.widgets.launchesTable,
                    img: 'filter_results.png',
                    description: Localization.widgets.launchesTableDescription,
                    widget_type: 'launches_table',
                    gadget: 'launches_table',
                    criteria: getExecutionsDefectsAndTableData(),
                    staticCriteria: {
                        'name': Localization.forms.name,
                        'number': Localization.forms.number,
                        'last_modified': Localization.forms.lastModified,
                        'status': Localization.forms.status
                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'unique_bug_table': {
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
                'most_failed_test_cases': {
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
                    criteria: getFailed()
                },
                'bug_trend': {
                    gadget_name: Localization.widgets.failedTrendChart,
                    img: 'failed-cases-trend-chart.png',
                    description: Localization.widgets.failedTrendChartDescription,
                    widget_type: 'bug_trend',
                    gadget: 'bug_trend',
                    noCriteria: true,
                    staticCriteria: getTotalDefects(),
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'not_passed': {
                    gadget_name: Localization.widgets.nonPassedTrendChart,
                    img: 'non-passed_test-cases_trend.png',
                    description: Localization.widgets.nonPassedTrendChartDescription,
                    widget_type: 'not_passed_chart',
                    gadget: 'not_passed',
                    noCriteria: true,
                    staticCriteria: {
                        'statistics$executions$failed': Localization.launchesHeaders.failed,
                        'statistics$executions$skipped': Localization.launchesHeaders.skipped,
                        'statistics$executions$total': Localization.launchesHeaders.total

                    },
                    limit: {
                        display: true,
                        min: 1,
                        max: 150,
                        def: 50
                    }
                },
                'launches_comparison_chart': {
                    gadget_name: Localization.widgets.comparisonChart,
                    img: 'launches_duration.png',
                    description: Localization.widgets.comparisonChartDescription,
                    widget_type: 'column_chart',
                    gadget: 'launches_comparison_chart',
                    noCriteria: true,
                    staticCriteria: getComparison(),
                    limit: {
                        display: false,
                        min: 2,
                        max: 2,
                        def: 2
                    }
                }
            }
        }

    };

    var getExecutionsDefectsAndTableData = function () {
        var exec = _.map(getExecutions(), function(v, k){
                return {id: k, keys: [k], name: v};
            }),
            defects = getGroupDefects('no_defect');
        return exec.concat(defects, getTableData());
    };

    var getExecutionsAndDefects = function () {
        return _.merge(getExecutions(), getSubDefects());
    };

    var getLastLaunchStats = function(){
        return _.merge(getExecutions(), getDefects());
    };

    var getComparison = function(){
        return _.merge(getExecutions(), getTotalDefects());
    };

    var getExecutions = function () {
        return {
            'statistics$executions$total': Localization.launchesHeaders.total,
            'statistics$executions$passed': Localization.launchesHeaders.passed,
            'statistics$executions$failed': Localization.launchesHeaders.failed,
            'statistics$executions$skipped': Localization.launchesHeaders.skipped
        }
    };

    var getFailed = function () {
        var exec =  {
                'statistics$executions$failed': Localization.launchesHeaders.failed,
                'statistics$executions$skipped': Localization.launchesHeaders.skipped
            },
            defects = getTotalDefects();
        delete defects.statistics$defects$to_investigate$total;
        return _.merge(exec, defects);
    };

    var getDefects = function(){
        return {
            'statistics$defects$product_bug': Localization.launchesHeaders.product_bug,
            'statistics$defects$automation_bug': Localization.launchesHeaders.automation_bug,
            'statistics$defects$system_issue': Localization.launchesHeaders.system_issue,
            'statistics$defects$no_defect': Localization.launchesHeaders.no_defect,
            'statistics$defects$to_investigate': Localization.launchesHeaders.to_investigate
        }
    };

    var getTotalDefects = function(){
        return {
            'statistics$defects$product_bug$total': Localization.launchesHeaders.product_bug,
            'statistics$defects$automation_bug$total': Localization.launchesHeaders.automation_bug,
            'statistics$defects$system_issue$total': Localization.launchesHeaders.system_issue,
            'statistics$defects$no_defect$total': Localization.launchesHeaders.no_defect,
            'statistics$defects$to_investigate$total': Localization.launchesHeaders.to_investigate
        }
    };

    var getGroupDefects = function(exceptionKey){
        var defects = {};
        _.each(getSubDefects(), function(v, k){
            var dd = k.split('$'),
                key = dd[2],
                id = dd[3],
                sd = appConfig.patterns.defectsLocator;
            if(key !== exceptionKey){
                if(defects[key]){
                    defects[key].keys.push(k);
                }
                else {
                    defects[key] = {
                        name: '',
                        id: key,
                        keys: [k]
                    };
                }
                if(sd.test(id)){
                    defects[key].name = v;
                }
            }
        });
        return _.values(defects);
    };

    var getSubDefects = function () {
        var collection = new SingletonDefectTypeCollection(),
            pref = 'statistics$defects$',
            subDefects = {},
            defects = collection.toJSON(),
            issueTypes = Util.getIssueTypes();

        _.each(issueTypes, function(type){
            subDefects[type] = {};
        });
        _.each(defects, function(d){
            var type = d.typeRef.toLowerCase(),
                key = pref + type + '$' + d.locator;
            subDefects[type][key] = d.longName;
        });
        return _.reduce(_.values(subDefects), function(m, n){ return _.extend(m, n);}, {});
    };

    var getTableData = function () {
        return [
            {id: 'tags', keys: ['tags'], name: Localization.forms.tags},
            {id: 'user', keys: ['user'], name: Localization.forms.user},
            {id: 'start_time', keys: ['start_time'], name: Localization.forms.startTime},
            {id: 'end_time', keys: ['end_time'], name: Localization.forms.finishTime},
            {id: 'description', keys: ['description'], name: Localization.forms.description}
        ]
    };

    var instance = null;

    var getInstance = function () {
        if (!instance) {
            instance = config();
        }
        return instance;
    };

    var clear = function () {
        instance = null;
    };

    return {
        getInstance: getInstance,
        updateInstance: function() {
            var async = $.Deferred();
            var collection = new SingletonDefectTypeCollection();
            collection.ready.done(function() {
                clear();
                async.resolve(getInstance());
            });
            return async.promise();
        },
        clear: clear
    };

});
