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
import { groupOperationsReducer } from 'controllers/groupOperations';
import { paginationReducer } from 'controllers/pagination';
import { fetchReducer } from 'controllers/fetch';
import { HISTORY_PAGE } from 'controllers/pages';
import {
  NAMESPACE,
  FILTER_HISTORY_NAMESPACE,
  RESET_HISTORY,
  PAGINATION_INITIAL_STATE,
  SET_HISTORY_PAGE_LOADING,
  FETCH_HISTORY_PAGE_INFO,
  FILTER_FOR_COMPARE_INITIAL_STATE,
  SET_FILTER_FOR_COMPARE,
} from './constants';

export const historyPaginationReducer = (state = PAGINATION_INITIAL_STATE, { type }) => {
  switch (type) {
    case RESET_HISTORY:
      return PAGINATION_INITIAL_STATE;
    default:
      return state;
  }
};

export const historyReducer = (state = [], { type }) => {
  switch (type) {
    case RESET_HISTORY:
      return [];
    default:
      return state;
  }
};

export const loadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_HISTORY_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

export const filterForCompareReducer = (
  state = FILTER_FOR_COMPARE_INITIAL_STATE,
  { type, payload },
) => {
  switch (type) {
    case SET_FILTER_FOR_COMPARE:
      return payload;
    case FETCH_HISTORY_PAGE_INFO:
      return FILTER_FOR_COMPARE_INITIAL_STATE;
    default:
      return state;
  }
};

const reducer = combineReducers({
  history: queueReducers(historyReducer, fetchReducer(NAMESPACE, { contentPath: 'content' })),
  loading: loadingReducer,
  pagination: queueReducers(
    historyPaginationReducer,
    paginationReducer(NAMESPACE, PAGINATION_INITIAL_STATE),
  ),
  groupOperations: groupOperationsReducer(NAMESPACE),
  filterForCompare: filterForCompareReducer,
  filterHistory: queueReducers(
    historyReducer,
    fetchReducer(FILTER_HISTORY_NAMESPACE, { contentPath: 'content' }),
  ),
});

export const itemsHistoryReducer = createPageScopedReducer(reducer, HISTORY_PAGE);
