/*
 * Copyright 2024 EPAM Systems
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
import { alternativePaginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { ORGANIZATION_USERS_PAGE } from 'controllers/pages/constants';
import { NAMESPACE } from './constants';
import { initialPaginationState } from '../projects/constants';

export const usersFetchReducer = fetchReducer(NAMESPACE, {
  contentPath: 'items',
  initialState: [],
});

export const reducer = combineReducers({
  pagination: alternativePaginationReducer(NAMESPACE, initialPaginationState),
  loading: loadingReducer(NAMESPACE),
  users: usersFetchReducer,
});

export const usersReducer = createPageScopedReducer(reducer, ORGANIZATION_USERS_PAGE);
