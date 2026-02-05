/*
 * Copyright 2024 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// extension points
export const EXTENSION_TYPE_SETTINGS_TAB = 'uiExtension:settingsTab';
export const EXTENSION_TYPE_ADMIN_SIDEBAR_COMPONENT = 'uiExtension:adminSidebarComponent';
export const EXTENSION_TYPE_ADMIN_PAGE = 'uiExtension:adminPage';
export const EXTENSION_TYPE_SIDEBAR_COMPONENT = 'uiExtension:sidebarComponent';
export const EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT = 'uiExtension:launchItemComponent';
export const EXTENSION_TYPE_INTEGRATION_FORM_FIELDS = 'uiExtension:integrationFormFields';
export const EXTENSION_TYPE_INTEGRATION_SETTINGS = 'uiExtension:integrationSettings';
export const EXTENSION_TYPE_POST_ISSUE_FORM = 'uiExtension:postIssueForm';
export const EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT =
  'uiExtension:uniqueErrorGridCellComponent';
export const EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT =
  'uiExtension:uniqueErrorGridHeaderCellComponent';
export const EXTENSION_TYPE_LOGIN_BLOCK = 'uiExtension:loginBlock';
export const EXTENSION_TYPE_LOGIN_PAGE = 'uiExtension:loginPage';
export const EXTENSION_TYPE_REGISTRATION_PAGE = 'uiExtension:registrationPage';
export const EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON =
  'uiExtension:makeDecisionDefectCommentAddon';
export const EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON =
  'uiExtension:makeDecisionDefectTypeAddon';
export const EXTENSION_TYPE_LOG_STACKTRACE_ADDON = 'uiExtension:logStacktraceAddon';
export const EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON = 'uiExtension:testItemDetailsAddon';
export const EXTENSION_TYPE_PROJECT_PAGE = 'uiExtension:projectPage';

export const REMOTE_EXTENSION_POINT_PROJECT_PAGE = 'projectPages';
// plugin commands
export const COMMAND_GET_ISSUE_TYPES = 'getIssueTypes';
export const COMMAND_GET_ISSUE_FIELDS = 'getIssueFields';
export const COMMAND_POST_ISSUE = 'postTicket';
export const COMMAND_GET_ISSUE = 'getIssue';
export const COMMAND_GET_CLUSTERS = 'getClusters';

// core files keys
export const MANIFEST_FILE_KEY = 'metadata';
export const MAIN_FILE_KEY = 'main';
export const ICON_FILE_KEY = 'icon';

// redux actions
export const FETCH_EXTENSION_MANIFESTS_SUCCESS = 'fetchExtensionManifestsSuccess';
export const UPDATE_EXTENSION_MANIFEST = 'updateExtensionManifest';

// plugin types
export const PLUGIN_TYPE_REMOTE = 'REMOTE';
export const PLUGIN_TYPE_EXTENSION = 'EXTENSION';
export const PLUGIN_TYPE_BUILTIN = 'BUILTIN';

// manifest overrides
export const MANIFEST_OVERRIDES_KEY = 'overrides';
export const MANIFEST_OVERRIDE_DISABLE_POPUP_CONTENT_KEY = 'disablePluginPopupContent';
