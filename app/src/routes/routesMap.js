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
  userAccountRoleSelector,
  userInfoSelector,
  setActiveProjectAction,
  activeProjectKeySelector,
} from 'controllers/user';
import { fetchProjectAction, projectOrganizationSlugSelector } from 'controllers/project';
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
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  LAUNCHES_PAGE,
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
} from 'controllers/pages';
import { GENERAL, AUTHORIZATION_CONFIGURATION, ANALYTICS } from 'common/constants/settingsTabs';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { INSTALLED, STORE } from 'common/constants/pluginsTabs';
import { SETTINGS, MEMBERS, EVENTS } from 'common/constants/projectSections';
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
import { fetchProjectDataAction } from 'controllers/administrate';
import { fetchAllUsersAction } from 'controllers/administrate/allUsers/actionCreators';
import { fetchLogPageData } from 'controllers/log';
import { fetchHistoryPageInfoAction } from 'controllers/itemsHistory';
import { fetchProjectsAction } from 'controllers/administrate/projects';
import { startSetViewMode } from 'controllers/administrate/projects/actionCreators';
import { SIZE_KEY } from 'controllers/pagination';
import { setSessionItem, updateStorageItem } from 'common/utils/storageUtils';
import { fetchClustersAction } from 'controllers/uniqueErrors';
import { setActiveProjectKeyAction } from 'controllers/user/actionCreators';
import { pageRendering, ANONYMOUS_ACCESS, ADMIN_ACCESS } from './constants';

const redirectRoute = (path, createNewAction, onRedirect = () => {}) => ({
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
  [REGISTRATION_PAGE]: '/registration',
  [OAUTH_SUCCESS]: '/authSuccess',
  [NOT_FOUND]: '/notfound',

  ADMINISTRATE_PAGE: redirectRoute('/administrate', () => ({ type: PROJECTS_PAGE })),
  USER_PROFILE_PAGE: '/user-profile',

  API_PAGE: '/api',

  [PROJECTS_PAGE]: {
    path: '/administrate/projects',
    thunk: (dispatch) => {
      dispatch(fetchProjectsAction());
      dispatch(startSetViewMode());
    },
  },
  [PROJECT_DETAILS_PAGE]: {
    path: `/administrate/projects/:organizationSlug?/:projectKey/:projectSection(${SETTINGS}|${MEMBERS}|${EVENTS})?/:settingsTab?`,
    thunk: (dispatch) => {
      dispatch(fetchProjectDataAction());
    },
  },
  [ALL_USERS_PAGE]: {
    path: '/administrate/users',
    thunk: (dispatch) => dispatch(fetchAllUsersAction()),
  },
  [SERVER_SETTINGS_PAGE]: redirectRoute('/administrate/settings', () => ({
    type: SERVER_SETTINGS_TAB_PAGE,
    payload: { settingsTab: AUTHORIZATION_CONFIGURATION },
  })),
  [SERVER_SETTINGS_TAB_PAGE]: `/administrate/settings/:settingsTab(${AUTHORIZATION_CONFIGURATION}|${ANALYTICS})`,
  [PLUGINS_PAGE]: redirectRoute(
    '/administrate/plugins',
    () => ({
      type: PLUGINS_TAB_PAGE,
      payload: { pluginsTab: INSTALLED },
    }),
    (dispatch) => {
      dispatch(fetchPluginsAction());
      dispatch(fetchGlobalIntegrationsAction());
    },
  ),
  [PLUGINS_TAB_PAGE]: `/administrate/plugins/:pluginsTab(${INSTALLED}|${STORE})`,

  [PROJECT_PAGE]: {
    path: '/:organizationSlug?/:projectKey',
    thunk: (dispatch, getState) => {
      dispatch(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: {
            projectKey: activeProjectKeySelector(getState()),
            organizationSlug: projectOrganizationSlugSelector(getState()),
          },
        }),
      );
    },
  },
  [PROJECT_DASHBOARD_PAGE]: {
    path: '/:organizationSlug?/:projectKey/dashboard',
    thunk: (dispatch) => {
      dispatch(
        fetchDashboardsAction({
          [SIZE_KEY]: 300,
        }),
      );
      dispatch(changeVisibilityTypeAction());
    },
  },
  [PROJECT_DASHBOARD_ITEM_PAGE]: {
    path: '/:organizationSlug?/:projectKey/dashboard/:dashboardId',
    thunk: (dispatch) => {
      dispatch(fetchDashboardAction());
    },
  },
  [PROJECT_DASHBOARD_PRINT_PAGE]: {
    path: '/:organizationSlug?/:projectKey/dashboard/:dashboardId/print',
    thunk: (dispatch) => {
      dispatch(fetchDashboardAction());
    },
  },
  [LAUNCHES_PAGE]: redirectRoute(
    '/:organizationSlug?/:projectKey/launches',
    (payload, getState) => ({
      type: PROJECT_LAUNCHES_PAGE,
      payload: { ...payload, filterId: launchDistinctSelector(getState()) },
    }),
    (dispatch) => {
      dispatch(unselectAllLaunchesAction());
    },
  ),
  [PROJECT_LAUNCHES_PAGE]: {
    path: '/:organizationSlug?/:projectKey/launches/:filterId',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(setLevelAction(''));
      dispatch(fetchLaunchesAction());
    },
  },
  [HISTORY_PAGE]: {
    path: '/:organizationSlug?/:projectKey/launches/:filterId/:testItemIds+/history',
    thunk: (dispatch) => {
      dispatch(fetchHistoryPageInfoAction());
    },
  },
  [UNIQUE_ERRORS_PAGE]: {
    path: '/:organizationSlug?/:projectKey/launches/:filterId/:testItemIds+/uniqueErrors',
    thunk: (dispatch) => {
      dispatch(fetchClustersAction());
    },
  },
  PROJECT_FILTERS_PAGE: {
    path: '/:organizationSlug?/:projectKey/filters',
    thunk: (dispatch, getState, { action }) => {
      const location = (action.meta || {}).location || {};
      dispatch(fetchFiltersPageAction(location.kind !== 'load'));
    },
  },
  [PROJECT_LOG_PAGE]: {
    path: '/:organizationSlug?/:projectKey/launches/:filterId/:testItemIds+/log',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(fetchLogPageData());
    },
  },
  [PROJECT_USERDEBUG_LOG_PAGE]: {
    path: '/:organizationSlug?/:projectKey/userdebug/:filterId/:testItemIds+/log',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(fetchLogPageData());
    },
  },
  [PROJECT_USERDEBUG_PAGE]: {
    path: '/:organizationSlug?/:projectKey/userdebug/:filterId',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(setLevelAction(''));
      dispatch(fetchLaunchesAction());
    },
  },
  PROJECT_USERDEBUG_TEST_ITEM_PAGE: {
    path: '/:organizationSlug?/:projectKey/userdebug/:filterId/:testItemIds+',
    thunk: (dispatch) => {
      dispatch(setDebugMode(true));
      dispatch(fetchTestItemsAction());
    },
  },
  PROJECT_MEMBERS_PAGE: {
    path: '/:organizationSlug?/:projectKey/members',
    thunk: (dispatch) => dispatch(fetchMembersAction()),
  },
  PROJECT_SETTINGS_PAGE: redirectRoute('/:organizationSlug?/:projectKey/settings', (payload) => ({
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { ...payload, settingsTab: GENERAL },
  })),
  [PROJECT_SETTINGS_TAB_PAGE]: `/:organizationSlug?/:projectKey/settings/:settingsTab/:subTab*`,
  PROJECT_SANDBOX_PAGE: '/:organizationSlug?/:projectKey/sandbox',
  [TEST_ITEM_PAGE]: {
    path: '/:organizationSlug?/:projectKey/launches/:filterId/:testItemIds+',
    thunk: (dispatch) => {
      dispatch(setDebugMode(false));
      dispatch(fetchTestItemsAction());
    },
  },
  [PLUGIN_UI_EXTENSION_ADMIN_PAGE]: '/administrate/plugin/:pluginPage/:pluginRoute*',
};

