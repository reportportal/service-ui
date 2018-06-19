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
  projectIdSelector,
} from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';
import { fetchDashboardAction, changeVisibilityTypeAction } from 'controllers/dashboard';

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

  [PROJECT_PAGE]: redirectRoute('/:projectId', (payload) => ({
    type: PROJECT_DASHBOARD_PAGE,
    payload: { projectId: payload.projectId || 'default_project' },
  })),
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
  [PROJECT_SUITES_PAGE]: '/:projectId/launches/:filterId/suites/:suiteId',
  PROJECT_FILTERS_PAGE: '/:projectId/filters',
  PROJECT_USERDEBUG_PAGE: '/:projectId/userdebug',
  PROJECT_MEMBERS_PAGE: '/:projectId/members',
  PROJECT_SETTINGS_PAGE: '/:projectId/settings',
  PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
};
