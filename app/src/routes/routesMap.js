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

import { redirect, actionToPath } from 'redux-first-router';
import qs from 'qs';
import {
  activeProjectSelector,
  userInfoSelector,
  setActiveProjectAction,
  setActiveProjectKeyAction,
  activeProjectKeySelector,
} from 'controllers/user';
import { isTmsEnabled } from 'controllers/appInfo';
import { fetchProjectAction } from 'controllers/project';
import {
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  PROJECT_USERDEBUG_PAGE,
  HISTORY_PAGE,
  UNIQUE_ERRORS_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  LAUNCHES_PAGE,
  MANUAL_LAUNCHES_PAGE,
  MANUAL_LAUNCH_DETAILS_PAGE,
  PROJECT_LAUNCHES_PAGE,
  PLUGINS_PAGE,
  PLUGINS_TAB_PAGE,
  NOT_FOUND,
  OAUTH_SUCCESS,
  HOME_PAGE,
  TEST_ITEM_PAGE,
  pageSelector,
  clearPageStateAction,
  adminPageNames,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  ACCOUNT_REMOVED_PAGE,
  PROJECT_PLUGIN_PAGE,
  userAssignedSelector,
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATION_USERS_PAGE,
  ORGANIZATION_SETTINGS_PAGE,
  ORGANIZATION_SETTINGS_TAB_PAGE,
  USER_PROFILE_PAGE,
  USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_PAGE_PROJECT_LEVEL,
  USER_PROFILE_SUB_PAGE,
  USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
  ORGANIZATIONS_PAGE,
  ORGANIZATIONS_ACTIVITY_PAGE,
  PRODUCT_VERSIONS_TAB_PAGE,
  PRODUCT_VERSIONS_PAGE,
  TEST_CASE_LIBRARY_PAGE,
} from 'controllers/pages';
import {
  GENERAL,
  AUTHORIZATION_CONFIGURATION,
  ANALYTICS,
  LINKS_AND_BRANDING,
  FEATURES,
} from 'common/constants/settingsTabs';
import { INSTALLED, STORE } from 'common/constants/pluginsTabs';
import { ANONYMOUS_REDIRECT_PATH_STORAGE_KEY, isAuthorizedSelector } from 'controllers/auth';
import {
  fetchDashboardsAction,
  fetchDashboardAction,
  changeVisibilityTypeAction,
} from 'controllers/dashboard';
import {
  fetchLaunchesAction,
  setDebugMode,
  unselectAllLaunchesAction,
  launchDistinctSelector,
} from 'controllers/launch';
import { fetchPluginsAction, fetchGlobalIntegrationsAction } from 'controllers/plugins';
import { fetchTestItemsAction, setLevelAction } from 'controllers/testItem';
import { fetchFiltersPageAction } from 'controllers/filter';
import { fetchMembersAction } from 'controllers/members';
import { fetchAllUsersAction } from 'controllers/instance/allUsers/actionCreators';
import { fetchLogPageData } from 'controllers/log';
import { fetchHistoryPageInfoAction } from 'controllers/itemsHistory';
import { setSessionItem, updateStorageItem } from 'common/utils/storageUtils';
import { fetchClustersAction } from 'controllers/uniqueErrors';
import {
  GET_TEST_CASE_DETAILS,
  getFoldersAction,
  needsToLoadFoldersSelector,
} from 'controllers/testCase';
import {
  API_KEYS_ROUTE,
  CONFIG_EXAMPLES_ROUTE,
  ASSIGNMENTS_ROUTE,
} from 'common/constants/userProfileRoutes';
import { parseQueryToFilterEntityAction } from 'controllers/filter/actionCreators';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';
import {
  fetchOrganizationBySlugAction,
  prepareActiveOrganizationProjectsAction,
  prepareActiveOrganizationSettingsAction,
} from 'controllers/organization/actionCreators';
import { prepareActiveOrganizationUsersAction } from 'controllers/organization/users';
import { LIST_OF_VERSIONS } from 'pages/inside/productVersionsPage/constants';
import {
  PRODUCT_VERSION_PAGE,
  PRODUCT_VERSION_TAB_PAGE,
  PROJECT_TEST_PLANS_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
} from 'controllers/pages/constants';
import { DOCUMENTATION } from 'pages/inside/productVersionPage/constants';
import { pageRendering, ANONYMOUS_ACCESS, ADMIN_ACCESS } from './constants';
import { fetchOrganizationEventsDataAction } from 'controllers/instance/actionCreators';
import { canSeeActivityOption } from 'common/utils/permissions';
import {
  getTestPlansAction,
  getTestPlanAction,
  defaultQueryParams,
  TEST_PLANS_NAMESPACE,
  TEST_PLAN_TEST_CASES_NAMESPACE,
  defaultTestPlanTestCasesQueryParams,
} from 'controllers/testPlan';
import {
  MANUAL_LAUNCHES_NAMESPACE,
  defaultManualLaunchesQueryParams,
  getManualLaunchesAction,
  getManualLaunchAction,
} from 'controllers/manualLaunch';
import { getRouterParams } from 'common/utils';

