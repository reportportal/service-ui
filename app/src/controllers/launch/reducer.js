import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE } from './constants';

export const launchReducer = combineReducers({
  launches: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
});
