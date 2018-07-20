import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { NAMESPACE } from './constants';

export const stepReducer = combineReducers({
  steps: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  groupOperations: groupOperationsReducer(NAMESPACE),
});
