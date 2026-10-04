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
import { LOGOUT } from 'controllers/auth';
import { fetchReducer } from 'controllers/fetch';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
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
import {
  IterationsByPipelineId,
  IterationsErrorByPipelineId,
  IterationsLoadingByPipelineId,
  PipelineIterationItem,
  PipelinesState,
} from './types';
import { PipelineCatalogTransport } from './transport';

interface PipelineReducerAction extends Action<string> {
  payload?: { data?: unknown };
  meta?: {
    namespace?: string;
    pipelineId?: number;
    transport?: PipelineCatalogTransport;
    transportFallback?: boolean;
    isCancellation?: boolean;
    requestId?: number;
    catalogVersion?: number;
    catalogRequestId?: number;
    projectKey?: string;
  };
}

const isPipelineIterationsAction = (action: PipelineReducerAction): boolean =>
  action.meta?.namespace === PIPELINE_ITERATIONS_NAMESPACE &&
  typeof action.meta.pipelineId === 'number';

const iterationsByPipelineReducer = (
  state: IterationsByPipelineId | null = null,
  action: PipelineReducerAction,
): IterationsByPipelineId | null => {
  if (!isPipelineIterationsAction(action) || action.type !== FETCH_SUCCESS) {
    return state;
  }
  return {
    ...state,
    [action.meta.pipelineId]: (action.payload?.data as PipelineIterationItem[]) ?? [],
  };
};

const iterationsLoadingByPipelineReducer = (
  state: IterationsLoadingByPipelineId = {},
  action: PipelineReducerAction,
): IterationsLoadingByPipelineId => {
  if (!isPipelineIterationsAction(action)) {
    return state;
  }
  if (![FETCH_START, FETCH_SUCCESS, FETCH_ERROR].includes(action.type)) {
    return state;
  }
  return {
    ...state,
    [action.meta.pipelineId]: action.type === FETCH_START,
  };
};

const iterationsErrorByPipelineReducer = (
  state: IterationsErrorByPipelineId = {},
  action: PipelineReducerAction,
): IterationsErrorByPipelineId => {
  if (!isPipelineIterationsAction(action)) {
    return state;
  }
  if (![FETCH_START, FETCH_SUCCESS, FETCH_ERROR].includes(action.type)) {
    return state;
  }
  return {
    ...state,
    [action.meta.pipelineId]: action.type === FETCH_ERROR && !action.meta.isCancellation,
  };
};

const transportReducer = (
  state: PipelineCatalogTransport = 'mock',
  action: PipelineReducerAction,
): PipelineCatalogTransport =>
  action.type === FETCH_SUCCESS && action.meta?.namespace === PIPELINES_NAMESPACE
    ? (action.meta.transport ?? 'mock')
    : state;

const transportFallbackReducer = (state = false, action: PipelineReducerAction): boolean =>
  action.type === FETCH_SUCCESS && action.meta?.namespace === PIPELINES_NAMESPACE
    ? Boolean(action.meta.transportFallback)
    : state;

const catalogVersionReducer = (state = 0, action: PipelineReducerAction): number => {
  if (action.meta?.namespace !== PIPELINES_NAMESPACE) {
    return state;
  }
  if (action.type === FETCH_START) {
    return 0;
  }
  return action.type === FETCH_SUCCESS ? (action.meta.catalogRequestId ?? state) : state;
};

const catalogRequestIdReducer = (
  state: number | null = null,
  action: PipelineReducerAction,
): number | null =>
  action.meta?.namespace === PIPELINES_NAMESPACE && action.type === FETCH_START
    ? (action.meta.catalogRequestId ?? null)
    : state;

const catalogProjectKeyReducer = (
  state: string | null = null,
  action: PipelineReducerAction,
): string | null =>
  action.meta?.namespace === PIPELINES_NAMESPACE && action.type === FETCH_START
    ? (action.meta.projectKey ?? null)
    : state;

const iterationRequestIdByPipelineReducer = (
  state: Record<number, number> = {},
  action: PipelineReducerAction,
): Record<number, number> => {
  if (
    !isPipelineIterationsAction(action) ||
    action.type !== FETCH_START ||
    typeof action.meta.requestId !== 'number'
  ) {
    return state;
  }
  return { ...state, [action.meta.pipelineId]: action.meta.requestId };
};

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
  return action.type === FETCH_SUCCESS
    ? ((action.payload?.data as PipelineComparison | undefined) ?? null)
    : null;
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

