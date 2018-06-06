import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_USER_TOKEN,
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

export const fetchNewUserTokenAction = () => (dispatch) =>
  fetch(URLS.getUUID(), { method: 'post' }).then((res) => {
    dispatch({ type: SET_USER_TOKEN, payload: res.access_token });
  });

export const fetchUserTokenAction = () => (dispatch) =>
  fetch(URLS.getUUID(), { method: 'get' })
    .then((res) => {
      dispatch({ type: SET_USER_TOKEN, payload: res.access_token });
    })
    .catch(() => dispatch(fetchNewUserTokenAction()));

export const fetchUserAction = () => (dispatch) =>
  fetch(URLS.user()).then((user) => {
    const userSettings = getStorageItem(`${user.userId}_settings`) || {};
    const savedActiveProject = userSettings.activeProject;
    const activeProject =
      savedActiveProject &&
      Object.prototype.hasOwnProperty.call(user.assigned_projects, savedActiveProject)
        ? savedActiveProject
        : user.default_project;
    dispatch(fetchUserTokenAction());
    dispatch(fetchUserSuccessAction(user));
    dispatch(setActiveProjectAction(activeProject));
    return { user, activeProject };
  });

export const setStartTimeFormatAction = (format) => ({
  type: SET_START_TIME_FORMAT,
  payload: format,
});
