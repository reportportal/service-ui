import { combineReducers } from 'redux';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  START_TIME_FORMAT_RELATIVE,
} from './constants';

const settingsReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case SET_START_TIME_FORMAT:
      return { ...state, startTimeFormat: payload };
    default:
      return state;
  }
};

const userInfoReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return payload;
    default:
      return state;
  }
};

const activeProjectReducer = (state = START_TIME_FORMAT_RELATIVE, { type, payload }) => {
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
