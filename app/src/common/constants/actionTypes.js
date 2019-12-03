/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const START_LAUNCH = 'startLaunch';
export const FINISH_LAUNCH = 'finishLaunch';
export const DELETE_LAUNCH = 'deleteLaunch';
export const POST_ISSUE = 'postIssue';
export const LINK_ISSUE = 'linkIssue';
export const UNLINK_ISSUE = 'unlinkIssue';
export const CREATE_USER = 'createUser';
export const CREATE_DASHBOARD = 'createDashboard';
export const UPDATE_DASHBOARD = 'updateDashboard';
export const DELETE_DASHBOARD = 'deleteDashboard';
export const CREATE_WIDGET = 'createWidget';
export const UPDATE_WIDGET = 'updateWidget';
export const DELETE_WIDGET = 'deleteWidget';
export const CREATE_FILTER = 'createFilter';
export const UPDATE_FILTER = 'updateFilter';
export const DELETE_FILTER = 'deleteFilter';
export const CREATE_INTEGRATION = 'createIntegration';
export const UPDATE_INTEGRATION = 'updateIntegration';
export const DELETE_INTEGRATION = 'deleteIntegration';
export const UPDATE_PROJECT = 'updateProject';
export const UPDATE_NOTIFICATIONS = 'emailConfig';
export const UPDATE_ANALYZER = 'updateAnalyzer';
export const GENERATE_INDEX = 'generateIndex';
export const DELETE_INDEX = 'deleteIndex';
export const CREATE_DEFECT = 'createDefect';
export const UPDATE_DEFECT = 'updateDefect';
export const DELETE_DEFECT = 'deleteDefect';
export const START_IMPORT = 'startImport';
export const FINISH_IMPORT = 'finishImport';
export const UPDATE_ITEM = 'updateItem';
export const LINK_ISSUE_AA = 'linkIssueAa';
export const ANALYZE_ITEM = 'analyzeItem';
export const CREATE_PATTERN = 'createPattern';
export const UPDATE_PATTERN = 'updatePattern';
export const DELETE_PATTERN = 'deletePattern';
export const MATCHED_PATTERN = 'patternMatched';

// grouped actions
export const ACTIONS_WITH_ISSUES = 'issuesActions';
export const ACTIONS_WITH_DASHBOARDS = 'dashboardsActions';
export const ACTIONS_WITH_WIDGETS = 'widgetsActions';
export const ACTIONS_WITH_FILTERS = 'filtersActions';
export const ACTIONS_WITH_INTEGRATIONS = 'integrationsActions';
export const ACTIONS_WITH_AA_SETTINGS = 'aaSettingsActions';
export const ACTIONS_WITH_DEFECTS = 'defectsActions';
export const ACTIONS_WITH_IMPORT = 'importActions';
export const ACTIONS_WITH_LAUNCH = 'launchActions';

export const GROUP_TO_ACTION_MAP = {
  [ACTIONS_WITH_ISSUES]: [POST_ISSUE, LINK_ISSUE, UNLINK_ISSUE],
  [ACTIONS_WITH_DASHBOARDS]: [CREATE_DASHBOARD, UPDATE_DASHBOARD, DELETE_DASHBOARD],
  [ACTIONS_WITH_WIDGETS]: [CREATE_WIDGET, UPDATE_WIDGET, DELETE_WIDGET],
  [ACTIONS_WITH_FILTERS]: [CREATE_FILTER, UPDATE_FILTER, DELETE_FILTER],
  [ACTIONS_WITH_INTEGRATIONS]: [CREATE_INTEGRATION, UPDATE_INTEGRATION, DELETE_INTEGRATION],
  [ACTIONS_WITH_AA_SETTINGS]: [UPDATE_ANALYZER, GENERATE_INDEX, DELETE_INDEX],
  [ACTIONS_WITH_DEFECTS]: [CREATE_DEFECT, UPDATE_DEFECT, DELETE_DEFECT],
  [ACTIONS_WITH_IMPORT]: [START_IMPORT, FINISH_IMPORT],
};

export const ACTION_TO_GROUP_MAP = {
  [POST_ISSUE]: ACTIONS_WITH_ISSUES,
  [LINK_ISSUE]: ACTIONS_WITH_ISSUES,
  [UNLINK_ISSUE]: ACTIONS_WITH_ISSUES,

  [CREATE_DASHBOARD]: ACTIONS_WITH_DASHBOARDS,
  [UPDATE_DASHBOARD]: ACTIONS_WITH_DASHBOARDS,
  [DELETE_DASHBOARD]: ACTIONS_WITH_DASHBOARDS,

  [CREATE_WIDGET]: ACTIONS_WITH_WIDGETS,
  [UPDATE_WIDGET]: ACTIONS_WITH_WIDGETS,
  [DELETE_WIDGET]: ACTIONS_WITH_WIDGETS,

  [CREATE_FILTER]: ACTIONS_WITH_FILTERS,
  [UPDATE_FILTER]: ACTIONS_WITH_FILTERS,
  [DELETE_FILTER]: ACTIONS_WITH_FILTERS,

  [CREATE_INTEGRATION]: ACTIONS_WITH_INTEGRATIONS,
  [UPDATE_INTEGRATION]: ACTIONS_WITH_INTEGRATIONS,
  [DELETE_INTEGRATION]: ACTIONS_WITH_INTEGRATIONS,

  [UPDATE_ANALYZER]: ACTIONS_WITH_AA_SETTINGS,
  [GENERATE_INDEX]: ACTIONS_WITH_AA_SETTINGS,
  [DELETE_INDEX]: ACTIONS_WITH_AA_SETTINGS,

  [CREATE_DEFECT]: ACTIONS_WITH_DEFECTS,
  [UPDATE_DEFECT]: ACTIONS_WITH_DEFECTS,
  [DELETE_DEFECT]: ACTIONS_WITH_DEFECTS,

  [START_IMPORT]: ACTIONS_WITH_IMPORT,
  [FINISH_IMPORT]: ACTIONS_WITH_IMPORT,
};
