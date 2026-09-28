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
import { PROJECT_PIPELINE_ITERATION_PAGE, PROJECT_PIPELINES_PAGE } from 'controllers/pages';

import {
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';

const reducer = combineReducers({
  data: fetchReducer(PIPELINES_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(PIPELINES_NAMESPACE),
  iterationsByPipeline: fetchReducer(PIPELINE_ITERATIONS_NAMESPACE, {
    initialState: null,
    contentPath: 'data',
  }),
  iterationsLoading: loadingReducer(PIPELINE_ITERATIONS_NAMESPACE),
  iterationDetails: fetchReducer(PIPELINE_ITERATION_DETAILS_NAMESPACE, {
    initialState: null,
    contentPath: 'data',
  }),
  iterationDetailsLoading: loadingReducer(PIPELINE_ITERATION_DETAILS_NAMESPACE),
});

// Both pages share this state slice, so navigating between them (e.g. a card link into an
// iteration, then back) does not need to re-fetch what's already loaded.
export const aiFactoryPipelinesReducer = createPageScopedReducer(reducer, [
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
]);
