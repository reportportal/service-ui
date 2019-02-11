import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE } from './constants';

export const allUsersReducer = combineReducers({
  allUsers: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
});
