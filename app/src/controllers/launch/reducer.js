import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE, SET_DEBUG_MODE } from './constants';

const debugModeReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_DEBUG_MODE:
      return payload;
    default:
      return state;
  }
};

export const launchReducer = combineReducers({
  launches: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  debugMode: debugModeReducer,
});
