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
import { fetchReducer } from 'controllers/fetch';
import { alternativePaginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { FETCH_ORGANIZATION_PROJECTS } from './constants';

export const projectFetchReducer = fetchReducer(FETCH_ORGANIZATION_PROJECTS, {
  contentPath: 'items',
  initialState: [],
});

export const reducer = combineReducers({
  pagination: alternativePaginationReducer,
  loading: loadingReducer(FETCH_ORGANIZATION_PROJECTS),
  projects: projectFetchReducer,
});

export const projectsReducer = createPageScopedReducer(reducer, ORGANIZATION_PROJECTS_PAGE);
