import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { queueReducers } from 'common/utils/queueReducers';
import { NAMESPACE, GLOBAL_INTEGRATIONS_NAMESPACE, UPDATE_PLUGIN_LOCALLY } from './constants';

export const updatePluginLocallyReducer = (state, { type, payload }) => {
  switch (type) {
    case UPDATE_PLUGIN_LOCALLY:
      return state.map((item) => {
        if (item.type === payload.type) {
          return payload;
        }
        return item;
      });
    default:
      return state;
  }
};

export const pluginsReducer = combineReducers({
  plugins: queueReducers(fetchReducer(NAMESPACE), updatePluginLocallyReducer),
  globalIntegrations: fetchReducer(GLOBAL_INTEGRATIONS_NAMESPACE),
});
