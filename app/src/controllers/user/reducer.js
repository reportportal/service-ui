import { combineReducers } from 'redux';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SETTINGS_INITIAL_STATE,
  SET_PHOTO_TIME_STAMP,
  SET_API_TOKEN,
  ASSIGN_TO_RROJECT_SUCCESS,
  UNASSIGN_FROM_PROJECT_SUCCESS,
} from './constants';

export const settingsReducer = (state = SETTINGS_INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SET_START_TIME_FORMAT:
      return { ...state, startTimeFormat: payload };
    case SET_PHOTO_TIME_STAMP:
      return { ...state, photoTimeStamp: payload };
    default:
      return state;
  }
};

export const userAssignedProjectReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case ASSIGN_TO_RROJECT_SUCCESS: {
      const { projectName, projectRole, entryType } = payload;
      return {
        ...state,
        [projectName]: {
          projectRole,
          entryType,
        },
      };
    }
    case UNASSIGN_FROM_PROJECT_SUCCESS: {
      const { projectName } = payload;
      return Object.keys(state).reduce(
        (result, assignedProjectName) =>
          assignedProjectName === projectName
            ? result
            : {
                ...result,
                [assignedProjectName]: state[assignedProjectName],
              },
        {},
      );
    }
    default:
      return state;
  }
};

export const userInfoReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return payload;
    case ASSIGN_TO_RROJECT_SUCCESS:
    case UNASSIGN_FROM_PROJECT_SUCCESS:
      return {
        ...state,
        assignedProjects: userAssignedProjectReducer(state.assignedProjects, { type, payload }),
      };
    default:
      return state;
  }
};

export const activeProjectReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_ACTIVE_PROJECT:
      return payload;
    default:
      return state;
  }
};

export const apiTokenReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case SET_API_TOKEN:
      return payload;
    default:
      return state;
  }
};

export const userReducer = combineReducers({
  info: userInfoReducer,
  activeProject: activeProjectReducer,
  settings: settingsReducer,
  token: apiTokenReducer,
});
