import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { API_INFO_NAMESPACE, COMPOSITE_INFO_NAMESPACE } from './constants';

export const appInfoReducer = combineReducers({
  apiInfo: fetchReducer(API_INFO_NAMESPACE, { initialState: {} }),
  compositeInfo: fetchReducer(COMPOSITE_INFO_NAMESPACE, { initialState: {} }),
});
