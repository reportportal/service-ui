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

define([], function () {

    var sharedWidgetsFake = function () {
        return [{
            owner: 'irina_tarasova',
            content_parameters: {
                gadget: "old_line_chart"
            },
            id: 4234234234,
            name: "Test widget for failed launches",
            criteria: "Total >= 34, Name contains 'hello lol'"
        }, {
            owner: 'irina_tarasova',
            content_parameters: {
                gadget: "overall_statistics"
            },
            id: 6356546365,
            name: "!!aaa_ddd",
            criteria: "Name contains 'lol', Failed <= 3"
        },
            {
                owner: 'dzmitry_kordova',
                content_parameters: {
                    gadget: "launches_duration_chart"
                },
                id: 747646745764,
                name: "Porte to mall",
                criteria: "Failed <= 3, Product bug >= 3"
            },
            {
                owner: 'dzmitry_kordova',
                content_parameters: {
                    gadget: "overall_statistics"
                },
                id: 543345325345,
                name: "!!test_dete",
                criteria: "Auto bug >= 40,  >= 2003"
            },
            {
                owner: 'dzmitry_kordova',
                content_parameters: {
                    gadget: "activity_stream"
                },
                id: 111764746,
                name: "cartofel-will",
                criteria: "System issues <= 4, Total >= 2003"
            }]
    };

    var sharedWidgetInstance = function () {
        return {
            links: [],
            owner: 'demo',
            isShared: true,
            id: "5234523452435sgf",
            name: "test me",
            content_parameters: {
                gadget: "old_line_chart"
            },
            filter_id: "54252345235",
            content: {}
        }
    };

    var ownFilters = function () {
        return [{
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/545247b0e4b080e9f42c1c5d"
            }],
            owner: "default",
            isShared: true,
            id: "545247b0e4b080e9f42c1c5d",
            name: "!!!API_Aug!!!",
            entities: [
                {filtering_field: "name", condition: "cnt", value: "ReportPortalApiTests", is_negative: false},
                {
                    filtering_field: "start_time",
                    condition: "btw",
                    value: "1406840400000,1409518740000",
                    is_negative: false
                }
            ],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/54869ccde4b08774b973ac90"
                }
                ],
                owner: "default",
                isShared: true,
                id: "54869ccde4b08774b973ac90",
                name: "!!!API_Aug!!!",
                entities: [
                    {
                        filtering_field: "statistics$executions$skipped",
                        condition: "gte",
                        value: "1",
                        is_negative: false
                    },
                    {filtering_field: "statistics$executions$failed", condition: "gte", value: "1", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548ec3fee4b064a23cc5f11f"
                }],
                owner: "default",
                isShared: true,
                id: "548ec3fee4b064a23cc5f11f",
                name: "!!!_aaa",
                entities: [
                    {filtering_field: "statistics$executions$passed", condition: "gte", value: "4", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }];
    };

    var sharedFilters = function () {
        return [{
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548ec456e4b064a23cc5f120"
            }],
            owner: "default_user",
            isShared: true,
            id: "548ec456e4b064a23cc5f120",
            name: "!!_wrong",
            entities: [
                {filtering_field: "statistics$executions$total", condition: "gte", value: "5", is_negative: false}
            ],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        }, {
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5481cdda2814b069ad0b57f2"
            }],
            owner: "default_user",
            isShared: true,
            id: "5481cdda2814b069ad0b57f2",
            name: "!!aa_dd",
            entities: [
                {filtering_field: "statistics$executions$failed", condition: "gte", value: "5", is_negative: false},
                {filtering_field: "statistics$executions$skipped", condition: "gte", value: "4", is_negative: false}
            ],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        }, {
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5486a281e4b08774b973ac92"
            }],
            owner: "irina_tarasova",
            isShared: true,
            id: "5486a281e4b08774b973ac92",
            name: "!!aa_dd",
            entities: [{
                filtering_field: "statistics$executions$total",
                condition: "gte",
                value: "345",
                is_negative: false
            }],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        }, {
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5492a5fee4b0b3a5a698b0b8"
            }],
            owner: "irina_tarasova",
            isShared: true,
            id: "5492a5fee4b0b3a5a698b0b8",
            name: "!!aa_dd_3",
            entities: [{
                filtering_field: "description",
                condition: "cnt",
                value: "test",
                is_negative: false
            }, {filtering_field: "statistics$executions$total", condition: "gte", value: "0", is_negative: false}],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        }];
    };

    var filtersFake = function () {
        return [{
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/545247b0e4b080e9f42c1c5d"
            }],
            owner: "default",
            isShared: true,
            id: "545247b0e4b080e9f42c1c5d",
            name: "!!!API_Aug!!!",
            entities: [
                {filtering_field: "name", condition: "cnt", value: "ReportPortalApiTests", is_negative: false},
                {
                    filtering_field: "start_time",
                    condition: "btw",
                    value: "1406840400000,1409518740000",
                    is_negative: false
                }
            ],
            selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
            type: "launch"
        },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/54869ccde4b08774b973ac90"
                }
                ],
                owner: "irina_tarasova",
                isShared: true,
                id: "54869ccde4b08774b973ac90",
                name: "!!!API_Aug!!!",
                entities: [
                    {
                        filtering_field: "statistics$executions$skipped",
                        condition: "gte",
                        value: "1",
                        is_negative: false
                    },
                    {filtering_field: "statistics$executions$failed", condition: "gte", value: "1", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548ec3fee4b064a23cc5f11f"
                }],
                owner: "default_user",
                isShared: true,
                id: "548ec3fee4b064a23cc5f11f",
                name: "!!!_aaa",
                entities: [
                    {filtering_field: "statistics$executions$passed", condition: "gte", value: "4", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548eb1d0281457e4da639812"
                }],
                owner: "default",
                isShared: true,
                id: "548eb1d0281457e4da639812",
                name: "!!_aa_delete1",
                entities: [
                    {filtering_field: "statistics$executions$total", condition: "gte", value: "4", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            },
            {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548ec141281457e4da639818"
                }],
                owner: "default_user",
                isShared: true,
                id: "548ec141281457e4da639818",
                name: "!!_aaa",
                entities: [
                    {filtering_field: "statistics$executions$total", condition: "gte", value: "34", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/548ec456e4b064a23cc5f120"
                }],
                owner: "default_user",
                isShared: true,
                id: "548ec456e4b064a23cc5f120",
                name: "!!_wrong",
                entities: [
                    {filtering_field: "statistics$executions$total", condition: "gte", value: "5", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5481cdda2814b069ad0b57f2"
                }],
                owner: "default",
                isShared: true,
                id: "5481cdda2814b069ad0b57f2",
                name: "!!aa_dd",
                entities: [
                    {filtering_field: "statistics$executions$failed", condition: "gte", value: "5", is_negative: false},
                    {filtering_field: "statistics$executions$skipped", condition: "gte", value: "4", is_negative: false}
                ],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5486a281e4b08774b973ac92"
                }],
                owner: "irina_tarasova",
                isShared: true,
                id: "5486a281e4b08774b973ac92",
                name: "!!aa_dd",
                entities: [{
                    filtering_field: "statistics$executions$total",
                    condition: "gte",
                    value: "345",
                    is_negative: false
                }],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/5492a5fee4b0b3a5a698b0b8"
                }],
                owner: "irina_tarasova",
                isShared: true,
                id: "5492a5fee4b0b3a5a698b0b8",
                name: "!!aa_dd_3",
                entities: [{
                    filtering_field: "description",
                    condition: "cnt",
                    value: "test",
                    is_negative: false
                }, {filtering_field: "statistics$executions$total", condition: "gte", value: "0", is_negative: false}],
                selection_parameters: {sorting_column: "start_time", is_asc: false, quantity: 50, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/547da229e4b07780fae2e694"
                }],
                owner: "default",
                isShared: false,
                id: "547da229e4b07780fae2e694",
                name: "*)>:@?;{>(",
                entities: [{filtering_field: "name", condition: "cnt", value: "Demo", is_negative: false}],
                selection_parameters: {sorting_column: "name", is_asc: false, quantity: 1, page_number: 1},
                type: "launch"
            }, {
                links: [{
                    rel: "self",
                    href: "https://localhost:8443/reportportal-ws/api/v1/default_project/filter/547fa294e4b008c36ef964f2"
                }],
                owner: "default",
                isShared: false,
                id: "547fa294e4b008c36ef964f2",
                name: "*;%'!*]#~+&()№)*`$>].&{)%'-:\\\\,_!?^-;'{{|/*</`',!+``!+&]№'}}^>!<[~?!!}_\\#[%<)~(/(]>.'],%#..,^|^@=%:/.;^>!;\"=,~'",
                entities: [{filtering_field: "name", condition: "cnt", value: "Demo", is_negative: false}],
                selection_parameters: {sorting_column: "name", is_asc: false, quantity: 1, page_number: 1},
                type: "launch"
            }];
    };

    var project = function () {
        return {
            links: [{rel: "self", href: "https://localhost:8443/reportportal-ws/api/v1/project/autorecognition"}],
            projectId: "autorecognition",
            customer: "vladimir_lobanov",
            configuration: {
                externalSystem: [{
                    links: [],
                    id: "558ab88bd4bacfd2d9ed3bf9",
                    systemType: "JIRA",
                    systemAuth: "BASIC",
                    url: "http://evbyminsd64c7.minsk.epam.com:8080",
                    accessKey: "",
                    project: "EPMCDP",
                    username: "vasya",
                    fields: [
                        {
                            definedValues: [{valueId: 10003, valueName: "EPMCDP component"}, {
                                valueId: "10001",
                                valueName: "JIRA integration"
                            }, {valueId: 10000, valueName: "Report Portal"}, {
                                valueId: 10002,
                                valueName: "Test component"
                            }],
                            fieldName: "Component/s",
                            id: "components",
                            fieldType: "array",
                            required: false,
                            value: ["Report Portal"]
                        }, {
                            definedValues: [],
                            fieldName: "Issue Type",
                            id: "issuetype",
                            fieldType: "issuetype",
                            required: true,
                            value: ["BUG"]
                        }, {
                            definedValues: [{valueId: 1, valueName: "Blocker"}, {
                                valueId: 2,
                                valueName: "Critical"
                            }, {valueId: 3, valueName: "MAJOR"}],
                            fieldName: "Priority",
                            id: "priority",
                            fieldType: "priority",
                            required: false,
                            value: ["MAJOR"]
                        }, {
                            definedValues: [],
                            fieldName: "Assignee",
                            id: "assignee",
                            fieldType: "user",
                            required: false,
                            value: []
                        }, {
                            definedValues: [],
                            fieldName: "Summary",
                            id: "summary",
                            fieldType: "string",
                            required: true,
                            value: []
                        }
                    ]
                }],
                entryType: "INTERNAL",
                statisticCalculationStrategy: "TEST_BASED",
                projectSpecific: "DEFAULT",
                interruptedJob: "1 day",
                keepLogs: "3 months",
                keepScreenshots: "1 month",
                isAutoAnalyzerEnabled: true
            },
            users: {denys_abert: {projectRole: "LEAD", proposedRole: "LEAD"}},
            project: "autorecognition",
            url: "autorecognition"
        }
    };

    var getSecondTBSInstance = function () {
        return {
            links: [],
            id: "558ab88bd4bacfd2d9ed3bf5",
            systemType: "JIRA",
            systemAuth: "BASIC",
            url: "http://evbyminsd64c7.minsk.epam.com:8080",
            accessKey: "",
            project: "TRALALA",
            username: "vasya",
            fields: [
                {
                    definedValues: [{valueId: 10003, valueName: "EPMCDP component"}, {
                        valueId: "10001",
                        valueName: "JIRA integration"
                    }, {valueId: 10000, valueName: "Report Portal"}, {valueId: 10002, valueName: "Test component"}],
                    fieldName: "Component/s",
                    id: "components",
                    fieldType: "array",
                    required: false,
                    value: ["Report Portal"]
                }]
        }
    };

    var getNotMultiTBSInstance = function () {
        return {
            links: [],
            id: "558ab88bd4bacfd2d9ed3bf5",
            systemType: "RALLY",
            systemAuth: "APIKEY",
            url: "http://rally64c7.minsk.epam.com:8080",
            accessKey: "_sfgsdfgsdfgsdfgsfd",
            project: "13412341234",
            fields: [
                {
                    definedValues: [{valueId: 10003, valueName: "EPMCDP component"}, {
                        valueId: "10001",
                        valueName: "JIRA integration"
                    }, {valueId: 10000, valueName: "Report Portal"}, {valueId: 10002, valueName: "Test component"}],
                    fieldName: "Component/s",
                    id: "components",
                    fieldType: "array",
                    required: false,
                    value: ["Report Portal"]
                }]
        }
    };

    var jiraDefaultFields = function () {
        return [
            {
                definedValues: [{valueId: 10003, valueName: "EPMCDP component"}, {
                    valueId: "10001",
                    valueName: "JIRA integration"
                }, {valueId: 10000, valueName: "Report Portal"}, {valueId: 10002, valueName: "Test component"}],
                fieldName: "Component/s",
                id: "components",
                fieldType: "array",
                required: false
            }, {
                definedValues: [],
                fieldName: "Issue Type",
                id: "issuetype",
                fieldType: "issuetype",
                required: true,
                value: ["BUG"]
            }, {
                definedValues: [{valueId: 1, valueName: "Blocker"}, {valueId: 2, valueName: "Critical"}, {
                    valueId: 3,
                    valueName: "MAJOR"
                }],
                fieldName: "Priority",
                id: "priority",
                fieldType: "priority",
                required: false
            }, {
                definedValues: [],
                fieldName: "Assignee",
                id: "assignee",
                fieldType: "user",
                required: false,
                value: []
            }, {
                definedValues: [],
                fieldName: "Attachment",
                fieldType: "array",
                id: "attachment",
                required: false
            }, {
                definedValues: [],
                fieldName: "Summary",
                id: "summary",
                fieldType: "string",
                required: true,
                value: []
            }
        ];
    };

    var projectDashboards = function () {
        return [{
            links: [{
                rel: "self",
                href: "https://localhost:8443/reportportal-ws/api/v1/epm-sign/dashboard/5562c651d4ba7f043fa15722"
            }, {
                rel: "related",
                href: "https://localhost:8443/reportportal-ws/api/v1/epm-sign/widget/5562c669d4ba7f043fa15723"
            }, {
                rel: "related",
                href: "https://localhost:8443/reportportal-ws/api/v1/epm-sign/widget/557ef8fed4ba3184d25b33b4"
            }],
            owner: "test",
            isShared: false,
            id: "5562c651d4ba7f043fa15722",
            name: "my_dash",
            widgets: [{widgetId: "5562c669d4ba7f043fa15723", widgetSize: [12, 7], widgetPosition: [0, 7]},
                {widgetId: "557ef8fed4ba3184d25b33b4", widgetSize: [12, 7], widgetPosition: [0, 0]}]
        }];
    };

    var getSuitItem = function () {
        return {
            id: "54eaf90ee4b01107d121c327",
            name: "DebugProjectSuite",
            type: "SUITE"
        }
    };

    var getLaunchItem = function () {
        return {
            id: "54eaf90ee4b01107d121c325",
            name: "FailedLaunch",
            number: 1,
            owner: "andrei_ramanchuk",
            tags: ["test", "tagX", "tagY"],
            description: "test description again",
            isShared: false,
            mode: "DEFAULT"
        }
    };

    var userDashboards = function(){
        return [
            {
                id: "559263abe4b0eeaae6629a29",
                isShared: false,
                links: [],
                name: "778",
                owner: "default",
                widgets: [
                    { widgetId: "5592637ee4b0eeaae6629a27", widgetPosition: [0, 47],widgetSize: [12, 7]},
                    { widgetId: "559298aae4b00cf07045df48", widgetSize: [5, 6], widgetPosition: [0, 41]}
                ]
            },
            {
                id: "559e3491e4b052008d80a9c7",
                isShared: true,
                links: [],
                name: "Title",
                owner: "demo",
                widgets: [
                    {widgetId: "559e349fe4b052008d80a9c8", widgetSize: [4, 6], widgetPosition: [0, 81]},
                    {widgetId: "559e34c6e4b052008d80a9c9", widgetSize: [11, 6], widgetPosition: [0, 75]}
                ]

            }
        ]
    };

    var getSharedDashboards = function(){
        return {
            '55a51e87fc225247f836ab99': {name: "1212", owner: "demo"},
            '559fbb46e4b036f24a40d933': {name: "Type1", owner: "demo"}
        }
    };

    getConfigUser = function(){
        return {
            name: 'default',
            user_login: 'default',
            account_type: "INTERNAL",
            defaultProject: "default_project",
            email: "testerusernamase@epam.com",
            fullName: "Default User123",
            image: "api/v1/data/photo?default?at=1441290440553",
            label: "c78a9e2d-925b-4fcc-a8ca-4365a9a3c8f8",
            photo_loaded: true,
            projects: {
                "alfa-ddc": {
                    "projectRole": "MEMBER",
                    "proposedRole": "MEMBER",
                    "entryType": "INTERNAL"
                },
                "autorecognition": {
                    "projectRole": "PROJECT_MANAGER",
                    "proposedRole": "PROJECT_MANAGER",
                    "entryType": "INTERNAL"
                },
                "default_project": {
                    "projectRole": "MEMBER",
                    "proposedRole": "MEMBER",
                    "entryType": "INTERNAL"
                }
            },
            edirectUrl: null,
            roles: null,
            access_token: 'dWk6dWltYW4=',
            auth: true,
            lastInsideHash: 'fhgfhfghgfhgfhgfhgfhgfhgf',
            userRole: "ADMINISTRATOR"
        }
    };

    var getUserInfo = function(){
        return {
            userId: "default",
            email: "testerusernamase@epam.com",
            photoId: "55caffffe4b04d2e62a20ca7",
            full_name: "Default User",
            account_type: "INTERNAL",
            userRole: "ADMINISTRATOR",
            last_login: 1440412384146,
            photo_loaded: true,
            default_project: "default_project",
            assigned_projects: {
                "alfa-ddc": {
                    "projectRole": "MEMBER",
                    "proposedRole": "MEMBER",
                    "entryType": "INTERNAL"
                },
                "autorecognition": {
                    "projectRole": "PROJECT_MANAGER",
                    "proposedRole": "PROJECT_MANAGER",
                    "entryType": "INTERNAL"
                },
                "default_project": {
                    "projectRole": "MEMBER",
                    "proposedRole": "MEMBER",
                    "entryType": "INTERNAL"
                }
            },
            uuid:"c78a9e2d-925b-4fcc-a8ca-4365a9a3c8f8"
        };
    };

    var getUserAssignedProjects = function(){
        return {
            "alfa-ddc": {
                "projectRole": "MEMBER",
                "proposedRole": "MEMBER",
                "entryType": "INTERNAL"
            },
            "autorecognition": {
                "projectRole": "PROJECT_MANAGER",
                "proposedRole": "PROJECT_MANAGER",
                "entryType": "INTERNAL"
            },
            "default_project": {
                "projectRole": "MEMBER",
                "proposedRole": "MEMBER",
                "entryType": "INTERNAL"
            }
        }
    };

    var getMembers = function(){
        return {
            content: [
                {
                    "userId":"epmrpp_7368",
                    "email":"a.baqwtsyleu@gmail.com",
                    "full_name":"Test EPMRPP-7368",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1442317168175,
                    "photo_loaded":true,
                    "assigned_projects":{"default_project":{"projectRole":"CUSTOMER","proposedRole":"CUSTOMER","entryType":"INTERNAL"}}
                },
                {
                    "userId":"default",
                    "email":"testerusernamase@epam.com",
                    "photoId":"55edadffe4b039666b5dfbb9",
                    "full_name":"Default User",
                    "account_type":"INTERNAL",
                    "userRole":"ADMINISTRATOR",
                    "last_login":1442319014481,
                    "photo_loaded":true,
                    "assigned_projects":{"default_project":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"}}
                },
                {
                    "userId":"memory",
                    "email":"test.rest@google.com",
                    "full_name":"Memory",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1441188734416,
                    "photo_loaded":true,
                    "assigned_projects":{"default_project":{"projectRole":"LEAD","proposedRole":"LEAD","entryType":"INTERNAL"}}
                },
                {
                    "userId":"pm25",
                    "email":"test25@google.com",
                    "full_name":"PM25",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1441188879261,
                    "photo_loaded":true,
                    "assigned_projects":{"default_project":{"projectRole":"PROJECT_MANAGER","proposedRole":"PROJECT_MANAGER","entryType":"INTERNAL"}}
                }
            ],
            page: {
                number: 1,
                size: 50,
                totalElements: 4,
                totalPages: 1
            }
        }
    };

    var getUsersList = function(){
        return {
            content: [
                {
                    "userId":"6666",
                    "email":"svetik.svt666@tut.by",
                    "full_name":"6666",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1442440490708,
                    "photo_loaded":true,
                    "assigned_projects":{
                        "autorecognition":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"}
                    }
                },
                {
                    "userId":"alex",
                    "email":"alexmiller@gmail.com",
                    "photoId":"55f6952be4b0b350323b6b51",
                    "full_name":"Alex Miller",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1442473789654,
                    "photo_loaded":true,
                    "assigned_projects":{
                        "autorecognition":{"projectRole":"CUSTOMER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "elat-dev":{"projectRole":"CUSTOMER","proposedRole":"CUSTOMER","entryType":"INTERNAL"}
                    }
                },
                {
                    "userId":"alexander",
                    "email":"alexandersimpson@gmail.com",
                    "full_name":"Alexander Simpson",
                    "account_type":"INTERNAL",
                    "userRole":"ADMINISTRATOR",
                    "last_login":1435662762625,
                    "photo_loaded":true,
                    "assigned_projects":{
                        "ctco-rdsg":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "autorecognition":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "permissions":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "test1":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "test_rp":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"}
                    }
                },
                {
                    "userId":"aliaksandr_baradyntsau",
                    "email":"aliaksandr_baradyntsau@epam.com",
                    "photoId":"55f9c592d4ba46c94d9388d9",
                    "full_name":"Aliaksandr Baradyntsau",
                    "account_type":"INTERNAL",
                    "userRole":"USER",
                    "last_login":1406815036013,
                    "photo_loaded":false,
                    "assigned_projects":{
                        "autorecognition":{"projectRole":"MEMBER","proposedRole":"MEMBER","entryType":"INTERNAL"},
                        "epm-cdp":{"projectRole":"PROJECT_MANAGER","proposedRole":"PROJECT_MANAGER","entryType":"INTERNAL"}
                    }
                }
            ],
            page: {
                number: 1,
                size: 50,
                totalElements: 4,
                totalPages: 1
            }
        }
    };

    var getUserPreferences = function(){
        return {
            "userRef":"default",
            "projectRef":"default_project",
            "active":"#default_project/launches/all?page.page=1&page.sort=start_time,DESC&page.size=50&tab.id=55f15032e4b0c403f538e577&filter.cnt.name=Test%20Launch",
            "filters":["55f15032e4b0c403f538e577"]
        }
    };

    var getFavorites = function(){
        return [
                {
                    "owner":"default",
                    "isShared":true,
                    "id":"55f15032e4b0c403f538e577",
                    "name":"123",
                    "entities":[
                        {"filtering_field":"start_time","condition":"btw","value":"LAST_30_DAYS;+3","is_negative":false},
                        {"filtering_field":"user","condition":"in","value":"default","is_negative":false}
                    ],
                    "selection_parameters":{
                        "sorting_column":"start_time",
                        "is_asc":false,
                        "quantity":50,
                        "page_number":1
                    },
                    "type":"launch"
                },
                {
                   "owner":"volha_yermalovich",
                    "isShared":true,
                    "id":"55bb834fe4b0934520a290d1",
                    "name":"2334",
                    "entities":[
                        {"filtering_field":"name","condition":"cnt","value":"2334","is_negative":false},
                        {"filtering_field":"statistics$executions$total","condition":"eq","value":"4","is_negative":false}
                    ],
                    "selection_parameters":{
                        "sorting_column":"start_time",
                        "is_asc":false,
                        "quantity":50,
                        "page_number":1},
                    "type":"launch"
                },
                {
                    "owner":"default",
                    "isShared":true,
                    "id":"55ddc498e4b018aa614c7042",
                    "name":"All ui new test",
                    "entities":[
                        {"filtering_field":"name","condition":"cnt","value":"report portal ui","is_negative":false}
                    ],
                    "selection_parameters":{
                        "sorting_column":"statistics$defects$to_investigate",
                        "is_asc":false,
                        "quantity":50,
                        "page_number":1
                    },
                    "type":"launch"
                },
                {
                    "owner":"default",
                    "isShared":false,
                    "id":"55f031d5e4b0ac087be50765",
                    "name":"Broken filter",
                    "entities":[
                        {"filtering_field":"name","condition":"cnt","value":"regression013","is_negative":false},
                        {"filtering_field":"statistics$defects$to_investigate","condition":"gte","value":"3","is_negative":false}
                    ],
                    "selection_parameters":{
                        "sorting_column":"name",
                        "is_asc":true,
                        "quantity":50,
                        "page_number":1
                    },
                    "type":"launch"
                }
            ]
    };

    var projectInfoData = function(){
        return  {
            "projectId": "default_project",
            "usersQuantity": 165,
            "launchesQuantity": 1088,
            "launchesPerUser":[
                {"fullName":"RP Tester","count":72},
                {"fullName":"natalya_urikh","count":90},
                {"fullName":"Tatsiana Drabovich","count":4},
                {"fullName":"RP Admin","count":922}
            ],
            "uniqueTickets": 21,
            "launchesPerWeek": "82.42",
            "creationDate": 1453918763656
        }
    };

    var getDefectTypes = function(){
        return {
            subTypes: {
                'TO_INVESTIGATE': [
                    {
                        links: [ ],
                        locator: "TI001",
                        typeRef: "TO_INVESTIGATE",
                        longName: "To Investigate",
                        shortName: "TI",
                        color: "#ffb743"
                    }
                ],
                'NO_DEFECT': [
                    {
                        links: [ ],
                        locator: "ND001",
                        typeRef: "NO_DEFECT",
                        longName: "No Defect",
                        shortName: "ND",
                        color: "#777777"
                    }
                ],
                'AUTOMATION_BUG': [
                    {
                        links: [ ],
                        locator: "AB001",
                        typeRef: "AUTOMATION_BUG",
                        longName: "Automation Bug",
                        shortName: "AB",
                        color: "#f7d63e"
                    }
                ],
                'SYSTEM_ISSUE': [
                    {
                        links: [ ],
                        locator: "SI001",
                        typeRef: "SYSTEM_ISSUE",
                        longName: "System Issue",
                        shortName: "SI",
                        color: "#0274d1"
                    }
                ],
                'PRODUCT_BUG': [
                    {
                        links: [ ],
                        locator: "PB001",
                        typeRef: "PRODUCT_BUG",
                        longName: "Product Bug",
                        shortName: "PB",
                        color: "#ec3900"
                    },
                    {
                        links: [ ],
                        locator: "pb_sl3xvrxktu7p",
                        typeRef: "PRODUCT_BUG",
                        longName: "Product Bug-1",
                        shortName: "PB-1",
                        color: "#f50057"
                    },
                    {
                        links: [ ],
                        locator: "pb_1ibkcu61aemnk",
                        typeRef: "PRODUCT_BUG",
                        longName: "Product Bug-2",
                        shortName: "PB2",
                        color: "#cc92d6"
                    },
                    {
                        links: [ ],
                        locator: "pb_t4a1qvax3xpe",
                        typeRef: "PRODUCT_BUG",
                        longName: "Product Bug-3",
                        shortName: "PB3",
                        color: "#ffab91"
                    }
                ]
            }
        };
    };

    var getToken = function(){
        return {
            access_token: "c03388ae-e3be-4ed4-xxxx-05ea5f6b1f3b",
            scope: "api",
            token_type: "bearer"
        }
    };

    return {
        userDashboards: userDashboards,
        sharedWidgetsFake: sharedWidgetsFake,
        sharedWidgetInstance: sharedWidgetInstance,
        filtersFake: filtersFake,
        ownFilters: ownFilters,
        sharedFilters: sharedFilters,
        project: project,
        getSecondTBSInstance: getSecondTBSInstance,
        getNotMultiTBSInstance: getNotMultiTBSInstance,
        jiraDefaultFields: jiraDefaultFields,
        projectDashboards: projectDashboards,
        getSuitItem: getSuitItem,
        getLaunchItem: getLaunchItem,
        getSharedDashboards: getSharedDashboards,
        getUserInfo: getUserInfo,
        getConfigUser: getConfigUser,
        getUserAssignedProjects: getUserAssignedProjects,
        getMembers: getMembers,
        getUsersList: getUsersList,
        getUserPreferences: getUserPreferences,
        getFavorites: getFavorites,
        projectInfoData: projectInfoData,
        getDefectTypes: getDefectTypes,
        getToken: getToken
    }
});