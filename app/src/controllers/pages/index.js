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

export {
  pageSelector,
  pagePropertiesSelector,
  activeDashboardIdSelector,
  projectSectionSelector,
  launchIdSelector,
  suiteIdSelector,
  testItemIdsSelector,
  testItemIdsArraySelector,
  createQueryParametersSelector,
  filterIdSelector,
  pathnameChangedSelector,
  logItemIdSelector,
  settingsTabSelector,
  pluginsTabSelector,
  prevPagePropertiesSelector,
  prevTestItemSelector,
  searchStringSelector,
  querySelector,
  isInitialDispatchDoneSelector,
  currentPathSelector,
  pluginPageSelector,
  pluginRouteSelector,
  userProfileRouteSelector,
  urlOrganizationAndProjectSelector,
  userRolesSelector,
  activeProjectRoleSelector,
  userAssignedSelector,
} from './selectors';
export { updatePagePropertiesAction, clearPageStateAction } from './actionCreators';

export {
  NO_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  PLUGINS_PAGE,
  PLUGINS_TAB_PAGE,
  API_PAGE_INSTANCE_LEVEL,
  API_PAGE_ORGANIZATION_LEVEL,
  API_PAGE_PROJECT_LEVEL,
  PROJECT_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  PROJECT_FILTERS_PAGE,
  LAUNCHES_PAGE,
  MANUAL_LAUNCHES_PAGE,
  PROJECT_LAUNCHES_PAGE,
  PROJECT_MEMBERS_PAGE,
  PROJECT_SANDBOX_PAGE,
  PROJECT_SETTINGS_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
  PROJECT_USERDEBUG_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  USER_PROFILE_PAGE,
  USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_PAGE_PROJECT_LEVEL,
  USER_PROFILE_SUB_PAGE,
  USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
  LOGIN_PAGE,
  ACCOUNT_REMOVED_PAGE,
  REGISTRATION_PAGE,
  HISTORY_PAGE,
  UNIQUE_ERRORS_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  pageNames,
  adminPageNames,
  OAUTH_SUCCESS,
  HOME_PAGE,
  CLEAR_PAGE_STATE,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  PROJECT_PLUGIN_PAGE,
  ORGANIZATIONS_PAGE,
  ORGANIZATIONS_ACTIVITY_PAGE,
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATION_USERS_PAGE,
  ORGANIZATION_SETTINGS_PAGE,
  ORGANIZATION_SETTINGS_TAB_PAGE,
  PRODUCT_VERSIONS_PAGE,
  PRODUCT_VERSIONS_TAB_PAGE,
  PRODUCT_VERSION_PAGE,
  PRODUCT_VERSION_TAB_PAGE,
  TEST_CASE_LIBRARY_PAGE,
} from './constants';
export { NOT_FOUND } from 'redux-first-router';
export { pageSagas } from './sagas';
export {
  urlFolderIdSelector,
  locationSelector,
  payloadSelector,
  urlProjectSlugSelector,
  urlOrganizationSlugSelector,
} from './typed-selectors';
