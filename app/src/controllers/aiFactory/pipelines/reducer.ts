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
  TEST_CASE_LIBRARY_PAGE,
} from 'controllers/pages';
import { IterationRS, PipelineComparison } from 'types/aiFactory';

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
import { ReducedPipelineIterationDetail } from './liveAdapters';
import { PipelineCatalogTransport, PipelineDetailTransport } from './transport';

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
    iterationId?: number;
    catalogTransport?: PipelineCatalogTransport;
    detailTransport?: PipelineDetailTransport;
    isUnavailable?: boolean;
  };
}

interface PipelineDetailMeta {
  requestId: number;
  projectKey: string;
  pipelineId: number;
  iterationId: number;
  catalogVersion: number;
  catalogRequestId: number;
  catalogTransport: PipelineCatalogTransport;
  detailTransport: PipelineDetailTransport;
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

const isPipelineDetailAction = (action: PipelineReducerAction): boolean =>
  action.meta?.namespace === PIPELINE_ITERATION_DETAILS_NAMESPACE &&
  [FETCH_START, FETCH_SUCCESS, FETCH_ERROR].includes(action.type);

const iterationDetailsReducer = (
  state: IterationRS | ReducedPipelineIterationDetail | null = null,
  action: PipelineReducerAction,
): IterationRS | ReducedPipelineIterationDetail | null => {
  if (!isPipelineDetailAction(action)) {
    return state;
  }
  if (action.type === FETCH_SUCCESS) {
    return (action.payload?.data as IterationRS | ReducedPipelineIterationDetail | undefined) ?? null;
  }
  if (
    action.type === FETCH_START &&
    state?.pipelineId === action.meta?.pipelineId &&
    state.id === action.meta.iterationId
  ) {
    return state;
  }
  return null;
};

const iterationDetailsLoadingReducer = (state = false, action: PipelineReducerAction): boolean =>
  isPipelineDetailAction(action) ? action.type === FETCH_START : state;

const iterationDetailsErrorReducer = (state = false, action: PipelineReducerAction): boolean =>
  isPipelineDetailAction(action)
    ? action.type === FETCH_ERROR && !action.meta?.isCancellation && !action.meta?.isUnavailable
    : state;

const iterationDetailsUnavailableReducer = (
  state = false,
  action: PipelineReducerAction,
): boolean =>
  isPipelineDetailAction(action)
    ? action.type === FETCH_ERROR && Boolean(action.meta?.isUnavailable)
    : state;

const detailMetaReducer =
  <T extends keyof NonNullable<PipelineReducerAction['meta']>>(
    key: T,
    initialState: NonNullable<PipelineReducerAction['meta']>[T] | null,
  ) =>
  (
    state: NonNullable<PipelineReducerAction['meta']>[T] | null = initialState,
    action: PipelineReducerAction,
  ) =>
    isPipelineDetailAction(action) && action.type === FETCH_START
      ? (action.meta?.[key] ?? initialState)
      : state;

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
  iterationDetails: iterationDetailsReducer,
  iterationDetailsLoading: iterationDetailsLoadingReducer,
  iterationDetailsError: iterationDetailsErrorReducer,
  iterationDetailsUnavailable: iterationDetailsUnavailableReducer,
  detailRequestId: detailMetaReducer('requestId', null),
  detailProjectKey: detailMetaReducer('projectKey', null),
  detailPipelineId: detailMetaReducer('pipelineId', null),
  detailIterationId: detailMetaReducer('iterationId', null),
  detailCatalogTransport: detailMetaReducer('catalogTransport', null),
  detailCatalogVersion: detailMetaReducer('catalogVersion', 0),
  detailCatalogRequestId: detailMetaReducer('catalogRequestId', null),
  detailTransport: detailMetaReducer('detailTransport', null),
  comparison: comparisonReducer,
  comparisonLoading: comparisonLoadingReducer,
  comparisonError: comparisonErrorReducer,
});
type CombinedPipelinesState = ReturnType<typeof combinedReducer>;

const isPipelineCatalogAction = (action: PipelineReducerAction): boolean =>
  action.meta?.namespace === PIPELINES_NAMESPACE &&
  [FETCH_START, FETCH_SUCCESS, FETCH_ERROR].includes(action.type);

const isCurrentCatalogRequest = (state: PipelinesState, action: PipelineReducerAction): boolean => {
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

const getPipelineDetailMeta = (action: PipelineReducerAction): PipelineDetailMeta | null => {
  const meta = action.meta;
  if (
    typeof meta?.requestId !== 'number' ||
    typeof meta.projectKey !== 'string' ||
    typeof meta.pipelineId !== 'number' ||
    typeof meta.iterationId !== 'number' ||
    typeof meta.catalogVersion !== 'number' ||
    typeof meta.catalogRequestId !== 'number' ||
    !meta.catalogTransport ||
    !meta.detailTransport
  ) {
    return null;
  }
  return meta as PipelineDetailMeta;
};

const matchesDetailCatalog = (state: PipelinesState, meta: PipelineDetailMeta): boolean =>
  meta.projectKey === state.catalogProjectKey &&
  meta.catalogTransport === state.transport &&
  meta.catalogVersion === state.catalogVersion &&
  meta.catalogRequestId === state.catalogRequestId;

const matchesDetailRequest = (state: PipelinesState, meta: PipelineDetailMeta): boolean =>
  meta.requestId === state.detailRequestId &&
  meta.projectKey === state.detailProjectKey &&
  meta.pipelineId === state.detailPipelineId &&
  meta.iterationId === state.detailIterationId &&
  meta.catalogTransport === state.detailCatalogTransport &&
  meta.catalogVersion === state.detailCatalogVersion &&
  meta.catalogRequestId === state.detailCatalogRequestId &&
  meta.detailTransport === state.detailTransport;

const isCurrentDetailRequest = (state: PipelinesState, action: PipelineReducerAction): boolean => {
  if (!isPipelineDetailAction(action)) return true;
  const meta = getPipelineDetailMeta(action);
  if (!meta || !matchesDetailCatalog(state, meta)) return false;
  if (action.type === FETCH_START) {
    return state.detailRequestId == null || meta.requestId > state.detailRequestId;
  }
  return matchesDetailRequest(state, meta);
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
    !isCurrentIterationRequest(currentState, action) ||
    !isCurrentDetailRequest(currentState, action)
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
    iterationDetailsError: false,
    iterationDetailsUnavailable: false,
    detailRequestId: null,
    detailProjectKey: null,
    detailPipelineId: null,
    detailIterationId: null,
    detailCatalogTransport: null,
    detailCatalogVersion: 0,
    detailCatalogRequestId: null,
    detailTransport: null,
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
  TEST_CASE_LIBRARY_PAGE,
]);
