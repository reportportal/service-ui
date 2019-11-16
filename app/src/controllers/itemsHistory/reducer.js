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
import { queueReducers } from 'common/utils';
import { paginationReducer } from 'controllers/pagination';
import { fetchReducer } from 'controllers/fetch';
import {
  NAMESPACE,
  RESET_HISTORY,
  PAGINATION_INITIAL_STATE,
  SET_HISTORY_PAGE_LOADING,
} from './constants';

const historyPaginationReducer = (state = PAGINATION_INITIAL_STATE, { type }) => {
  switch (type) {
    case RESET_HISTORY:
      return PAGINATION_INITIAL_STATE;
    default:
      return state;
  }
};

const historyReducer = (state = [], { type }) => {
  switch (type) {
    case RESET_HISTORY:
      return [];
    default:
      return state;
  }
};

const loadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_HISTORY_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

export const itemsHistoryReducer = combineReducers({
  history: queueReducers(historyReducer, fetchReducer(NAMESPACE, { contentPath: 'content' })),
  loading: loadingReducer,
  pagination: queueReducers(
    historyPaginationReducer,
    paginationReducer(NAMESPACE, PAGINATION_INITIAL_STATE),
  ),
});
