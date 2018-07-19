import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { NAMESPACE } from './constants';

export const stepReducer = combineReducers({
  steps: fetchReducer(NAMESPACE, { contentPath: 'content' }),
});
