import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { attachmentsReducer } from 'controllers/attachments';
import {
  LOG_ITEMS_NAMESPACE,
  ACTIVITY_NAMESPACE,
  HISTORY_NAMESPACE,
  ATTACHMENTS_NAMESPACE,
} from './constants';
import { sauceLabsReducer } from './sauceLabs';
import { nestedStepsReducer } from './nestedSteps';

export const logReducer = combineReducers({
  logItems: fetchReducer(LOG_ITEMS_NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(LOG_ITEMS_NAMESPACE),
  loading: loadingReducer(LOG_ITEMS_NAMESPACE),
  activity: fetchReducer(ACTIVITY_NAMESPACE, { contentPath: 'content' }),
  historyEntries: fetchReducer(HISTORY_NAMESPACE),
  attachments: attachmentsReducer(ATTACHMENTS_NAMESPACE),
  sauceLabs: sauceLabsReducer,
  nestedSteps: nestedStepsReducer,
});
