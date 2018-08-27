import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { SET_ACTIVE_HISTORY_ITEM_ID, NAMESPACE } from './constants';

export const activeItemReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_ACTIVE_HISTORY_ITEM_ID:
      return payload;
    default:
      return state;
  }
};

export const logReducer = combineReducers({
  historyEntries: fetchReducer(NAMESPACE),
  activeItemId: activeItemReducer,
});
