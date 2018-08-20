import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { CHANGE_ACTIVE_LOG_ITEM, SET_LOG_ITEM_TO_GET_HISTORY, NAMESPACE } from './constants';

export const activeItemReducer = (state = '', { type, payload }) => {
  switch (type) {
    case CHANGE_ACTIVE_LOG_ITEM:
      return payload;
    default:
      return state;
  }
};

export const itemToGetHistoryReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_LOG_ITEM_TO_GET_HISTORY:
      return payload;
    default:
      return state;
  }
};

export const logReducer = combineReducers({
  logEntries: fetchReducer(NAMESPACE),
  itemToGetHistory: itemToGetHistoryReducer,
  activeItemId: activeItemReducer,
});
