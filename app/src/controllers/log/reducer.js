import { combineReducers } from 'redux';
import { queueReducers } from 'common/utils';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import {
  LOG_ITEMS_NAMESPACE,
  ACTIVITY_NAMESPACE,
  HISTORY_NAMESPACE,
  STACK_TRACE_NAMESPACE,
  CLEAR_LOG_PAGE_STACK_TRACE,
} from './constants';
import { attachmentsReducer } from './attachments';
import { sauceLabsReducer } from './sauceLabs';
import { nestedStepsReducer } from './nestedSteps';

const stackTracePaginationReducer = (state = {}, { type }) => {
  switch (type) {
    case CLEAR_LOG_PAGE_STACK_TRACE:
      return {};
    default:
      return state;
  }
};

const stackTraceContentReducer = (state = {}, { type }) => {
  switch (type) {
    case CLEAR_LOG_PAGE_STACK_TRACE:
      return [];
    default:
      return state;
  }
};

export const logReducer = combineReducers({
  logItems: fetchReducer(LOG_ITEMS_NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(LOG_ITEMS_NAMESPACE),
  loading: loadingReducer(LOG_ITEMS_NAMESPACE),
  activity: fetchReducer(ACTIVITY_NAMESPACE, { contentPath: 'content' }),
  historyEntries: fetchReducer(HISTORY_NAMESPACE),
  stackTrace: combineReducers({
    loading: loadingReducer(STACK_TRACE_NAMESPACE),
    pagination: queueReducers(
      paginationReducer(STACK_TRACE_NAMESPACE),
      stackTracePaginationReducer,
    ),
    content: queueReducers(
      fetchReducer(STACK_TRACE_NAMESPACE, { contentPath: 'content' }),
      stackTraceContentReducer,
    ),
  }),
  attachments: attachmentsReducer,
  sauceLabs: sauceLabsReducer,
  nestedSteps: nestedStepsReducer,
});
