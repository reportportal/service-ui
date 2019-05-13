import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch/reducer';
import { queueReducers } from 'common/utils/queueReducers';
import {
  ADD_DASHBOARD_SUCCESS,
  CHANGE_FULL_SCREEN_MODE,
  CHANGE_VISIBILITY_TYPE,
  INITIAL_STATE,
  NAMESPACE,
  REMOVE_DASHBOARD_SUCCESS,
  TOGGLE_FULL_SCREEN_MODE,
  UPDATE_DASHBOARD_SUCCESS,
} from './constants';

const dashboardsReducer = (state = INITIAL_STATE.dashboards, { type, payload }) => {
  switch (type) {
    case ADD_DASHBOARD_SUCCESS:
      return [...state, payload];
    case UPDATE_DASHBOARD_SUCCESS:
      return state.map((item) => (item.id === payload.id ? payload : item));
    case REMOVE_DASHBOARD_SUCCESS:
      return state.filter((item) => item.id !== payload);
    default:
      return state;
  }
};

const gridTypeReducer = (state = INITIAL_STATE.gridType, { type, payload }) =>
  type === CHANGE_VISIBILITY_TYPE ? payload : state;

const fullScreenModeReducer = (state = INITIAL_STATE.fullScreenMode, { type, payload }) => {
  switch (type) {
    case CHANGE_FULL_SCREEN_MODE:
      return payload;
    case TOGGLE_FULL_SCREEN_MODE:
      return !state;
    default:
      return state;
  }
};

export const dashboardReducer = combineReducers({
  dashboards: queueReducers(fetchReducer(NAMESPACE, { contentPath: 'content' }), dashboardsReducer),
  gridType: gridTypeReducer,
  fullScreenMode: fullScreenModeReducer,
});
