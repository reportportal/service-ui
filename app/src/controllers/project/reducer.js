import { combineReducers } from 'redux';
import {
  INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
} from './constants';

const toggleFilter = (filters = [], filter) => {
  const index = filters.indexOf(filter);
  if (index !== -1) {
    return filters.filter(item => item !== filter);
  }
  return [...filters, filter];
};

const projectInfoReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_PROJECT_SUCCESS:
      return { ...state, ...payload };
    default:
      return state;
  }
};

const projectPreferencesReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_PROJECT_PREFERENCES_SUCCESS:
      return { ...state, ...payload };
    case TOGGLE_DISPLAY_FILTER_ON_LAUNCHES:
      return { ...state, filters: toggleFilter(state.filters, payload) };
    default:
      return state;
  }
};

export const projectReducer = combineReducers({
  info: projectInfoReducer,
  preferences: projectPreferencesReducer,
});
