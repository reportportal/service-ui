import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { LOG_ITEMS_NAMESPACE, ACTIVITY_NAMESPACE, HISTORY_NAMESPACE } from './constants';

export const logReducer = combineReducers({
  logItems: fetchReducer(LOG_ITEMS_NAMESPACE, { contentPath: 'content' }),
  activity: fetchReducer(ACTIVITY_NAMESPACE),
  historyEntries: fetchReducer(HISTORY_NAMESPACE),
});
