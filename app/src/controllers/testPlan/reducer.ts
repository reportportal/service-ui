/*
 * Copyright 2025 EPAM Systems
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

import { ACTIVE_TEST_PLAN_NAMESPACE, TEST_PLANS_NAMESPACE } from './constants';

const reducer = combineReducers({
  data: fetchReducer(TEST_PLANS_NAMESPACE, { initialState: [], contentPath: 'content' }),
  isLoading: loadingReducer(TEST_PLANS_NAMESPACE),
  activeTestPlan: fetchReducer(ACTIVE_TEST_PLAN_NAMESPACE, { initialState: null }),
  isLoadingActive: loadingReducer(ACTIVE_TEST_PLAN_NAMESPACE),
});

export const testPlanReducer = createPageScopedReducer(reducer, [
  PROJECT_TEST_PLANS_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
]);
