import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { queueReducers } from 'common/utils';
import {
  SAUCE_LABS_LOGS_NAMESPACE,
  JOB_INFO_NAMESPACE,
  SET_INTEGRATION_DATA_ACTION,
} from './constants';

export const integrationDataReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case SET_INTEGRATION_DATA_ACTION:
      return payload;
    default:
      return state;
  }
};

export const sauceLabsReducer = combineReducers({
  integrationData: integrationDataReducer,
  jobInfo: fetchReducer(JOB_INFO_NAMESPACE, { initialState: {} }),
  logs: fetchReducer(SAUCE_LABS_LOGS_NAMESPACE),
  loading: queueReducers(
    loadingReducer(SAUCE_LABS_LOGS_NAMESPACE),
    loadingReducer(JOB_INFO_NAMESPACE),
  ),
});
