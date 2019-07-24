import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import {
  SAUCE_LABS_LOGS_NAMESPACE,
  SAUCE_LABS_ASSETS_NAMESPACE,
  JOB_INFO_NAMESPACE,
  SET_AUTH_TOKEN_ACTION,
  UPDATE_LOADING_ACTION,
} from './constants';

const authTokenReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_AUTH_TOKEN_ACTION:
      return payload;
    default:
      return state;
  }
};

const loadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case UPDATE_LOADING_ACTION:
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
  loading: loadingReducer,
});
