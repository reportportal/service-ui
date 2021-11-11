/*
 * Copyright 2021 EPAM Systems
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
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { UNIQUE_ERRORS_PAGE } from 'controllers/pages';
import { loadingReducer } from 'controllers/loading';
import { clusterItemsReducer } from './clusterItems';
import { NAMESPACE, SET_PAGE_LOADING } from './constants';

const pageLoadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

const reducer = combineReducers({
  pageLoading: pageLoadingReducer,
  loading: loadingReducer(NAMESPACE),
  clusters: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  clusterItems: clusterItemsReducer,
});

export const uniqueErrorsReducer = createPageScopedReducer(reducer, [UNIQUE_ERRORS_PAGE]);
