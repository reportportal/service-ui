import { combineReducers } from 'redux';
import { loadingReducer } from 'controllers/loading';
import { fetchReducer } from 'controllers/fetch';
import { NAMESPACE, SET_LEVEL, PARENT_ITEMS_NAMESPACE, SET_PAGE_LOADING } from './constants';

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

export const testItemReducer = combineReducers({
  level: levelReducer,
  loading: loadingReducer(NAMESPACE),
  pageLoading: pageLoadingReducer,
  parentItems: fetchReducer(PARENT_ITEMS_NAMESPACE, { initialState: [] }),
});
