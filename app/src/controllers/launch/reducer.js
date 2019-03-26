import { combineReducers } from 'redux';
import { getStorageItem } from 'common/utils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { loadingReducer } from 'controllers/loading';
import { ALL } from 'common/constants/reservedFilterIds';
import { queueReducers } from 'common/utils/queueReducers';
import {
  NAMESPACE,
  SET_DEBUG_MODE,
  CHANGE_LAUNCH_DISTINCT,
  UPDATE_LAUNCH_LOCALLY,
} from './constants';

const getDefaultLaunchDistinctState = () =>
  (getStorageItem(APPLICATION_SETTINGS) && getStorageItem(APPLICATION_SETTINGS).launchDistinct) ||
  ALL;

const debugModeReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_DEBUG_MODE:
      return payload;
    default:
      return state;
  }
};

const launchDistinctReducer = (state = getDefaultLaunchDistinctState(), { type, payload }) => {
  switch (type) {
    case CHANGE_LAUNCH_DISTINCT:
      return payload;
    default:
      return state;
  }
};
const updateLaunchLocallyReducer = (state, { type, payload }) => {
  switch (type) {
    case UPDATE_LAUNCH_LOCALLY:
      return state.map((item) => {
        if (item.id === payload.id) {
          return payload;
        }
        return item;
      });
    default:
      return state;
  }
};

export const launchReducer = combineReducers({
  launches: queueReducers(
    fetchReducer(NAMESPACE, { contentPath: 'content' }),
    updateLaunchLocallyReducer,
  ),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  debugMode: debugModeReducer,
  launchDistinct: launchDistinctReducer,
});
