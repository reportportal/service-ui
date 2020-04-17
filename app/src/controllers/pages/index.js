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

export {
  pageSelector,
  pagePropertiesSelector,
  activeDashboardIdSelector,
  projectIdSelector,
  projectSectionSelector,
  launchIdSelector,
  suiteIdSelector,
  payloadSelector,
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
} from './selectors';
export { updatePagePropertiesAction, clearPageStateAction } from './actionCreators';

export {
  NO_PAGE,
  ADMINISTRATE_PAGE,
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  PLUGINS_PAGE,
  PLUGINS_TAB_PAGE,
  API_PAGE,
  PROJECT_PAGE,
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
  PROJECT_USERDEBUG_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  USER_PROFILE_PAGE,
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  HISTORY_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  pageNames,
  adminPageNames,
  OAUTH_SUCCESS,
  HOME_PAGE,
  CLEAR_PAGE_STATE,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
} from './constants';
export { NOT_FOUND } from 'redux-first-router';
export { pageSagas } from './sagas';
