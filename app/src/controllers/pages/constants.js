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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NOT_FOUND } from 'redux-first-router';

export const UPDATE_PAGE_PROPERTIES = 'updatePagePropertiesAction';
export const CLEAR_PAGE_STATE = 'clearPageStateAction';

// undefined page
export const NO_PAGE = undefined;
// admin
export const ADMINISTRATE_PAGE = 'ADMINISTRATE_PAGE';
export const PROJECTS_PAGE = 'PROJECTS_PAGE';
export const PROJECT_DETAILS_PAGE = 'PROJECT_DETAILS_PAGE';
export const ALL_USERS_PAGE = 'ALL_USERS_PAGE';
export const SERVER_SETTINGS_PAGE = 'SERVER_SETTINGS_PAGE';
export const SERVER_SETTINGS_TAB_PAGE = 'SERVER_SETTINGS_TAB_PAGE';
export const PLUGINS_PAGE = 'PLUGINS_PAGE';
export const PLUGINS_TAB_PAGE = 'PLUGINS_TAB_PAGE';
export const PLUGIN_UI_EXTENSION_ADMIN_PAGE = 'PLUGIN_UI_EXTENSION_ADMIN_PAGE';
// inside
export const API_PAGE = 'API_PAGE';
export const PROJECT_PAGE = 'PROJECT_PAGE';
export const PROJECT_DASHBOARD_PAGE = 'PROJECT_DASHBOARD_PAGE';
export const PROJECT_DASHBOARD_ITEM_PAGE = 'PROJECT_DASHBOARD_ITEM_PAGE';
export const PROJECT_DASHBOARD_PRINT_PAGE = 'PROJECT_DASHBOARD_PRINT_PAGE';
export const PROJECT_FILTERS_PAGE = 'PROJECT_FILTERS_PAGE';
export const PROJECT_LAUNCHES_PAGE = 'PROJECT_LAUNCHES_PAGE';
export const PROJECT_MEMBERS_PAGE = 'PROJECT_MEMBERS_PAGE';
export const PROJECT_SANDBOX_PAGE = 'PROJECT_SANDBOX_PAGE';
export const PROJECT_SETTINGS_PAGE = 'PROJECT_SETTINGS_PAGE';
export const PROJECT_SETTINGS_TAB_PAGE = 'PROJECT_SETTINGS_TAB_PAGE';
export const PROJECT_SETTINGS_TAB_PAGE_WITH_SUBPAGE = 'PROJECT_SETTINGS_TAB_PAGE_WITH_SUBPAGE';
export const PROJECT_USERDEBUG_PAGE = 'PROJECT_USERDEBUG_PAGE';
export const PROJECT_USERDEBUG_TEST_ITEM_PAGE = 'PROJECT_USERDEBUG_TEST_ITEM_PAGE';
export const PROJECT_LOG_PAGE = 'PROJECT_LOG_PAGE';
export const PROJECT_USERDEBUG_LOG_PAGE = 'PROJECT_USERDEBUG_LOG_PAGE';
export const USER_PROFILE_PAGE = 'USER_PROFILE_PAGE';
export const USER_PROFILE_SUB_PAGE = 'USER_PROFILE_SUB_PAGE';
export const HISTORY_PAGE = 'HISTORY_PAGE';
export const UNIQUE_ERRORS_PAGE = 'UNIQUE_ERRORS_PAGE';
export const TEST_ITEM_PAGE = 'TEST_ITEM_PAGE';
export const LAUNCHES_PAGE = 'LAUNCHES_PAGE';
export const OAUTH_SUCCESS = 'OAUTH_SUCCESS';
// outside
export const LOGIN_PAGE = 'LOGIN_PAGE';
export const REGISTRATION_PAGE = 'REGISTRATION_PAGE';
export const HOME_PAGE = 'HOME_PAGE';
export const ACCOUNT_REMOVED_PAGE = 'ACCOUNT_REMOVED_PAGE';

// extensions
export const PROJECT_PLUGIN_PAGE = 'PROJECT_PLUGIN_PAGE';

export const pageNames = {
  [NOT_FOUND]: NOT_FOUND,
  ADMINISTRATE_PAGE,
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  PLUGINS_PAGE,
  PLUGINS_TAB_PAGE,
  API_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  PROJECT_FILTERS_PAGE,
  LAUNCHES_PAGE,
  PROJECT_LAUNCHES_PAGE,
  PROJECT_MEMBERS_PAGE,
  PROJECT_SANDBOX_PAGE,
  PROJECT_SETTINGS_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
  PROJECT_SETTINGS_TAB_PAGE_WITH_SUBPAGE,
  PROJECT_USERDEBUG_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  USER_PROFILE_PAGE,
  USER_PROFILE_SUB_PAGE,
  LOGIN_PAGE,
  ACCOUNT_REMOVED_PAGE,
  REGISTRATION_PAGE,
  TEST_ITEM_PAGE,
  HISTORY_PAGE,
  UNIQUE_ERRORS_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  OAUTH_SUCCESS,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  PROJECT_PLUGIN_PAGE,
};

export const adminPageNames = {
  [ADMINISTRATE_PAGE]: ADMINISTRATE_PAGE,
  [PROJECTS_PAGE]: PROJECTS_PAGE,
  [PROJECT_DETAILS_PAGE]: PROJECT_DETAILS_PAGE,
  [ALL_USERS_PAGE]: ALL_USERS_PAGE,
  [SERVER_SETTINGS_PAGE]: SERVER_SETTINGS_PAGE,
  [SERVER_SETTINGS_TAB_PAGE]: SERVER_SETTINGS_TAB_PAGE,
  [PLUGINS_PAGE]: PLUGINS_PAGE,
  [PLUGINS_TAB_PAGE]: PLUGINS_TAB_PAGE,
  [PLUGIN_UI_EXTENSION_ADMIN_PAGE]: PLUGIN_UI_EXTENSION_ADMIN_PAGE,
};