export const onBeforeRouteChange = (dispatch, getState, { action }) => {
  const {
    type: nextPageType,
    payload: { projectKey: hashProjectKey, organizationSlug: hashOrganization },
  } = action;
  let projectKey = activeProjectKeySelector(getState());
  let organizationSlug = projectOrganizationSlugSelector(getState());
  const currentPageType = pageSelector(getState());
  const authorized = isAuthorizedSelector(getState());
  const accountRole = userAccountRoleSelector(getState());
  const userInfo = userInfoSelector(getState());
  const userProjects = userInfo.assignedProjects ?? {};
  const isAdminNewPageType = !!adminPageNames[nextPageType];
  const isAdminCurrentPageType = !!adminPageNames[currentPageType];
  const nextProjectName = userProjects[hashProjectKey]?.projectName;
  const isProjectKeyExist = hashProjectKey in userProjects;

  if (
    hashProjectKey &&
    userProjects &&
    (hashProjectKey !== projectKey || isAdminCurrentPageType) &&
    !isAdminNewPageType
  ) {
    if (isProjectKeyExist) {
      dispatch(setActiveProjectAction(nextProjectName));
      dispatch(setActiveProjectKeyAction(hashProjectKey));
      dispatch(fetchProjectAction(hashProjectKey));
      projectKey = hashProjectKey;
      organizationSlug = hashOrganization;
    } else if (hashProjectKey !== projectKey) {
      dispatch(
        redirect({
          ...action,
          payload: { ...action.payload, projectKey, organizationSlug },
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
    const { access } = page;
    switch (access) {
      case ANONYMOUS_ACCESS:
        if (authorized) {
          dispatch(
            redirect({
              type: PROJECT_DASHBOARD_PAGE,
              payload: {
                projectKey,
                organizationSlug,
              },
            }),
          );
        }
        break;
      case ADMIN_ACCESS:
        if (authorized && accountRole !== ADMINISTRATOR) {
          dispatch(
            redirect({
              type: PROJECT_DASHBOARD_PAGE,
              payload: { projectId: projectKey, organizationSlug },
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
          updateStorageItem(`${userInfo.userId}_settings`, {
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
          updateStorageItem(`${userInfo.userId}_settings`, {
            lastPath: redirectPath,
          });
        }
    }
  }
};
export default routesMap;
