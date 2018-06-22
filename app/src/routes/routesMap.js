import { redirect } from 'redux-first-router';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import {
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_SUITES_PAGE,
  PROJECT_TESTS_PAGE,
  projectIdSelector,
  launchIdSelector,
  suiteIdSelector,
} from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';
import { fetchDashboardAction, changeVisibilityTypeAction } from 'controllers/dashboard';
import { fetchLaunchAction } from 'controllers/launch';
import { fetchSuiteAction } from 'controllers/suite';

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
  PROJECT_LAUNCHES_PAGE: '/:projectId/launches/:filterId?',
  [PROJECT_SUITES_PAGE]: {
    path: '/:projectId/launches/:filterId/launch/:launchId',
    thunk: (dispatch, getState) => {
      const launchId = launchIdSelector(getState());
      dispatch(fetchLaunchAction(launchId));
    },
  },
  [PROJECT_TESTS_PAGE]: {
    path: '/:projectId/launches/:filterId/launch/:launchId/suite/:suiteId',
    thunk: (dispatch, getState) => {
      const launchId = launchIdSelector(getState());
      const suiteId = suiteIdSelector(getState());
      dispatch(fetchLaunchAction(launchId));
      dispatch(fetchSuiteAction(suiteId));
    },
  },
  PROJECT_FILTERS_PAGE: '/:projectId/filters',
  PROJECT_USERDEBUG_PAGE: '/:projectId/userdebug',
  PROJECT_MEMBERS_PAGE: '/:projectId/members',
  PROJECT_SETTINGS_PAGE: '/:projectId/settings',
  PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
};
