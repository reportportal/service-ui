import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { NAMESPACE, GLOBAL_INTEGRATIONS_NAMESPACE } from './constants';

export const pluginsReducer = combineReducers({
  plugins: fetchReducer(NAMESPACE),
  globalIntegrations: fetchReducer(GLOBAL_INTEGRATIONS_NAMESPACE),
});
