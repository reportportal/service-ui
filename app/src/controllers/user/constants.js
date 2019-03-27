export const FETCH_USER_SUCCESS = 'fetchUserSuccess';
export const SET_ACTIVE_PROJECT = 'setActiveProject';
export const SET_START_TIME_FORMAT = 'setStartTimeFormat';
export const SET_PHOTO_TIME_STAMP = 'setPhotoTimeStamp';

export const START_TIME_FORMAT_RELATIVE = 'relative';
export const START_TIME_FORMAT_ABSOLUTE = 'absolute';

export const SETTINGS_INITIAL_STATE = {
  startTimeFormat: START_TIME_FORMAT_RELATIVE,
  photoTimeStamp: Date.now(),
};

export const SET_API_TOKEN = 'setApiToken';
export const ASSIGN_TO_RROJECT = 'assignToProject';
export const ASSIGN_TO_RROJECT_SUCCESS = 'assignToProjectSuccess';
export const UNASSIGN_FROM_PROJECT = 'unassignFromProject';
export const UNASSIGN_FROM_PROJECT_SUCCESS = 'unassignFromProjectSuccess';
