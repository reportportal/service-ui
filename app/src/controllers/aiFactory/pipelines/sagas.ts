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

import { call, select, all, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { LOGOUT } from 'controllers/auth';

import {
  adaptLivePipelineIterationDetail,
  adaptLivePipelineIterationsPage,
  adaptLivePipelinesPage,
  type LivePage,
} from './liveAdapters';
import { adaptLivePipelineComparison } from './liveCompareAdapter';
import {
  CLEAR_PIPELINE_COMPARISON,
  GET_PIPELINE_COMPARISON,
  GET_PIPELINE_ITERATION_DETAILS,
  GET_PIPELINE_ITERATIONS,
  GET_PIPELINES,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINE_COMPARISON_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';
import {
  GetPipelineComparisonAction,
  GetPipelineIterationDetailsAction,
  GetPipelineIterationsAction,
  GetPipelinesAction,
  PipelineCatalogItem,
  PipelinePageRequest,
  PipelinesState,
} from './types';
import {
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelinesStateSelector,
} from './selectors';
import {
  getPipelineCatalogTransport,
  getPipelineDetailTransport,
  PipelineCatalogTransport,
  PipelineDetailTransport,
} from './transport';

let abortController: AbortController | undefined;
let pipelineCatalogRequestId = 0;
const iterationsAbortControllers = new Set<AbortController>();
let pipelineIterationsRequestId = 0;
let iterationDetailsAbortController: AbortController | undefined;
let iterationDetailsRequestId = 0;
let comparisonAbortController: AbortController | undefined;

interface PipelineDetailRequestMeta {
  namespace: typeof PIPELINE_ITERATION_DETAILS_NAMESPACE;
  requestId: number;
  projectKey: string;
  pipelineId: number;
  iterationId: number;
  catalogTransport: PipelineCatalogTransport;
  catalogVersion: number;
  catalogRequestId: number;
  detailTransport: PipelineDetailTransport;
  detailFailureKind?: 'forbidden' | 'notFound';
}

const resolvePageRequest = (request?: PipelinePageRequest) => {
  const offset = request?.offset ?? 0;
  const limit = request?.limit ?? 100;
  const search = request?.search?.trim() ?? '';
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 200
  ) {
    throw new Error('Invalid pipeline page request');
  }
  const hasQuery =
    request?.offset !== undefined || request?.limit !== undefined || request?.search !== undefined;
  const query = hasQuery ? { offset, limit, ...(search ? { search } : {}) } : {};
  return { offset, search, query };
};

interface PipelineCatalogResult {
  data: PipelineCatalogItem[];
  page?: LivePage & { offset: number };
  transport: PipelineCatalogTransport;
}

const resolvePipelineCatalogResult = (
  rawData: unknown,
  offset: number,
): PipelineCatalogResult => {
  const result = adaptLivePipelinesPage(rawData);
  if (result.page.number !== Math.floor(offset / result.page.size) + 1) {
    throw new Error('Unexpected pipeline catalog page');
  }
  return { data: result.content, page: { ...result.page, offset }, transport: 'live' };
};

function* getPipelines(action: GetPipelinesAction): Generator {
  const controller = new AbortController();
  abortController?.abort();
  iterationsAbortControllers.forEach((iterationsController) => iterationsController.abort());
  iterationsAbortControllers.clear();
  iterationDetailsAbortController?.abort();
  comparisonAbortController?.abort();
  abortController = controller;
  pipelineCatalogRequestId += 1;
  const catalogRequestId = pipelineCatalogRequestId;
  let projectKey = '';

  try {
    projectKey = (yield select(projectKeySelector)) as string;
    const transport = getPipelineCatalogTransport();
    const { offset, search, query } = resolvePageRequest(action.payload);
    const meta = {
      namespace: PIPELINES_NAMESPACE,
      catalogRequestId,
      projectKey,
      transport: transport.mode,
      search,
    };

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta,
    });

    const rawData = (yield call(fetch, URLS.pipelineCatalog(projectKey, query), {
      signal: controller.signal,
    })) as unknown;
    const {
      data,
      page,
      transport: resolvedTransport,
    } = resolvePipelineCatalogResult(rawData, offset);

    yield put({
      type: FETCH_SUCCESS,
      payload: { data, page },
      meta: {
        ...meta,
        transport: resolvedTransport,
      },
    });
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    const meta = { namespace: PIPELINES_NAMESPACE, catalogRequestId, projectKey, isCancellation };
    yield put({ type: FETCH_ERROR, payload: error, error: true, meta });
    const state = (yield select(pipelinesStateSelector)) as PipelinesState;
    const isCurrentRequest =
      state.catalogRequestId === catalogRequestId && state.catalogProjectKey === projectKey;

    if (!isCancellation && isCurrentRequest) {
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  }
}