const redirectRoute = (path, createNewAction, onRedirect = () => { }) => ({
  path,
  thunk: (dispatch, getState) => {
    const { location } = getState();
    const newAction = createNewAction(location.payload, getState);
    onRedirect(dispatch);
    dispatch(redirect(newAction));
  },
});

const routesMap = {
  [HOME_PAGE]: redirectRoute('/', (payload) => ({ type: LOGIN_PAGE, payload })),

  [LOGIN_PAGE]: '/login',
  [ACCOUNT_REMOVED_PAGE]: '/accountRemoved',
  [REGISTRATION_PAGE]: '/registration',
  [OAUTH_SUCCESS]: '/authSuccess',
  [NOT_FOUND]: '/notfound',

  [USER_PROFILE_PAGE]: redirectRoute('/userProfile', () => ({
    type: USER_PROFILE_SUB_PAGE,
    payload: { profileRoute: ASSIGNMENTS_ROUTE },
  })),

  [USER_PROFILE_SUB_PAGE]: `/userProfile/:profileRoute(${ASSIGNMENTS_ROUTE}|${API_KEYS_ROUTE}|${CONFIG_EXAMPLES_ROUTE})`,

  [USER_PROFILE_PAGE_ORGANIZATION_LEVEL]: redirectRoute(
    '/organizations/:organizationSlug/userProfile',
    ({ organizationSlug }) => ({
      type: USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
      payload: { organizationSlug, profileRoute: ASSIGNMENTS_ROUTE },
    }),
  ),

  [USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL]: `/organizations/:organizationSlug/userProfile/:profileRoute(${ASSIGNMENTS_ROUTE}|${API_KEYS_ROUTE}|${CONFIG_EXAMPLES_ROUTE})`,

  [USER_PROFILE_PAGE_PROJECT_LEVEL]: redirectRoute(
    '/organizations/:organizationSlug/projects/:projectSlug/userProfile',
    (payload) => ({
      type: USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
      payload: { ...payload, profileRoute: ASSIGNMENTS_ROUTE },
    }),
  ),

  [USER_PROFILE_SUB_PAGE_PROJECT_LEVEL]: `/organizations/:organizationSlug/projects/:projectSlug/userProfile/:profileRoute(${ASSIGNMENTS_ROUTE}|${API_KEYS_ROUTE}|${CONFIG_EXAMPLES_ROUTE})`,

  API_PAGE_INSTANCE_LEVEL: '/api',
  API_PAGE_ORGANIZATION_LEVEL: '/organizations/:organizationSlug/api',
  API_PAGE_PROJECT_LEVEL: '/organizations/:organizationSlug/projects/:projectSlug/api',

  [ALL_USERS_PAGE]: {
    path: '/users',
    thunk: (dispatch) => dispatch(fetchAllUsersAction()),
  },
  [SERVER_SETTINGS_PAGE]: redirectRoute('/settings', () => ({
    type: SERVER_SETTINGS_TAB_PAGE,
    payload: { settingsTab: AUTHORIZATION_CONFIGURATION },
  })),
  [SERVER_SETTINGS_TAB_PAGE]: `/settings/:settingsTab(${AUTHORIZATION_CONFIGURATION}|${FEATURES}|${ANALYTICS}|${LINKS_AND_BRANDING})`,
  [PLUGINS_PAGE]: redirectRoute(
    '/plugins',
    () => ({
      type: PLUGINS_TAB_PAGE,
      payload: { pluginsTab: INSTALLED },
    }),
    (dispatch) => {
      dispatch(fetchPluginsAction());
      dispatch(fetchGlobalIntegrationsAction());
    },
  ),
  [PLUGINS_TAB_PAGE]: `/plugins/:pluginsTab(${INSTALLED}|${STORE})`,

  [ORGANIZATIONS_PAGE]: {
    path: '/organizations',
    thunk: (dispatch) => {
      dispatch(fetchFilteredOrganizationsAction());
    },
  },

  [ORGANIZATIONS_ACTIVITY_PAGE]: {
    path: '/organizations/:organizationSlug/activity',
    thunk: (dispatch, getState) => {
      const state = getState();
      const hasAccess = canSeeActivityOption({ userRole: state.user.info.userRole });

      if (!hasAccess) {
        return dispatch({
          type: ORGANIZATIONS_PAGE,
        });
      }

      dispatch(fetchOrganizationEventsDataAction());
    },
  },

  [ORGANIZATION_PROJECTS_PAGE]: {
    path: '/organizations/:organizationSlug/projects',
    thunk: (dispatch, getState) => {
      const {
        location: { payload },
      } = getState();
      dispatch(prepareActiveOrganizationProjectsAction(payload));
    },
  },

  [ORGANIZATION_USERS_PAGE]: {
    path: '/organizations/:organizationSlug/users',
    thunk: (dispatch, getState) => {
      const {
        location: { payload },
      } = getState();
      dispatch(prepareActiveOrganizationUsersAction(payload));
    },
  },

  [ORGANIZATION_SETTINGS_PAGE]: redirectRoute(
    '/organizations/:organizationSlug/settings',
    (payload) => ({
      type: ORGANIZATION_SETTINGS_TAB_PAGE,
      payload: { ...payload, settingsTab: GENERAL },
    }),
  ),

  [ORGANIZATION_SETTINGS_TAB_PAGE]: {
    path: `/organizations/:organizationSlug/settings/:settingsTab/:subTab*`,
    thunk: (dispatch, getState) => {
      const {
        location: { payload },
      } = getState();
      dispatch(prepareActiveOrganizationSettingsAction(payload));
    },
  },

  [PROJECT_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug',
    thunk: (dispatch, getState) => {
      const state = getState();
      dispatch(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: {
            organizationSlug: state.location.payload.organizationSlug,
            projectSlug: state.location.payload.projectSlug,
          },
        }),
      );
    },
  },
  [PROJECT_DASHBOARD_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/dashboard',
    thunk: (dispatch) => {
      dispatch(fetchDashboardsAction());
      dispatch(changeVisibilityTypeAction());
    },
  },
  [PROJECT_DASHBOARD_ITEM_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/dashboard/:dashboardId',
    thunk: (dispatch) => {
      dispatch(fetchDashboardAction());
    },
  },
  [PROJECT_DASHBOARD_PRINT_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/dashboard/:dashboardId/print',
    thunk: (dispatch) => {
      dispatch(fetchDashboardAction());
    },
  },
  [LAUNCHES_PAGE]: redirectRoute(
    '/organizations/:organizationSlug/projects/:projectSlug/launches',
    (payload, getState) => ({
      type: PROJECT_LAUNCHES_PAGE,
      payload: { ...payload, filterId: launchDistinctSelector(getState()) },
    }),
    (dispatch) => {
      dispatch(unselectAllLaunchesAction());
    },
  ),
  [MANUAL_LAUNCHES_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/manualLaunches',
    thunk: (dispatch, getState) => {
      const state = getState();
      const { offset, limit } = getRouterParams({
        namespace: MANUAL_LAUNCHES_NAMESPACE,
        defaultParams: defaultManualLaunchesQueryParams,
        state,
      });

      dispatch(getManualLaunchesAction({ offset, limit }));
    },
  },
  [MANUAL_LAUNCH_DETAILS_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/manualLaunches/:launchId',
    thunk: (dispatch, getState) => {
      const state = getState();
      const launchId = state.location?.payload?.launchId;

      if (launchId) {
        dispatch(getManualLaunchAction({ launchId }));
      }
    },
  },
  [PROJECT_LAUNCHES_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/launches/:filterId',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(setLevelAction(''));
      dispatch(parseQueryToFilterEntityAction());
    },
  },
  [HISTORY_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/launches/:filterId/:testItemIds+/history',
    thunk: (dispatch) => {
      dispatch(fetchHistoryPageInfoAction());
    },
  },
  [UNIQUE_ERRORS_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/launches/:filterId/:testItemIds+/uniqueErrors',
    thunk: (dispatch) => {
      dispatch(fetchClustersAction());
    },
  },
  PROJECT_FILTERS_PAGE: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/filters',
    thunk: (dispatch, getState, { action }) => {
      const location = action.meta?.location || {};
      dispatch(fetchFiltersPageAction(location.kind !== 'load'));
    },
  },
  [PROJECT_LOG_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/launches/:filterId/:testItemIds+/log',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(fetchLogPageData());
    },
  },
  [PROJECT_USERDEBUG_LOG_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/userdebug/:filterId/:testItemIds+/log',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(fetchLogPageData());
    },
  },
  [PROJECT_USERDEBUG_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/userdebug/:filterId',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(setLevelAction(''));
      dispatch(fetchLaunchesAction());
    },
  },
  PROJECT_USERDEBUG_TEST_ITEM_PAGE: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/userdebug/:filterId/:testItemIds+',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(fetchTestItemsAction());
    },
  },
  PROJECT_MEMBERS_PAGE: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/members',
    thunk: (dispatch) => dispatch(fetchMembersAction()),
  },
  PROJECT_SETTINGS_PAGE: redirectRoute(
    '/organizations/:organizationSlug/projects/:projectSlug/settings',
    (payload) => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { ...payload, settingsTab: GENERAL },
    }),
  ),
  [PROJECT_SETTINGS_TAB_PAGE]: {
    path: `/organizations/:organizationSlug/projects/:projectSlug/settings/:settingsTab/:subTab*`,
    thunk: (dispatch, getState) => {
      const {
        location: { payload },
      } = getState();
      dispatch(prepareActiveOrganizationSettingsAction(payload));
    },
  },
  PROJECT_SANDBOX_PAGE: '/organizations/:organizationSlug/projects/:projectSlug/sandbox',
  [TEST_ITEM_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/launches/:filterId/:testItemIds+',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(fetchTestItemsAction());
    },
  },
  [PLUGIN_UI_EXTENSION_ADMIN_PAGE]: '/plugin/:pluginPage/:pluginRoute*',
  [PROJECT_PLUGIN_PAGE]:
    '/organizations/:organizationSlug/projects/:projectSlug/plugin/:pluginPage/:pluginRoute*',
  [TEST_CASE_LIBRARY_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/testLibrary/:testCasePageRoute*',
    thunk: (dispatch, getState) => {
      const state = getState();
      const match = state.location.payload?.testCasePageRoute?.match(/test-cases\/(\d+)/);
      const testCaseId = match ? match[1] : null;

      if (testCaseId) {
        dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
      }

      // Only dispatch getFoldersAction if folders are not already loaded
      if (needsToLoadFoldersSelector(state)) {
        dispatch(getFoldersAction());
      }
    },
  },
  [PRODUCT_VERSIONS_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/productVersions',
    thunk: (dispatch, getState) => {
      const { location } = getState();
      dispatch(
        redirect({
          type: PRODUCT_VERSIONS_TAB_PAGE,
          payload: { ...location.payload, subPage: LIST_OF_VERSIONS },
        }),
      );
    },
  },
  [PRODUCT_VERSIONS_TAB_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/productVersions/:subPage',
  },
  [PRODUCT_VERSION_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/productVersions/listOfVersions/:productVersionId',
    thunk: (dispatch, getState) => {
      const { location } = getState();
      dispatch(
        redirect({
          type: PRODUCT_VERSION_TAB_PAGE,
          payload: { ...location.payload, productVersionTab: DOCUMENTATION },
        }),
      );
    },
  },
  [PRODUCT_VERSION_TAB_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/productVersions/listOfVersions/:productVersionId/:productVersionTab',
  },

  [PROJECT_TEST_PLANS_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/milestones',
    thunk: (dispatch, getState) => {
      const state = getState();
      const { offset, limit } = getRouterParams({
        namespace: TEST_PLANS_NAMESPACE,
        defaultParams: defaultQueryParams,
        state,
      });

      dispatch(getTestPlansAction({ offset, limit }));
    },
  },
  [PROJECT_TEST_PLAN_DETAILS_PAGE]: {
    path: '/organizations/:organizationSlug/projects/:projectSlug/milestones/:testPlanId',
    thunk: (dispatch, getState) => {
      const state = getState();
      const testPlanId = state.location?.payload?.testPlanId;
      const { offset, limit } = getRouterParams({
        namespace: TEST_PLAN_TEST_CASES_NAMESPACE,
        defaultParams: defaultTestPlanTestCasesQueryParams,
        state,
      });

      dispatch(getTestPlanAction({ testPlanId, offset, limit }));
    },
  },
};

