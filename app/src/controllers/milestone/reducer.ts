/*
 * Copyright 2026 EPAM Systems
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

import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { PROJECT_TEST_PLANS_PAGE, PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';

import { MILESTONES_NAMESPACE } from './constants';

const reducer = combineReducers({
  data: fetchReducer(MILESTONES_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(MILESTONES_NAMESPACE),
});

export const milestoneReducer = createPageScopedReducer(reducer, [
  PROJECT_TEST_PLANS_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
]);
