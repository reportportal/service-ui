/*
 * Copyright 2025 EPAM Systems
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
import { EmptyLayout } from 'layouts/emptyLayout';

import { AllUsersPage } from 'pages/instance/allUsersPage';
import { ServerSettingsPage } from 'pages/instance/serverSettingsPage';
import { PluginsPage } from 'pages/instance/pluginsPage';

import { ApiPage } from 'pages/inside/apiPage';
import { DashboardPage } from 'pages/inside/dashboardPage';
import { DashboardItemPage } from 'pages/inside/dashboardItemPage';
import { DashboardPrintPage } from 'pages/inside/dashboardItemPage/dashboardPrintPage';
import { FiltersPage } from 'pages/inside/filtersPage';
import { LaunchesPage } from 'pages/inside/launchesPage';
import { ProfilePage } from 'pages/inside/profilePage';
import { SandboxPage } from 'pages/inside/sandboxPage';
import { ProjectSettingsPageContainer } from 'pages/inside/projectSettingsPageContainer';
import { HistoryPage } from 'pages/inside/historyPage';
import { UniqueErrorsPage } from 'pages/inside/uniqueErrorsPage';
import { LoginPage } from 'pages/outside/loginPage';
import { NotFoundPage } from 'pages/outside/notFoundPage';
import { RegistrationPage } from 'pages/outside/registrationPage';
import { TestItemPage } from 'pages/inside/testItemPage';
import { LogsPage } from 'pages/inside/logsPage';
import { MilestonePage } from 'pages/inside/milestonesPage';
import {
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  LAUNCHES_PAGE,
  HISTORY_PAGE,
  OAUTH_SUCCESS,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  PROJECT_PLUGIN_PAGE,
  UNIQUE_ERRORS_PAGE,
  ACCOUNT_REMOVED_PAGE,
  USER_PROFILE_PAGE,
  USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_PAGE_PROJECT_LEVEL,
  USER_PROFILE_SUB_PAGE,
  USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
  ORGANIZATION_USERS_PAGE,
  PRODUCT_VERSIONS_PAGE,
  PRODUCT_VERSIONS_TAB_PAGE,
  PRODUCT_VERSION_PAGE,
  PRODUCT_VERSION_TAB_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  TEST_CASE_DETAILS_PAGE,
} from 'controllers/pages/constants';
import { AdminUiExtensionPage } from 'pages/instance/adminUiExtensionPage';
import { AccountRemovedPage } from 'pages/outside/accountRemovedPage';
import { ProjectUiExtensionPage } from 'pages/inside/projectUiExtensionPage';
import { OrganizationProjectsPage } from 'pages/organization/organizationProjectsPage';
import { ProjectTeamPage } from 'pages/organization/projectTeamPage';
import { ProjectLayout } from 'layouts/projectLayout';
import { OrganizationLayout } from 'layouts/organizationLayout';
import { InstanceLayout } from 'layouts/instanceLayout';
import { OrganizationUsersPage } from 'pages/organization/organizationUsersPage';
import { OrganizationsPage } from 'pages/instance/organizationsPage';
import { ProductVersionsPage } from 'pages/inside/productVersionsPage/productVersionsPage';
import { TestCaseLibraryPage, TestCaseDetailsPage } from 'pages/inside/testCaseLibraryPage';

export const ANONYMOUS_ACCESS = 'anonymous';
export const ADMIN_ACCESS = 'admin';

export const pageRendering = {
  [NOT_FOUND]: { component: NotFoundPage, layout: EmptyLayout },

  LOGIN_PAGE: { component: LoginPage, layout: EmptyLayout, access: ANONYMOUS_ACCESS },
  [ACCOUNT_REMOVED_PAGE]: {
    component: AccountRemovedPage,
    layout: EmptyLayout,
    access: ANONYMOUS_ACCESS,
  },
  REGISTRATION_PAGE: { component: RegistrationPage, layout: EmptyLayout, access: ANONYMOUS_ACCESS },
  [OAUTH_SUCCESS]: { component: EmptyLayout, layout: EmptyLayout, access: ANONYMOUS_ACCESS },
  [USER_PROFILE_PAGE]: { component: ProfilePage, layout: InstanceLayout },
  [USER_PROFILE_SUB_PAGE]: { component: ProfilePage, layout: InstanceLayout },
  [USER_PROFILE_PAGE_ORGANIZATION_LEVEL]: { component: ProfilePage, layout: OrganizationLayout },
  [USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL]: {
    component: ProfilePage,
    layout: OrganizationLayout,
  },
  [USER_PROFILE_PAGE_PROJECT_LEVEL]: { component: ProfilePage, layout: ProjectLayout },
  [USER_PROFILE_SUB_PAGE_PROJECT_LEVEL]: { component: ProfilePage, layout: ProjectLayout },
  API_PAGE_INSTANCE_LEVEL: { component: ApiPage, layout: InstanceLayout },
  API_PAGE_ORGANIZATION_LEVEL: { component: ApiPage, layout: OrganizationLayout },
  API_PAGE_PROJECT_LEVEL: { component: ApiPage, layout: ProjectLayout },
  [ORGANIZATION_USERS_PAGE]: {
    component: OrganizationUsersPage,
    layout: OrganizationLayout,
    rawContent: true,
  },
  ORGANIZATIONS_PAGE: {
    component: OrganizationsPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  ORGANIZATION_PROJECTS_PAGE: {
    component: OrganizationProjectsPage,
    layout: OrganizationLayout,
    rawContent: true,
  },
  PROJECT_DASHBOARD_PAGE: { component: DashboardPage, layout: ProjectLayout },
  PROJECT_DASHBOARD_ITEM_PAGE: { component: DashboardItemPage, layout: ProjectLayout },
  PROJECT_DASHBOARD_PRINT_PAGE: { component: DashboardPrintPage, layout: EmptyLayout },
  PROJECT_FILTERS_PAGE: { component: FiltersPage, layout: ProjectLayout },
  [LAUNCHES_PAGE]: { component: LaunchesPage, layout: ProjectLayout },
  PROJECT_LAUNCHES_PAGE: { component: LaunchesPage, layout: ProjectLayout },
  PROJECT_MEMBERS_PAGE: { component: ProjectTeamPage, rawContent: true, layout: ProjectLayout },
  PROJECT_SANDBOX_PAGE: { component: SandboxPage, layout: ProjectLayout },
  PROJECT_SETTINGS_PAGE: {
    component: ProjectSettingsPageContainer,
    layout: ProjectLayout,
    rawContent: true,
  },
  PROJECT_SETTINGS_TAB_PAGE: {
    component: ProjectSettingsPageContainer,
    layout: ProjectLayout,
    rawContent: true,
  },
  PROJECT_MILESTONES_PAGE: {
    component: MilestonePage,
    layout: ProjectLayout,
    rawContent: true,
  },
  PROJECT_USERDEBUG_PAGE: { component: LaunchesPage, layout: ProjectLayout },
  PROJECT_USERDEBUG_TEST_ITEM_PAGE: { component: TestItemPage, layout: ProjectLayout },
  ALL_USERS_PAGE: {
    component: AllUsersPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  SERVER_SETTINGS_PAGE: {
    component: ServerSettingsPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  SERVER_SETTINGS_TAB_PAGE: {
    component: ServerSettingsPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  PLUGINS_PAGE: {
    component: PluginsPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  PLUGINS_TAB_PAGE: {
    component: PluginsPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  [TEST_ITEM_PAGE]: { component: TestItemPage, layout: ProjectLayout },
  [PROJECT_LOG_PAGE]: { component: LogsPage, layout: ProjectLayout },
  [PROJECT_USERDEBUG_LOG_PAGE]: { component: LogsPage, layout: ProjectLayout },
  [HISTORY_PAGE]: { component: HistoryPage, layout: ProjectLayout },
  [UNIQUE_ERRORS_PAGE]: { component: UniqueErrorsPage, layout: ProjectLayout },
  [PLUGIN_UI_EXTENSION_ADMIN_PAGE]: {
    component: AdminUiExtensionPage,
    layout: InstanceLayout,
    rawContent: true,
  },
  [PROJECT_PLUGIN_PAGE]: {
    component: ProjectUiExtensionPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [TEST_CASE_LIBRARY_PAGE]: {
    component: TestCaseLibraryPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [TEST_CASE_DETAILS_PAGE]: {
    component: TestCaseDetailsPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [PRODUCT_VERSIONS_PAGE]: {
    component: ProductVersionsPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [PRODUCT_VERSIONS_TAB_PAGE]: {
    component: ProductVersionsPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [PRODUCT_VERSION_PAGE]: {
    component: ProductVersionsPage,
    layout: ProjectLayout,
    rawContent: true,
  },
  [PRODUCT_VERSION_TAB_PAGE]: {
    component: ProductVersionsPage,
    layout: ProjectLayout,
    rawContent: true,
  },
};
