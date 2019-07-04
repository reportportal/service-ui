import { combineReducers } from 'redux';
import { loadingReducer } from 'controllers/loading';
import { fetchReducer } from 'controllers/fetch';
import {
  NAMESPACE,
  SET_LEVEL,
  PARENT_ITEMS_NAMESPACE,
  SET_PAGE_LOADING,
  SET_VIEW_MODE,
  LIST_VIEW,
} from './constants';
import { testItemLogReducer } from './log';

const levelReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_LEVEL:
      return payload;
    default:
      return state;
  }
};

const pageLoadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

const viewModeReducer = (state = LIST_VIEW, { type, payload }) => {
  switch (type) {
    case SET_VIEW_MODE:
      return payload;
    default:
      return state;
  }
};

export const testItemReducer = combineReducers({
  level: levelReducer,
  loading: loadingReducer(NAMESPACE),
  pageLoading: pageLoadingReducer,
  parentItems: fetchReducer(PARENT_ITEMS_NAMESPACE, { initialState: [] }),
  log: testItemLogReducer,
  viewMode: viewModeReducer,
});