function handleLogoutDuringPipelinesFetch(): void {
  const controller = abortController;
  abortController = undefined;
  controller?.abort();
}

function* watchGetPipelines() {
  yield takeLatest(GET_PIPELINES, getPipelines);
  yield takeEvery(LOGOUT, handleLogoutDuringPipelinesFetch);
}

interface PipelineIterationsRequest {
  projectKey: string;
  pipelineId: number;
  transport: PipelineCatalogTransport;
  catalogVersion: number;
  requestId: number;
  signal: AbortSignal;
  pageRequest: PipelinePageRequest;
}

interface PipelineIterationsResult {
  pipelineId: number;
  hasError: boolean;
}

function* fetchPipelineIterations({
  projectKey,
  pipelineId,
  transport,
  catalogVersion,
  requestId,
  signal,
  pageRequest,
}: PipelineIterationsRequest): Generator {
  const meta = {
    namespace: PIPELINE_ITERATIONS_NAMESPACE,
    pipelineId,
    transport,
    catalogVersion,
    requestId,
  };
  yield put({ type: FETCH_START, payload: { projectKey }, meta });

  try {
    const { offset, query } = resolvePageRequest(pageRequest);
    const rawData = (yield call(
      fetch,
      URLS.pipelineCatalogIterations(projectKey, pipelineId, query),
      { signal },
    )) as unknown;
    const result = adaptLivePipelineIterationsPage(rawData, pipelineId);
    if (result.page.number !== Math.floor(offset / result.page.size) + 1) {
      throw new Error('Unexpected pipeline iteration page');
    }
    const data = result.content;
    const page = { ...result.page, offset };
    yield put({ type: FETCH_SUCCESS, payload: { data, page }, meta });
    return { pipelineId, hasError: false };
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    yield put({
      type: FETCH_ERROR,
      payload: error,
      error: true,
      meta: { ...meta, isCancellation },
    });
    return { pipelineId, hasError: !isCancellation };
  }
}

function* getPipelineIterations(action: GetPipelineIterationsAction): Generator {
  const controller = new AbortController();
  iterationsAbortControllers.add(controller);
  pipelineIterationsRequestId += 1;
  const requestId = pipelineIterationsRequestId;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const transport = (yield select(pipelineCatalogTransportSelector)) as PipelineCatalogTransport;
    const catalogVersion = (yield select(pipelineCatalogVersionSelector)) as number;
    const pipelineIds = Array.from(
      new Set(
        action.payload.pipelineIds.filter(
          (pipelineId) => Number.isSafeInteger(pipelineId) && pipelineId > 0,
        ),
      ),
    );
    const results = (yield all(
      pipelineIds.map((pipelineId) =>
        call(fetchPipelineIterations, {
          projectKey,
          pipelineId,
          transport,
          catalogVersion,
          requestId,
          signal: controller.signal,
          pageRequest: action.payload,
        }),
      ),
    )) as PipelineIterationsResult[];

    const state = (yield select(pipelinesStateSelector)) as PipelinesState;
    const hasCurrentFailure = results.some(
      ({ pipelineId, hasError }) =>
        hasError &&
        state.catalogVersion === catalogVersion &&
        state.transport === transport &&
        state.iterationRequestIdByPipeline[pipelineId] === requestId,
    );
    if (hasCurrentFailure) {
      yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
    }
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';

    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINE_ITERATIONS_NAMESPACE, error));
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  } finally {
    iterationsAbortControllers.delete(controller);
  }
}

