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

import { Action, combineReducers } from 'redux';

import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { fetchReducer } from 'controllers/fetch';
import { FETCH_ERROR, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { loadingReducer } from 'controllers/loading';
import {
  PROJECT_PIPELINE_COMPARISON_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  PROJECT_PIPELINES_PAGE,
} from 'controllers/pages';
import { PipelineComparison } from 'types/aiFactory';

import {
  CLEAR_PIPELINE_COMPARISON,
  GET_PIPELINE_COMPARISON,
  PIPELINE_COMPARISON_NAMESPACE,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';

interface PipelineReducerAction extends Action<string> {
  payload?: { data?: PipelineComparison };
  meta?: { namespace?: string };
}

const comparisonReducer = (
  state: PipelineComparison | null = null,
  action: PipelineReducerAction,
): PipelineComparison | null => {
  if (action.type === GET_PIPELINE_COMPARISON || action.type === CLEAR_PIPELINE_COMPARISON) {
    return null;
  }
  if (action.meta?.namespace !== PIPELINE_COMPARISON_NAMESPACE) {
    return state;
  }
  return action.type === FETCH_SUCCESS ? (action.payload?.data ?? null) : null;
};

const comparisonLoadingBaseReducer = loadingReducer(PIPELINE_COMPARISON_NAMESPACE);
const comparisonLoadingReducer = (state = false, action: PipelineReducerAction): boolean =>
  action.type === CLEAR_PIPELINE_COMPARISON ? false : comparisonLoadingBaseReducer(state, action);

const comparisonErrorReducer = (state = false, action: PipelineReducerAction): boolean => {
  if (action.type === GET_PIPELINE_COMPARISON || action.type === CLEAR_PIPELINE_COMPARISON) {
    return false;
  }
  if (action.meta?.namespace !== PIPELINE_COMPARISON_NAMESPACE) {
    return state;
  }
  if (action.type === FETCH_SUCCESS) {
    return false;
  }
  return action.type === FETCH_ERROR ? true : state;
};

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
  comparison: comparisonReducer,
  comparisonLoading: comparisonLoadingReducer,
  comparisonError: comparisonErrorReducer,
});

// Both pages share this state slice, so navigating between them (e.g. a card link into an
// iteration, then back) does not need to re-fetch what's already loaded.
export const aiFactoryPipelinesReducer = createPageScopedReducer(reducer, [
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  PROJECT_PIPELINE_COMPARISON_PAGE,
]);
