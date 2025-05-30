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
import { loadingReducer } from 'controllers/loading';
import { fetchReducer } from 'controllers/fetch';
import { queueReducers } from 'common/utils';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import {
  NAMESPACE,
  SET_LEVEL,
  PARENT_ITEMS_NAMESPACE,
  FILTERED_ITEM_STATISTICS_NAMESPACE,
  FILTERED_ITEM_STATISTICS_INITIAL_STATE,
  SET_PAGE_LOADING,
  FETCH_PARENT_LAUNCH_SUCCESS,
  SEARCHED_ITEMS_WIDGET,
} from './constants';

const levelReducer = (state = '', { type = '', payload = {} }) => {
  switch (type) {
    case SET_LEVEL:
      return payload;
    default:
      return state;
  }
};

const pageLoadingReducer = (state = false, { type = '', payload = {} }) => {
  switch (type) {
    case SET_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

const parentItemsReducer = (state = [], { type = '', payload = {} }) => {
  switch (type) {
    case FETCH_PARENT_LAUNCH_SUCCESS:
      return [payload, ...state.slice(1)];
    default:
      return state;
  }
};

const searchedItemsWidgetReducer = (state = {}, { type = '', payload = {} }) => {
  switch (type) {
    case SEARCHED_ITEMS_WIDGET:
      return { ...state, ...payload };
    default:
      return state;
  }
};

export const testItemReducer = combineReducers({
  level: levelReducer,
  loading: loadingReducer(NAMESPACE),
  pageLoading: pageLoadingReducer,
  parentItems: queueReducers(
    parentItemsReducer,
    fetchReducer(PARENT_ITEMS_NAMESPACE, { initialState: [] }),
  ),
  filteredItemStatistics: fetchReducer(FILTERED_ITEM_STATISTICS_NAMESPACE, {
    initialState: FILTERED_ITEM_STATISTICS_INITIAL_STATE,
  }),
  searchedItems: createPageScopedReducer(searchedItemsWidgetReducer, [PROJECT_DASHBOARD_ITEM_PAGE]),
});
