import {
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_API_TOKEN,
  SET_PHOTO_TIME_STAMP,
  ASSIGN_TO_RROJECT,
  ASSIGN_TO_RROJECT_SUCCESS,
  ASSIGN_TO_RROJECT_ERROR,
  UNASSIGN_FROM_PROJECT,
  UNASSIGN_FROM_PROJECT_SUCCESS,
  FETCH_API_TOKEN,
  GENERATE_API_TOKEN,
  FETCH_USER_SUCCESS,
  FETCH_USER,
  FETCH_USER_ERROR,
} from './constants';

export const fetchUserSuccessAction = (user) => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const fetchUserErrorAction = () => ({
  type: FETCH_USER_ERROR,
  error: true,
});

export const setPhotoTimeStampAction = (timeStamp) => ({
  type: SET_PHOTO_TIME_STAMP,
  payload: timeStamp,
});

export const setApiTokenAction = (token) => ({
  type: SET_API_TOKEN,
  payload: {
    type: token.token_type,
    value: token.access_token,
  },
});

export const setActiveProjectAction = (project) => ({
  type: SET_ACTIVE_PROJECT,
  payload: project,
});

export const generateApiTokenAction = ({ successMessage, errorMessage } = {}) => ({
  type: GENERATE_API_TOKEN,
  payload: { successMessage, errorMessage },
});

export const fetchApiTokenAction = () => ({ type: FETCH_API_TOKEN });

export const fetchUserAction = () => ({ type: FETCH_USER });

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
