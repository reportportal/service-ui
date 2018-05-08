import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import {
  SELECT_LAUNCHES,
  UNSELECT_ALL_LAUNCHES,
  TOGGLE_LAUNCH_SELECTION,
  SET_VALIDATION_ERRORS,
  REMOVE_VALIDATION_ERROR,
  SET_LAST_OPERATION_NAME,
  NAMESPACE,
} from './constants';

const selectedLaunchesReducer = (state = [], { type, payload }) => {
  switch (type) {
    case TOGGLE_LAUNCH_SELECTION:
      return state.find((launch) => launch.id === payload.id)
        ? state.filter((launch) => launch.id !== payload.id)
        : [...state, payload];
    case SELECT_LAUNCHES:
      return [...payload];
    case UNSELECT_ALL_LAUNCHES:
      return [];
    default:
      return state;
  }
};

const validationErrorsReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case SET_VALIDATION_ERRORS:
      return { ...payload };
    case REMOVE_VALIDATION_ERROR: {
      const newState = { ...state };
      delete newState[payload];
      return newState;
    }
    default:
      return state;
  }
};

const lastOperationReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_LAST_OPERATION_NAME:
      return payload;
    default:
      return state;
  }
};

export const launchReducer = combineReducers({
  selected: selectedLaunchesReducer,
  errors: validationErrorsReducer,
  lastOperation: lastOperationReducer,
  launches: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
});
