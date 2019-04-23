import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { queueReducers } from 'common/utils';
import {
  SAUCE_LABS_LOGS_NAMESPACE,
  SAUCE_LABS_ASSETS_NAMESPACE,
  JOB_INFO_NAMESPACE,
  SET_AUTH_TOKEN_ACTION,
} from './constants';

export const authTokenReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_AUTH_TOKEN_ACTION:
      return payload;
    default:
      return state;
  }
};

export const sauceLabsReducer = combineReducers({
  authToken: authTokenReducer,
  assets: fetchReducer(SAUCE_LABS_ASSETS_NAMESPACE, { initialState: {} }),
  jobInfo: fetchReducer(JOB_INFO_NAMESPACE, { initialState: {} }),
  logs: fetchReducer(SAUCE_LABS_LOGS_NAMESPACE),
  loading: queueReducers(
    loadingReducer(JOB_INFO_NAMESPACE),
    loadingReducer(SAUCE_LABS_LOGS_NAMESPACE),
    loadingReducer(SAUCE_LABS_ASSETS_NAMESPACE),
  ),
});
