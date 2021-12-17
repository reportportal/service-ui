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
  FILTERS_PAGE_EVENTS,
  FILTERS_PAGE,
  getAddEditFilterModalEvents,
} from './filtersPageEvents';
export {
  LAUNCHES_PAGE_EVENTS,
  LAUNCHES_MODAL_EVENTS,
  LAUNCHES_PAGE,
  getRunAnalysisAnalysisModalEvent,
  getRunAnalysisPatternAnalysisModalEvent,
  getCriteriaToggler,
} from './launchesPageEvents';
export { LOGIN_PAGE_EVENTS, LOGIN_PAGE } from './loginPageEvents';
export {
  SIDEBAR_EVENTS,
  ADMIN_SIDEBAR_EVENTS,
  FOOTER_EVENTS,
  HELP_AND_SUPPORT_EVENTS,
} from './sidebarFooterEvents';
export { MEMBERS_PAGE, MEMBERS_PAGE_EVENTS } from './membersPageEvents';
export {
  PLUGINS_PAGE_EVENTS,
  PLUGINS_PAGE,
  getPluginFilterTabClickEvent,
  getPluginItemClickEvent,
  getDisablePluginItemClickEvent,
  getUninstallPluginBtnClickEvent,
} from './pluginsPageEvents';
export { PROFILE_PAGE, PROFILE_PAGE_EVENTS } from './profilePageEvents';
export {
  SETTINGS_PAGE,
  SETTINGS_PAGE_EVENTS,
  getSaveNewPatternEvent,
  getIntegrationItemClickEvent,
  getIntegrationUnlinkGlobalEvent,
  getIntegrationEditAuthClickEvent,
  getAutoAnalysisMinimumShouldMatchSubmitEvent,
} from './settingsPageEvents';
export { SUITE_PAGE, SUITES_PAGE_EVENTS } from './suitesPageEvents';
export { STEP_PAGE, STEP_PAGE_EVENTS, getChangeItemStatusEvent } from './stepPageEvents';
export {
  LOG_PAGE,
  LOG_PAGE_EVENTS,
  LogViewMode,
  getHideAllPassedLogs,
  getHistoryLineCheckbox,
} from './logPageEvents';
export { DASHBOARD_PAGE, DASHBOARD_PAGE_EVENTS } from './dashboardsPageEvents';
export { HISTORY_PAGE, HISTORY_PAGE_EVENTS } from './historyPageEvents';
export { ADMIN_ALL_USERS_PAGE_EVENTS } from './adminAllUsersPageEvents';
export { ADMIN_PROJECTS_PAGE_EVENTS, ADMIN_PROJECTS_PAGE } from './adminProjectsPageEvents';
export {
  ADMIN_SERVER_SETTINGS_PAGE,
  ADMIN_SERVER_SETTINGS_PAGE_EVENTS,
  submitAnalyticsBtn,
} from './adminServerSettingsPageEvents';
export { TEST_PAGE, TESTS_PAGE_EVENTS } from './testsPageEvents';