const combinedReducer = combineReducers({
  data: fetchReducer(PIPELINES_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(PIPELINES_NAMESPACE),
  transport: transportReducer,
  transportFallback: transportFallbackReducer,
  catalogVersion: catalogVersionReducer,
  catalogRequestId: catalogRequestIdReducer,
  catalogProjectKey: catalogProjectKeyReducer,
  iterationsByPipeline: iterationsByPipelineReducer,
  iterationsLoadingByPipeline: iterationsLoadingByPipelineReducer,
  iterationsErrorByPipeline: iterationsErrorByPipelineReducer,
  iterationRequestIdByPipeline: iterationRequestIdByPipelineReducer,
  iterationDetails: fetchReducer(PIPELINE_ITERATION_DETAILS_NAMESPACE, {
    initialState: null,
    contentPath: 'data',
  }),
  iterationDetailsLoading: loadingReducer(PIPELINE_ITERATION_DETAILS_NAMESPACE),
  comparison: comparisonReducer,
  comparisonLoading: comparisonLoadingReducer,
  comparisonError: comparisonErrorReducer,
});
type CombinedPipelinesState = ReturnType<typeof combinedReducer>;

const isPipelineCatalogAction = (action: PipelineReducerAction): boolean =>
  action.meta?.namespace === PIPELINES_NAMESPACE &&
  [FETCH_START, FETCH_SUCCESS, FETCH_ERROR].includes(action.type);

const isCurrentCatalogRequest = (
  state: PipelinesState,
  action: PipelineReducerAction,
): boolean => {
  if (!isPipelineCatalogAction(action)) {
    return true;
  }
  if (
    typeof action.meta?.catalogRequestId !== 'number' ||
    typeof action.meta.projectKey !== 'string'
  ) {
    return false;
  }
  if (action.type === FETCH_START) {
    return state.catalogRequestId === null || action.meta.catalogRequestId > state.catalogRequestId;
  }
  return (
    action.meta.catalogRequestId === state.catalogRequestId &&
    action.meta.projectKey === state.catalogProjectKey
  );
};

const isCurrentIterationRequest = (
  state: PipelinesState,
  action: PipelineReducerAction,
): boolean => {
  if (!isPipelineIterationsAction(action)) {
    return true;
  }
  if (
    action.meta.catalogVersion !== state.catalogVersion ||
    action.meta.transport !== state.transport ||
    typeof action.meta.requestId !== 'number'
  ) {
    return false;
  }
  const currentRequestId = state.iterationRequestIdByPipeline[action.meta.pipelineId];
  return action.type === FETCH_START
    ? currentRequestId === undefined || action.meta.requestId > currentRequestId
    : action.meta.requestId === currentRequestId;
};

const reducer = (
  state: PipelinesState | undefined,
  action: PipelineReducerAction,
): PipelinesState => {
  const initialState = combinedReducer(undefined, { type: '@@INIT' }) as PipelinesState;
  if (action.type === LOGOUT) {
    return initialState;
  }
  const currentState = state ?? initialState;
  if (
    !isCurrentCatalogRequest(currentState, action) ||
    !isCurrentIterationRequest(currentState, action)
  ) {
    return currentState;
  }
  const nextState = combinedReducer(
    state as CombinedPipelinesState | undefined,
    action,
  ) as PipelinesState;
  const shouldResetCatalogData =
    action.meta?.namespace === PIPELINES_NAMESPACE &&
    (action.type === FETCH_START || action.type === FETCH_SUCCESS);
  if (!shouldResetCatalogData) {
    return nextState;
  }
  return {
    ...nextState,
    data: action.type === FETCH_START ? null : nextState.data,
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    iterationDetailsLoading: false,
    comparison: null,
    comparisonLoading: false,
    comparisonError: false,
  };
};

// Both pages share this state slice, so navigating between them (e.g. a card link into an
// iteration, then back) does not need to re-fetch what's already loaded.
export const aiFactoryPipelinesReducer = createPageScopedReducer(reducer, [
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  PROJECT_PIPELINE_COMPARISON_PAGE,
]);
