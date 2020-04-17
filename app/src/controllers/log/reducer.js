/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { combineReducers } from 'redux';
import { queueReducers } from 'common/utils/queueReducers';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { PROJECT_LOG_PAGE, PROJECT_USERDEBUG_LOG_PAGE } from 'controllers/pages';
import {
  LOG_ITEMS_NAMESPACE,
  ACTIVITY_NAMESPACE,
  STACK_TRACE_NAMESPACE,
  CLEAR_LOG_PAGE_STACK_TRACE,
  SET_LOG_PAGE_LOADING,
  FETCH_HISTORY_ITEMS_SUCCESS,
  UPDATE_HISTORY_ITEM_ISSUES,
} from './constants';
import { attachmentsReducer } from './attachments';
import { sauceLabsReducer } from './sauceLabs';
import { nestedStepsReducer } from './nestedSteps';
import { normalizeHistoryItems, updateHistoryItemIssues } from './utils';

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

const pageLoadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_LOG_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

const historyItemsReducer = (state = [], { type, payload }) => {
  switch (type) {
    case FETCH_HISTORY_ITEMS_SUCCESS:
      return normalizeHistoryItems(payload);
    case UPDATE_HISTORY_ITEM_ISSUES:
      return updateHistoryItemIssues(state, payload);
    default:
      return state;
  }
};

const reducer = combineReducers({
  logItems: fetchReducer(LOG_ITEMS_NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(LOG_ITEMS_NAMESPACE),
  loading: loadingReducer(LOG_ITEMS_NAMESPACE),
  pageLoading: pageLoadingReducer,
  activity: fetchReducer(ACTIVITY_NAMESPACE, { contentPath: 'content' }),
  historyItems: historyItemsReducer,
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

export const logReducer = createPageScopedReducer(reducer, [
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
]);
