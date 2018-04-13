import { redirect } from 'redux-first-router';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import {
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PAGE,
} from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';

const redirectRoute = (path, createNewAction) => ({
  path,
  thunk: (dispatch, getState) => {
    const { location } = getState();
    const action = createNewAction(location.payload);
    dispatch(redirect(action));
  },
});

const requiresAnonymous = ({ type }) => {
  switch (type) {
    case LOGIN_PAGE:
    case REGISTRATION_PAGE:
      return true;
    default:
      return false;
  }
};

const requiresAuthorized = (action) => !requiresAnonymous(action);

export const onBeforeRouteChange = (dispatch, getState, { action }) => {
  const authorized = isAuthorizedSelector(getState());
  if (authorized) {
    const projectId = activeProjectSelector(getState());
    if (requiresAnonymous(action)) {
      dispatch(redirect({ type: PROJECT_PAGE, payload: { projectId } }));
    } else {
      const hashProject = projectId;
      const userProjects = userInfoSelector(getState()).assigned_projects;
      if (
        userProjects &&
        Object.prototype.hasOwnProperty.call(userProjects, hashProject) &&
        hashProject !== activeProjectSelector(getState())
      ) {
        dispatch(setActiveProjectAction(hashProject));
        dispatch(fetchProjectAction(hashProject));
      }
    }
  } else if (requiresAuthorized(action)) {
    if (action.type !== LOGIN_PAGE) {
      dispatch(redirect({ type: LOGIN_PAGE }));
    }
  }
};

export default {
  HOME_PAGE: redirectRoute('/', (payload) => ({ type: LOGIN_PAGE, payload })),

  LOGIN_PAGE: '/login',
  REGISTRATION_PAGE: '/registration',

  ADMINISTRATE_PAGE: '/administrate',
  USER_PROFILE_PAGE: '/user-profile',

  API_PAGE: '/api',

  PROJECT_PAGE: redirectRoute('/:projectId', () => ({
    type: PROJECT_DASHBOARD_PAGE,
    payload: { projectId: 'default_project' },
  })),
  PROJECT_DASHBOARD_PAGE: '/:projectId/dashboard',
  PROJECT_LAUNCHES_PAGE: '/:projectId/launches',
  PROJECT_FILTERS_PAGE: '/:projectId/filters',
  PROJECT_USERDEBUG_PAGE: '/:projectId/userdebug',
  PROJECT_MEMBERS_PAGE: '/:projectId/members',
  PROJECT_SETTINGS_PAGE: '/:projectId/settings',
  PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
};
