import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { API_INFO_NAMESPACE, UAT_INFO_NAMESPACE } from './constants';

export const appInfoReducer = combineReducers({
  apiInfo: fetchReducer(API_INFO_NAMESPACE, { initialState: {} }),
  uatInfo: fetchReducer(UAT_INFO_NAMESPACE, { initialState: {} }),
});
