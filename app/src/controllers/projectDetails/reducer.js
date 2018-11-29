import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { PROJECT_INFO_NAMESPACE } from './constants';

export const projectDetailsReducer = combineReducers({
  loading: loadingReducer(PROJECT_INFO_NAMESPACE),
  projectInfo: fetchReducer(PROJECT_INFO_NAMESPACE, { initialState: {} }),
});
