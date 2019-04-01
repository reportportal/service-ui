import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_API_TOKEN,
  SET_PHOTO_TIME_STAMP,
  ASSIGN_TO_RROJECT,
  ASSIGN_TO_RROJECT_SUCCESS,
  ASSIGN_TO_RROJECT_ERROR,
  UNASSIGN_FROM_PROJECT,
  UNASSIGN_FROM_PROJECT_SUCCESS,
} from './constants';
import { userInfoSelector } from './selectors';

const fetchUserSuccessAction = (user) => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const setPhotoTimeStampAction = (timeStamp) => ({
  type: SET_PHOTO_TIME_STAMP,
  payload: timeStamp,
});

const setApiTokenAction = (token) => ({
  type: SET_API_TOKEN,
  payload: {
    type: token.token_type,
    value: token.access_token,
  },
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

export const generateApiTokenAction = () => (dispatch) =>
  fetch(URLS.apiToken(), { method: 'post' }).then((res) => {
    dispatch(setApiTokenAction(res));
  });

export const fetchApiTokenAction = () => (dispatch) =>
  fetch(URLS.apiToken(), { method: 'get' })
    .then((res) => {
      dispatch(setApiTokenAction(res));
    })
    .catch(() => dispatch(generateApiTokenAction()));

export const fetchUserAction = () => (dispatch) =>
  fetch(URLS.user()).then((user) => {
    const userSettings = getStorageItem(`${user.userId}_settings`) || {};
    const savedActiveProject = userSettings.activeProject;
    const activeProject =
      savedActiveProject &&
      Object.prototype.hasOwnProperty.call(user.assignedProjects, savedActiveProject)
        ? savedActiveProject
        : Object.keys(user.assignedProjects)[0];
    dispatch(fetchApiTokenAction());
    dispatch(fetchUserSuccessAction(user));
    dispatch(setActiveProjectAction(activeProject));
    return { user, activeProject };
  });

export const setStartTimeFormatAction = (format) => ({
  type: SET_START_TIME_FORMAT,
  payload: format,
});

export const assignToProjectAction = (project) => ({
  type: ASSIGN_TO_RROJECT,
  payload: project,
});

export const assignToProjectSuccessAction = (projectInfo) => ({
  type: ASSIGN_TO_RROJECT_SUCCESS,
  payload: projectInfo,
});

export const assignToProjectErrorAction = (projectInfo) => ({
  type: ASSIGN_TO_RROJECT_ERROR,
  payload: projectInfo,
});

export const unassignFromProjectAction = (project) => ({
  type: UNASSIGN_FROM_PROJECT,
  payload: project,
});

export const unassignFromProjectSuccessAction = (project) => ({
  type: UNASSIGN_FROM_PROJECT_SUCCESS,
  payload: project,
});