function handleLogoutDuringIterationsFetch(): void {
  iterationsAbortControllers.forEach((controller) => controller.abort());
  iterationsAbortControllers.clear();
}

function* watchGetPipelineIterations() {
  yield takeEvery(GET_PIPELINE_ITERATIONS, getPipelineIterations);
  yield takeEvery(LOGOUT, handleLogoutDuringIterationsFetch);
}

const isPositiveIdentity = (value: number): boolean => Number.isSafeInteger(value) && value > 0;

function* createPipelineDetailMeta(
  action: GetPipelineIterationDetailsAction,
): Generator<unknown, PipelineDetailRequestMeta | undefined> {
  const projectKey = (yield select(projectKeySelector)) as string;
  const catalogTransport = (yield select(
    pipelineCatalogTransportSelector,
  )) as PipelineCatalogTransport;
  const catalogVersion = (yield select(pipelineCatalogVersionSelector)) as number;
  const catalogRequestId = (yield select(pipelineCatalogRequestIdSelector)) as number | null;
  const catalogProjectKey = (yield select(pipelineCatalogProjectKeySelector)) as string | null;
  const { pipelineId, iterationId } = action.payload;
  const isLiveCatalog = catalogTransport === 'live';
  if (
    !projectKey ||
    (!isLiveCatalog &&
      (catalogVersion <= 0 || catalogRequestId === null || catalogProjectKey !== projectKey)) ||
    !isPositiveIdentity(pipelineId) ||
    !isPositiveIdentity(iterationId)
  ) {
    return undefined;
  }
  iterationDetailsRequestId += 1;
  return {
    namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE,
    requestId: iterationDetailsRequestId,
    projectKey,
    pipelineId,
    iterationId,
    catalogTransport,
    catalogVersion: isLiveCatalog ? 0 : catalogVersion,
    catalogRequestId: isLiveCatalog ? 0 : catalogRequestId,
    detailTransport: getPipelineDetailTransport(catalogTransport),
  };
}

function* fetchPipelineIterationDetail(
  meta: PipelineDetailRequestMeta,
  signal: AbortSignal,
): Generator<unknown, { data?: ReturnType<typeof adaptLivePipelineIterationDetail>; status: number; isEmpty?: boolean }> {
  const response = (yield call(
    fetch,
    URLS.pipelineIterationById(meta.projectKey, meta.iterationId),
    {
      signal,
      validateStatus: (status: number) =>
        (status >= 200 && status < 300) || status === 403 || status === 404,
    },
    true,
  )) as { status: number; data: unknown };
  if (response.status === 403 || response.status === 404) {
    return { status: response.status };
  }
  const emptyObject = typeof response.data === 'object' && response.data !== null &&
    !Array.isArray(response.data) && Object.keys(response.data).length === 0;
  if (response.status === 204 || response.data == null || emptyObject) {
    return { status: response.status, isEmpty: true };
  }
  return {
    status: response.status,
    data: adaptLivePipelineIterationDetail(response.data, meta.pipelineId, meta.iterationId),
  };
}

