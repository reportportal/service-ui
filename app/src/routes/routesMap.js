import { redirect } from 'redux-first-router';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import {
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_SETTINGS_TAB_PAGE,
  projectIdSelector,
} from 'controllers/pages';
import { GENERAL } from 'common/constants/settingTabs';
import { isAuthorizedSelector } from 'controllers/auth';
import { fetchDashboardAction, changeVisibilityTypeAction } from 'controllers/dashboard';
import { fetchLaunchesAction } from 'controllers/launch';
import { TEST_ITEM_PAGE } from 'controllers/pages/constants';
import { fetchTestItemsAction, setLevelAction } from 'controllers/testItem';
import { fetchFiltersAction } from 'controllers/filter';
import { fetchMembersAction } from 'controllers/members';

const redirectRoute = (path, createNewAction) => ({
  path,
  thunk: (dispatch, getState) => {
    const { location } = getState();
    const newAction = createNewAction(location.payload);
    dispatch(redirect(newAction));
  },
});

export const onBeforeRouteChange = (dispatch, getState, { action }) => {
  const authorized = isAuthorizedSelector(getState());
  if (!authorized) {
    return;
  }

  const { projectId: hashProject } = action.payload;
  if (!hashProject) {
    return;
  }

  const activeProjectId = activeProjectSelector(getState());
  const userInfo = userInfoSelector(getState());
  const userProjects = userInfo ? userInfo.assigned_projects : {};
  if (
    userProjects &&
    Object.prototype.hasOwnProperty.call(userProjects, hashProject) &&
    hashProject !== activeProjectId
  ) {
    dispatch(setActiveProjectAction(hashProject));
    dispatch(fetchProjectAction(hashProject));
  }
};

export default {
  HOME_PAGE: redirectRoute('/', (payload) => ({ type: LOGIN_PAGE, payload })),

  [LOGIN_PAGE]: '/login',
  [REGISTRATION_PAGE]: '/registration',

  ADMINISTRATE_PAGE: '/administrate',
  USER_PROFILE_PAGE: '/user-profile',

  API_PAGE: '/api',

  [PROJECT_PAGE]: {
    path: '/:projectId',
    thunk: (dispatch, getState) => {
      dispatch(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: {
            projectId: activeProjectSelector(getState()),
          },
        }),
      );
    },
  },
  [PROJECT_DASHBOARD_PAGE]: {
    path: '/:projectId/dashboard',
    thunk: (dispatch, getState) => {
      const authorized = isAuthorizedSelector(getState());
      if (!authorized) {
        return;
      }
      const projectId = projectIdSelector(getState());
      dispatch(fetchDashboardAction(projectId));
      dispatch(changeVisibilityTypeAction());
    },
  },
  [PROJECT_DASHBOARD_ITEM_PAGE]: '/:projectId/dashboard/:dashboardId',
  PROJECT_LAUNCHES_PAGE: {
    path: '/:projectId/launches/:filterId?',
    thunk: (dispatch) => {
      dispatch(setLevelAction(''));
      dispatch(fetchLaunchesAction());
    },
  },
  PROJECT_FILTERS_PAGE: {
    path: '/:projectId/filters',
    thunk: (dispatch) => dispatch(fetchFiltersAction()),
  },
  PROJECT_USERDEBUG_PAGE: '/:projectId/userdebug',
  PROJECT_MEMBERS_PAGE: {
    path: '/:projectId/members',
    thunk: (dispatch) => dispatch(fetchMembersAction()),
  },
  PROJECT_SETTINGS_PAGE: redirectRoute('/:projectId/settings', (payload) => ({
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { ...payload, settingTab: GENERAL },
  })),
  PROJECT_SETTINGS_TAB_PAGE: '/:projectId/settings/:settingTab',
  PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
  [TEST_ITEM_PAGE]: {
    path: '/:projectId/launches/:filterId/:testItemIds+',
    thunk: (dispatch) => dispatch(fetchTestItemsAction()),
  },
};