export const onBeforeRouteChange = (dispatch, getState, { action }) => {
  const {
    type: nextPageType,
    payload: { organizationSlug: hashOrganizationSlug, projectSlug: hashProjectSlug },
  } = action;

  let { organizationSlug, projectSlug } = activeProjectSelector(getState());
  const hashProjectKey = activeProjectKeySelector(getState());
  const currentPageType = pageSelector(getState());
  const authorized = isAuthorizedSelector(getState());
  const userId = userInfoSelector(getState())?.userId;
  const {
    isAdmin,
    hasPermission,
    assignedProjectKey,
    assignmentNotRequired,
    isAssignedToTargetOrganization,
  } = userAssignedSelector(hashProjectSlug, hashOrganizationSlug)(getState());

  const isAdminNewPageType = !!adminPageNames[nextPageType];
  const isAdminCurrentPageType = !!adminPageNames[currentPageType];

  const projectKey = assignedProjectKey || (assignmentNotRequired && hashProjectKey);

  const isChangedProject =
    organizationSlug !== hashOrganizationSlug || projectSlug !== hashProjectSlug;

  if (hashOrganizationSlug && (isChangedProject || isAdminCurrentPageType) && !isAdminNewPageType) {
    if (hashProjectSlug && hasPermission) {
      dispatch(
        setActiveProjectAction({
          organizationSlug: hashOrganizationSlug,
          projectSlug: hashProjectSlug,
        }),
      );
      dispatch(setActiveProjectKeyAction(projectKey));
      dispatch(fetchProjectAction(projectKey));
      dispatch(fetchOrganizationBySlugAction(hashOrganizationSlug));

      organizationSlug = hashOrganizationSlug;
      projectSlug = hashProjectSlug;
    } else if (!hashProjectSlug && (isAssignedToTargetOrganization || assignmentNotRequired)) {
      dispatch(fetchOrganizationBySlugAction(hashOrganizationSlug));

      organizationSlug = hashOrganizationSlug;
    } else if (isChangedProject) {
      dispatch(
        redirect({
          ...action,
          payload: { ...action.payload, organizationSlug, projectSlug },
          meta: {},
        }),
      );
    }
  }

  if (nextPageType !== currentPageType) {
    dispatch(clearPageStateAction(currentPageType, nextPageType));
  }

  const page = pageRendering[nextPageType];
  const redirectPath = actionToPath(action, routesMap, qs);

  if (page) {
    const { access, isTMS = false } = page;

    if (isTMS && !isTmsEnabled(getState())) {
      dispatch(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: { organizationSlug, projectSlug },
        }),
      );

      return;
    }

    switch (access) {
      case ANONYMOUS_ACCESS:
        if (authorized) {
          dispatch(
            redirect({
              type: PROJECT_DASHBOARD_PAGE,
              payload: { organizationSlug, projectSlug },
            }),
          );
        }
        break;
      case ADMIN_ACCESS:
        if (authorized && !isAdmin) {
          dispatch(
            redirect({
              type: ORGANIZATIONS_PAGE,
            }),
          );
        } else if (!authorized) {
          setSessionItem(ANONYMOUS_REDIRECT_PATH_STORAGE_KEY, redirectPath);
          dispatch(
            redirect({
              type: LOGIN_PAGE,
            }),
          );
        } else {
          updateStorageItem(`${userId}_settings`, {
            lastPath: redirectPath,
          });
        }
        break;
      default:
        if (!authorized) {
          setSessionItem(ANONYMOUS_REDIRECT_PATH_STORAGE_KEY, redirectPath);
          dispatch(
            redirect({
              type: LOGIN_PAGE,
              meta: {
                query: { redirectPath },
              },
            }),
          );
        } else {
          updateStorageItem(`${userId}_settings`, {
            lastPath: redirectPath,
          });
        }
    }
  }
};

export default routesMap;
