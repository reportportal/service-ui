/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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

    var _ = require('underscore');
    var text = require('localization');

    var config = function () {
        return {
            secureContext: false,
            projectsDropDownVisible: 8,
            dynamicDropDownVisible: 10,
            objectsOnFavorites: 50,
            objectsOnPage: 50,
            objectsOnPageLogs: 250,
            userInputDelay: 500,
            userFilterDelay: 500,
            scrollTrackerDelay: 100,
            scrollTrackerTrashHold: 250,
            objectsOnUsers: 50,
            membersAtATime: 20,
            defaultProject: null,
            apiVersion: '../api/v1/',
            userUrl: '../api/v1/user/',
            user: null,
            fullUser: null,
            loginView: null,
            router: null,
            deletingLaunches: [],
            cacheDelays: {
                getMembers: 5*60*1000,
                getAssignableMembers: 5*60*1000
            },

            projectUrl: '/api/v1/project/',
            certificateUrl: 'certificate/reportportal-client-v2.jks',
            project: {},
            projectId: null,
            defaultProjectsSettings: {
                listView: 'tpl-admin-projects-tile-view',
                sorting: 'creationDate',
                sortingDirection: 'desc',
                search: ''
            },
            currentProjectsSettings: {
                listView: '',
                sorting: '',
                sortingDirection: '',
                search: ''
            },
            projectRoles: ['CUSTOMER', 'MEMBER', 'LEAD', 'PROJECT_MANAGER'],
            defaultProjectRole: 'MEMBER',
            projectRolesEnum: {
                customer: 'CUSTOMER',
                member: 'MEMBER',
                lead: 'LEAD',
                project_manager: 'PROJECT_MANAGER'
            },
            accountRoles: ['USER', 'ADMINISTRATOR'],
            defaultAccountRole: 'USER',
            accountRolesEnum: {user: 'USER', administrator: 'ADMINISTRATOR'},
            accountTypesEnum: {internal: "INTERNAL"},
            btsEnum: {jira: "JIRA", tfs: "TFS", rally: "RALLY"},
            demoProjectName: "default_project",
            breadcrumbMode: {expanded: 'expanded'},
            commentAnchor: '',

            dashboardNameSize: {min: 3, max: 128},
            maxDashboards: 50,
            maxWidgetsOnDashboard: 20,
            defaultWidgetWidth: 12,
            minWidgetWidth: 4,
            defaultWidgetHeight: 7,
            minWidgetHeight: 4,
            widgetGridCellHeight: 60,
            widgetGridVerticalMargin: 15,
            itemsAutoRefresh: 60000,
            inProgressAutoRefresh: 15000,
            historyItemsToLoad: 30,
            defaultHistoryDepth: 10,
            defaultTabId: 'allCases',

            contextName: null,
            preferences: null,
            dateTimeFormat: 'yy-mm-dd',
            dateRangeFullFormat: 'HH:mm MM/DD/YY',
            dateRangeFormat: 'MM/DD/YY',
            widgetTimeFormat: 'YYYY-MM-DD',

            session: {},

            forms: {
                nameRange: [4, 128],
                fullNameRange: [3, 256],
                passwordRange: [4, 25],
                itemDescriptionMax: 1024,
                tagsMin: 3,
                tagsMax: 1024,
                triggerMin: 3,
                filterName: [3, 128]
            },

            launchVerifyDelay: 3000,
            launchStatus: {
                inProgress: "IN_PROGRESS",
                stopped: 'STOPPED',
                interrupted: 'INTERRUPTED'
            },

            defaultColors: {
                'total': '#489BEB',
                'passed': '#87b77b',
                'failed': '#f36c4a',
                'skipped': '#bdc7cc',
                'automationBug': '#f7d63e',
                'noDefect': '#777777',
                'productBug': '#ec3900',
                'systemIssue': '#0274d1',
                'toInvestigate': '#ffb743',
                'investigated': '#87b87f',
                'duration': '#507fd5',
                'interrupted': '#a94442',
                'notPassed': '#CD1B00',
                'negative': '#e52e2e',
                'zero': '#486192',
                'positive': '#63c93b',
                'invalid': '#ff3222',
                'numberLaunches': '#0F55FF'
            },

            patterns: {
                email: /^[a-z0-9._-]+@[a-z0-9_-]+?\.[a-z0-9]{2,}$/i,
                emailInternal: "^((?!(@epam.com)).)*$",
                emailWrong: /wrong email/i,
                fullName: /^[a-z0-9._-\s\u0400-\u04FF]{3,255}$/i,
                originalPass: /^(.){4,25}$/,
                onlyIntegers: /^\d+$/,
                doubles: /^[0-9]+(\.[0-9]+)?$/,
                urlT: '(http|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?',
                htmlError: /<\/body>/i,
                getBodyContent: /<body[^>]*>((.|[\n\r])*)<\/body>/im,
                replaceBodyTag: /<\/?body[^>]*>/gi,
                hostandIP: /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))|(^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$)/,
                defectsLocator: /AB001|PB001|SI001|ND001|TI001/
            },

            restorationStamp: '?reset=',
            commentsSeparator: '\n==============================\n',

            forSettings: {
                defaultPassword: '11111111',
                projectNotFoundPattern: 'No project could be found',
                projectSpecific: [
                    {name: 'DEFAULT', value: 'DEFAULT'},
                    {name: 'BDD', value: 'BDD'}
                ],
                interruptedJob: [
                    {name: '1 hour', value: '1 hour'},
                    {name: '3 hours', value: '3 hours'},
                    {name: '6 hours', value: '6 hours'},
                    {name: '12 hours', value: '12 hours'},
                    {name: '1 day', value: '1 day'}
                ],
                keepLogs: [
                    {name: '2 weeks', value: '2 weeks'},
                    {name: '1 month', value: '1 month'},
                    {name: '3 months', value: '3 months'},
                    {name: '6 months', value: '6 months'}
                ],
                keepScreenshots: [
                    {name: '1 week', value: '1 week'},
                    {name: '2 weeks', value: '2 weeks'},
                    {name: '3 weeks', value: '3 weeks'},
                    {name: '1 month', value: '1 month'},
                    {name: '3 months', value: '3 months'}
                ],
                btsList: [
                    //{name: 'NONE', value: 'NONE'},
                    {name: 'JIRA', value: 'JIRA'},
                    {name: 'RALLY', value: 'RALLY'}//,
                    // {name: 'TFS', value: 'TFS'}
                ],
                btsJIRA: {
                    multiple: true,
                    disabledForEdit: ['issuetype'],
                    credentialsErrorPattern: "Unauthorized (401)",
                    logsAmount: 50,
                    authorizationType: [
                        {name: text.ui.BASIC, value: "BASIC"}
                        //{ name: text.ui.OAUTH, value: "OAUTH" }
                    ],
                    ticketType: [
                        {name: 'STORY', value: 'STORY'},
                        {name: 'BUG', value: 'BUG'},
                        {name: 'IMPROVEMENT', value: 'IMPROVEMENT'}
                    ],
                    defaultSeverity: [
                        {name: 'BLOCKER', value: 'BLOCKER'},
                        {name: 'CRITICAL', value: 'CRITICAL'},
                        {name: 'MAJOR', value: 'MAJOR'},
                        {name: 'MINOR', value: 'MINOR'},
                        {name: 'TRIVIAL', value: 'TRIVIAL'}
                    ],
                    canUseRPAuthorization: true
                },
                btsTFS: {
                    credentialsErrorPattern: "Access denied connecting to TFS",
                    authorizationType: [
                        {name: text.ui.NTLM, value: "NTLM"}
                        //{ name: text.ui.OAUTH, value: "OAUTH" }
                    ],
                    ticketType: [
                        {name: 'BUG', value: 'BUG'}
                    ],
                    disabledForEdit: [],
                    canUseRPAuthorization: true
                },
                btsRALLY: {
                    authorizationType: [
                        {name: text.ui.APIKEY, value: "APIKEY"}
                        //{ name: text.ui.OAUTH, value: "OAUTH" }
                    ],
                    ticketType: [
                        {name: 'BUG', value: 'BUG'}
                    ],
                    disabledForEdit: [],
                    canUseRPAuthorization: false
                },
                emailInCase: [
                    {value: 'ALWAYS', name: 'Always'},
                    {value: 'TO_INVESTIGATE', name: 'Launch has "To Investigate" items'},
                    {value: 'FAILED', name: 'Launch has issues'},
                    {value: 'MORE_10', name: '> 10% of items have issues'},
                    {value: 'MORE_20', name: '> 20% of items have issues'},
                    {value: 'MORE_50', name: '> 50% of items have issues'}
                ]
            },

            forAdminSettings: {
                protocol: [
                    {value: 'SMTP', name: 'SMTP'}
                ]
            },

            widgetCriteria: {
                launch_statistics_exec: ['Passed', 'Failed', 'Skipped', 'Total'],
                launch_statistics_issue: ['Product.Bug', 'Automation.Bug', 'System.Issue', 'Total'],
                investigated_trend: ['Product.Bug', 'Automation.Bug', 'System.Issue', 'To.Investigate']
            },

            minNameLength: 3,
            maxNameLength: 55
        }
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
        clear: clear
    };
});
