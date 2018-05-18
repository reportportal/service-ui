import { combineReducers } from 'redux';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SETTINGS_INITIAL_STATE,
} from './constants';

export const settingsReducer = (state = SETTINGS_INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SET_START_TIME_FORMAT:
      return { ...state, startTimeFormat: payload };
    default:
      return state;
  }
};

export const userInfoReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return payload;
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

export const userReducer = combineReducers({
  info: userInfoReducer,
  activeProject: activeProjectReducer,
  settings: settingsReducer,
});
