import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE, CURRENT_LAUNCH_NAMESPACE } from './constants';

export const launchReducer = combineReducers({
  launches: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  currentLaunch: fetchReducer(CURRENT_LAUNCH_NAMESPACE, { initialState: null }),
  loading: loadingReducer(NAMESPACE),
});
