import { fetchAPI, getStorageItem, setStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import { tokenSelector } from 'controllers/auth';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_API_TOKEN,
} from './constants';
import { userInfoSelector } from './selectors';

const fetchUserSuccessAction = (user) => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const setActiveProjectAction = (project) => (dispatch, getState) => {
  const user = userInfoSelector(getState());
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, { ...currentUserSettings, activeProject: project });
  dispatch({
    type: SET_ACTIVE_PROJECT,
    payload: project,
  });
};

export const generateApiTokenAction = () => (dispatch, getState) =>
  fetchAPI(URLS.apiToken(), tokenSelector(getState()), { method: 'post' }).then((result) => {
    dispatch({ type: SET_API_TOKEN, payload: `${result.token_type} ${result.access_token}` });
  });

export const fetchApiTokenAction = () => (dispatch, getState) =>
  fetchAPI(URLS.apiToken(), tokenSelector(getState()), { method: 'get' })
    .then((result) => {
      dispatch({ type: SET_API_TOKEN, payload: `${result.token_type} ${result.access_token}` });
    })
    .catch(() => dispatch(generateApiTokenAction()));

export const fetchUserAction = () => (dispatch, getState) =>
  fetchAPI(URLS.user(), tokenSelector(getState())).then((user) => {
    const userSettings = getStorageItem(`${user.userId}_settings`) || {};
    const savedActiveProject = userSettings.activeProject;
    const activeProject =
      savedActiveProject &&
      Object.prototype.hasOwnProperty.call(user.assignedProjects, savedActiveProject)
        ? savedActiveProject
        : user.defaultProject;
    dispatch(fetchApiTokenAction());
    dispatch(fetchUserSuccessAction(user));
    dispatch(setActiveProjectAction(activeProject));
    return { user, activeProject };
  });

export const setStartTimeFormatAction = (format) => ({
  type: SET_START_TIME_FORMAT,
  payload: format,
});