function* handlePipelineDetailFailure(
  error: unknown,
  requestMeta: PipelineDetailRequestMeta,
): Generator {
  const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
  yield put({
    type: FETCH_ERROR,
    payload: error,
    error: true,
    meta: { ...requestMeta, isCancellation },
  });
  const state = (yield select(pipelinesStateSelector)) as PipelinesState;
  const isCurrentRequest =
    state.detailRequestId === requestMeta.requestId &&
    state.detailProjectKey === requestMeta.projectKey &&
    state.detailCatalogVersion === requestMeta.catalogVersion &&
    state.detailCatalogRequestId === requestMeta.catalogRequestId;
  if (!isCancellation && isCurrentRequest) {
    yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
  }
}

function* getPipelineIterationDetails(action: GetPipelineIterationDetailsAction): Generator {
  const requestMeta = (yield call(createPipelineDetailMeta, action)) as
    | PipelineDetailRequestMeta
    | undefined;
  if (!requestMeta) return;

  const controller = new AbortController();
  iterationDetailsAbortController?.abort();
  iterationDetailsAbortController = controller;

  try {
    yield put({
      type: FETCH_START,
      payload: { projectKey: requestMeta.projectKey },
      meta: requestMeta,
    });

    const result = (yield call(fetchPipelineIterationDetail, requestMeta, controller.signal)) as {
      data?: ReturnType<typeof adaptLivePipelineIterationDetail>;
      status: number;
      isEmpty?: boolean;
    };
    if (result.status === 403 || result.status === 404 || result.isEmpty) {
      yield put({
        type: FETCH_ERROR,
        payload: new Error('Pipeline iteration detail is unavailable'),
        error: true,
        meta: {
          ...requestMeta,
          ...(result.status === 403 || result.status === 404
            ? { detailFailureKind: result.status === 403 ? 'forbidden' : 'notFound' }
            : { isUnavailable: true }),
          silent: true,
        },
      });
      return;
    }
    yield put({ type: FETCH_SUCCESS, payload: { data: result.data }, meta: requestMeta });
  } catch (error) {
    yield call(handlePipelineDetailFailure, error, requestMeta);
  } finally {
    if (iterationDetailsAbortController === controller) {
      iterationDetailsAbortController = undefined;
    }
  }
}

function handleLogoutDuringIterationDetailsFetch(): void {
  const controller = iterationDetailsAbortController;
  iterationDetailsAbortController = undefined;
  controller?.abort();
}

function* watchGetPipelineIterationDetails() {
  yield takeEvery(GET_PIPELINE_ITERATION_DETAILS, getPipelineIterationDetails);
  yield takeEvery(LOGOUT, handleLogoutDuringIterationDetailsFetch);
}

function* getPipelineComparison(action: GetPipelineComparisonAction): Generator {
  const controller = new AbortController();
  comparisonAbortController?.abort();
  comparisonAbortController = controller;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const { pipelineId, candidateIterationId, baselineIterationId } = action.payload;
    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: PIPELINE_COMPARISON_NAMESPACE },
    });
    const raw = (yield call(
      fetch,
      URLS.pipelineIterationComparison(projectKey, candidateIterationId, baselineIterationId),
      { signal: controller.signal },
    )) as unknown;
    const data = {
      ...adaptLivePipelineComparison(raw, pipelineId, candidateIterationId, baselineIterationId),
      projectKey,
    };
    yield put(fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data }));
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINE_COMPARISON_NAMESPACE, error));
      yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
    }
  }
}

function clearPipelineComparison(): void {
  const controller = comparisonAbortController;
  comparisonAbortController = undefined;
  controller?.abort();
}

function* watchGetPipelineComparison() {
  yield takeLatest(GET_PIPELINE_COMPARISON, getPipelineComparison);
  yield takeEvery(CLEAR_PIPELINE_COMPARISON, clearPipelineComparison);
  yield takeEvery(LOGOUT, clearPipelineComparison);
}

export function* aiFactoryPipelinesSagas() {
  yield all([
    watchGetPipelines(),
    watchGetPipelineIterations(),
    watchGetPipelineIterationDetails(),
    watchGetPipelineComparison(),
  ]);
}
