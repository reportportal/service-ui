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

import { fetchErrorAction, fetchSuccessAction } from 'controllers/fetch';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { LOGOUT } from 'controllers/auth';
import {
  CLEAR_PAGE_STATE,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
} from 'controllers/pages';
import { PipelineComparison } from 'types/aiFactory';

import { getPipelineComparisonAction, clearPipelineComparisonAction } from './actionCreators';
import {
  PIPELINE_COMPARISON_NAMESPACE,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';
import { aiFactoryPipelinesReducer } from './reducer';
import type { PipelinesState } from './types';

const comparison: PipelineComparison = {
  mode: 'status-only',
  pipelineId: 1,
  candidate: { id: 102, number: 2, status: 'COMPLETED' },
  baseline: { id: 101, number: 1, status: 'IN_REVIEW' },
  hasDifferentRequirements: false,
  stages: [],
};

describe('aiFactoryPipelinesReducer comparison state', () => {
  test('clears a stale comparison immediately when another comparison is requested', () => {
    const loaded = aiFactoryPipelinesReducer(
      undefined,
      fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data: comparison }),
    );

    const requested = aiFactoryPipelinesReducer(
      loaded,
      getPipelineComparisonAction(1, 103, 102),
    ) as PipelinesState;

    expect(requested.comparison).toBeNull();
    expect(requested.comparisonError).toBe(false);
  });

  test('tracks loading, success, and error independently for the comparison namespace', () => {
    const loading = aiFactoryPipelinesReducer(undefined, {
      type: FETCH_START,
      meta: { namespace: PIPELINE_COMPARISON_NAMESPACE },
    });
    expect(loading).toMatchObject({
      comparison: null,
      comparisonLoading: true,
      comparisonError: false,
    });

    const loaded = aiFactoryPipelinesReducer(
      loading,
      fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data: comparison }),
    );
    expect(loaded).toMatchObject({
      comparison,
      comparisonLoading: false,
      comparisonError: false,
    });

    const failed = aiFactoryPipelinesReducer(
      loaded,
      fetchErrorAction(PIPELINE_COMPARISON_NAMESPACE, new Error('failed')),
    );
    expect(failed).toMatchObject({
      comparison: null,
      comparisonLoading: false,
      comparisonError: true,
    });
  });

  test('clears comparison data, loading, and error state explicitly', () => {
    const failedWhileLoading = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    };

    expect(
      aiFactoryPipelinesReducer(failedWhileLoading, clearPipelineComparisonAction()),
    ).toMatchObject({
      comparison: null,
      comparisonLoading: false,
      comparisonError: false,
    });
  });

  test('ignores fetch results from other namespaces', () => {
    const current = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    };

    expect(
      aiFactoryPipelinesReducer(current, fetchSuccessAction('anotherNamespace', { data: null })),
    ).toMatchObject({
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    });
  });
});

describe('aiFactoryPipelinesReducer catalog provenance', () => {
  const catalogAction = (
    type: typeof FETCH_START | typeof FETCH_SUCCESS | typeof FETCH_ERROR,
    catalogRequestId: number,
    projectKey: string,
    data?: unknown[],
  ) => ({
    type,
    payload: data === undefined ? undefined : { data },
    meta: {
      namespace: PIPELINES_NAMESPACE,
      catalogRequestId,
      projectKey,
      transport: 'mock' as const,
      transportFallback: false,
    },
  });

  test('stores the resolved transport and whether configuration fell back', () => {
    const loading = aiFactoryPipelinesReducer(undefined, catalogAction(FETCH_START, 1, 'demo'));
    const state = aiFactoryPipelinesReducer(loading, {
      ...catalogAction(FETCH_SUCCESS, 1, 'demo', []),
      meta: {
        ...catalogAction(FETCH_SUCCESS, 1, 'demo').meta,
        transportFallback: true,
      },
    }) as PipelinesState;

    expect(state).toMatchObject({
      data: [],
      transport: 'mock',
      transportFallback: true,
      catalogVersion: 1,
      catalogProjectKey: 'demo',
      catalogRequestId: 1,
    });
  });

  test('accepted LP1 START clears catalog and downstream state before success establishes a new version', () => {
    const populated = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      catalogVersion: 4,
      catalogRequestId: 4,
      catalogProjectKey: 'demo',
      data: [{ id: 1 }],
      iterationsByPipeline: { 1: [], 2: [] },
      iterationsLoadingByPipeline: { 1: true, 2: false },
      iterationsErrorByPipeline: { 1: false, 2: true },
      iterationRequestIdByPipeline: { 1: 10, 2: 11 },
      iterationDetails: { id: 101 },
      iterationDetailsLoading: true,
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    } as PipelinesState;

    const loading = aiFactoryPipelinesReducer(
      populated,
      catalogAction(FETCH_START, 5, 'demo'),
    ) as PipelinesState;

    expect(loading).toMatchObject({
      data: null,
      catalogVersion: 0,
      catalogRequestId: 5,
      catalogProjectKey: 'demo',
      iterationsByPipeline: null,
      iterationsLoadingByPipeline: {},
      iterationsErrorByPipeline: {},
      iterationRequestIdByPipeline: {},
      iterationDetails: null,
      iterationDetailsLoading: false,
      comparison: null,
      comparisonLoading: false,
      comparisonError: false,
    });

    const refreshed = aiFactoryPipelinesReducer(
      loading,
      catalogAction(FETCH_SUCCESS, 5, 'demo', []),
    ) as PipelinesState;

    expect(refreshed).toMatchObject({
      catalogVersion: 5,
      data: [],
      iterationsByPipeline: null,
      iterationsLoadingByPipeline: {},
      iterationsErrorByPipeline: {},
      iterationRequestIdByPipeline: {},
    });
  });

  test('ignores stale LP1 success and error after a project change', () => {
    const firstRequest = aiFactoryPipelinesReducer(
      undefined,
      catalogAction(FETCH_START, 1, 'first'),
    ) as PipelinesState;
    const current = aiFactoryPipelinesReducer(
      firstRequest,
      catalogAction(FETCH_START, 2, 'second'),
    ) as PipelinesState;

    expect(
      aiFactoryPipelinesReducer(current, catalogAction(FETCH_SUCCESS, 1, 'first', [{ id: 1 }])),
    ).toBe(current);
    expect(aiFactoryPipelinesReducer(current, catalogAction(FETCH_ERROR, 1, 'first'))).toBe(
      current,
    );
  });

  test.each([
    [
      'page reset',
      {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: PROJECT_PIPELINES_PAGE, newPage: PROJECT_DASHBOARD_PAGE },
      },
    ],
    ['logout', { type: LOGOUT }],
  ])('ignores stale LP1 completion after %s', (_description, resetAction) => {
    const loading = aiFactoryPipelinesReducer(
      undefined,
      catalogAction(FETCH_START, 1, 'demo'),
    ) as PipelinesState;
    const reset = aiFactoryPipelinesReducer(loading, resetAction) as PipelinesState;
    const stale = aiFactoryPipelinesReducer(
      reset,
      catalogAction(FETCH_SUCCESS, 1, 'demo', [{ id: 1 }]),
    ) as PipelinesState;
    const staleError = aiFactoryPipelinesReducer(
      reset,
      catalogAction(FETCH_ERROR, 1, 'demo'),
    ) as PipelinesState;

    expect(stale).toBe(reset);
    expect(staleError).toBe(reset);
    expect(stale).toMatchObject({
      data: null,
      catalogVersion: 0,
      catalogRequestId: null,
      catalogProjectKey: null,
    });
  });

  test('keeps catalog provenance unchanged for unrelated fetches', () => {
    const current = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      transport: 'live' as const,
      transportFallback: true,
    };

    const state = aiFactoryPipelinesReducer(current, {
      type: FETCH_SUCCESS,
      payload: { data: [] },
      meta: { namespace: PIPELINE_ITERATIONS_NAMESPACE, pipelineId: 1 },
    }) as PipelinesState;

    expect(state.transport).toBe('live');
    expect(state.transportFallback).toBe(true);
  });
});

describe('aiFactoryPipelinesReducer per-pipeline iteration state', () => {
  const fetchAction = (
    type: typeof FETCH_START | typeof FETCH_SUCCESS | typeof FETCH_ERROR,
    pipelineId: number,
    data?: unknown[],
    isCancellation = false,
    requestId = pipelineId,
    catalogVersion = 0,
    transport: 'mock' | 'live' = 'mock',
  ) => ({
    type,
    payload: data === undefined ? undefined : { data },
    meta: {
      namespace: PIPELINE_ITERATIONS_NAMESPACE,
      pipelineId,
      isCancellation,
      requestId,
      catalogVersion,
      transport,
    },
  });

  test('preserves successful siblings when another pipeline fails', () => {
    const firstPipelineIterations = [{ kind: 'reduced', id: 101, pipelineId: 1, number: 1 }];
    const secondPipelineIterations = [{ kind: 'reduced', id: 201, pipelineId: 2, number: 1 }];
    let state = aiFactoryPipelinesReducer(undefined, fetchAction(FETCH_START, 1)) as PipelinesState;
    state = aiFactoryPipelinesReducer(state, fetchAction(FETCH_START, 2));
    state = aiFactoryPipelinesReducer(
      state,
      fetchAction(FETCH_SUCCESS, 1, firstPipelineIterations),
    );
    state = aiFactoryPipelinesReducer(state, fetchAction(FETCH_ERROR, 2));

    expect(state).toMatchObject({
      iterationsByPipeline: { 1: firstPipelineIterations },
      iterationsLoadingByPipeline: { 1: false, 2: false },
      iterationsErrorByPipeline: { 1: false, 2: true },
    });

    state = aiFactoryPipelinesReducer(
      state,
      fetchAction(FETCH_SUCCESS, 2, secondPipelineIterations),
    );
    expect(state.iterationsByPipeline).toEqual({
      1: firstPipelineIterations,
      2: secondPipelineIterations,
    });
  });

  test('isolates retry loading and error reset to the requested pipeline', () => {
    const failed = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      iterationsLoadingByPipeline: { 1: false, 2: false },
      iterationsErrorByPipeline: { 1: false, 2: true },
    } as PipelinesState;

    const retrying = aiFactoryPipelinesReducer(
      failed,
      fetchAction(FETCH_START, 2),
    ) as PipelinesState;

    expect(retrying.iterationsLoadingByPipeline).toEqual({ 1: false, 2: true });
    expect(retrying.iterationsErrorByPipeline).toEqual({ 1: false, 2: false });
  });

  test('does not expose request cancellation as a pipeline error', () => {
    const loading = aiFactoryPipelinesReducer(
      undefined,
      fetchAction(FETCH_START, 2, undefined, false, 10),
    ) as PipelinesState;
    const state = aiFactoryPipelinesReducer(
      loading,
      fetchAction(FETCH_ERROR, 2, undefined, true, 10),
    ) as PipelinesState;

    expect(state.iterationsLoadingByPipeline).toEqual({ 2: false });
    expect(state.iterationsErrorByPipeline).toEqual({ 2: false });
  });

  test.each([
    ['request id', { requestId: 10, catalogVersion: 0, transport: 'mock' as const }],
    ['catalog version', { requestId: 11, catalogVersion: 1, transport: 'mock' as const }],
    ['transport', { requestId: 11, catalogVersion: 0, transport: 'live' as const }],
  ])('ignores a stale LP2 completion with mismatched %s', (_field, staleMeta) => {
    let state = aiFactoryPipelinesReducer(
      undefined,
      fetchAction(FETCH_START, 2, undefined, false, 11),
    ) as PipelinesState;
    const currentState = state;

    state = aiFactoryPipelinesReducer(state, {
      type: FETCH_SUCCESS,
      payload: { data: [{ id: 201 }] },
      meta: {
        namespace: PIPELINE_ITERATIONS_NAMESPACE,
        pipelineId: 2,
        ...staleMeta,
      },
    }) as PipelinesState;

    expect(state).toBe(currentState);
    expect(state.iterationsLoadingByPipeline).toEqual({ 2: true });
    expect(state.iterationsByPipeline).toBeNull();
  });

  test('ignores aggregate iteration actions without a pipeline identity', () => {
    const current = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      iterationsByPipeline: { 1: [] },
      iterationsLoadingByPipeline: { 1: false },
      iterationsErrorByPipeline: { 1: false },
    } as PipelinesState;

    const state = aiFactoryPipelinesReducer(current, {
      type: FETCH_ERROR,
      meta: { namespace: PIPELINE_ITERATIONS_NAMESPACE },
    });

    expect(state).toMatchObject({
      iterationsByPipeline: { 1: [] },
      iterationsLoadingByPipeline: { 1: false },
      iterationsErrorByPipeline: { 1: false },
    });
  });
});

describe('aiFactoryPipelinesReducer iteration detail provenance', () => {
  const catalogAction = (type: typeof FETCH_START | typeof FETCH_SUCCESS, data?: unknown[]) => ({
    type,
    payload: data === undefined ? undefined : { data },
    meta: {
      namespace: PIPELINES_NAMESPACE,
      catalogRequestId: 5,
      projectKey: 'demo',
      transport: 'live' as const,
      transportFallback: false,
    },
  });
  const detailMeta = {
    namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE,
    requestId: 11,
    projectKey: 'demo',
    pipelineId: 7,
    iterationId: 103,
    catalogTransport: 'live' as const,
    catalogVersion: 5,
    catalogRequestId: 5,
    detailTransport: 'live' as const,
  };
  const detail = {
    kind: 'reduced' as const,
    id: 103,
    pipelineId: 7,
    number: 3,
    status: 'PASSED' as const,
    attributes: [],
    stages: [],
  };

  const createCatalogState = () => {
    const loading = aiFactoryPipelinesReducer(undefined, catalogAction(FETCH_START));
    return aiFactoryPipelinesReducer(
      loading,
      catalogAction(FETCH_SUCCESS, [{ kind: 'reduced', id: 7, name: 'Pipeline' }]),
    ) as PipelinesState;
  };

  const detailAction = (
    type: typeof FETCH_START | typeof FETCH_SUCCESS | typeof FETCH_ERROR,
    meta: Record<string, unknown> = detailMeta,
  ) => ({
    type,
    payload: type === FETCH_SUCCESS ? { data: detail } : undefined,
    meta,
  });

  test('accepted detail START clears old detail and records the complete request provenance', () => {
    const staleDetailState = {
      ...createCatalogState(),
      iterationDetails: { ...detail, id: 102 },
      iterationDetailsError: true,
      iterationDetailsUnavailable: true,
    } as PipelinesState;

    const state = aiFactoryPipelinesReducer(
      staleDetailState,
      detailAction(FETCH_START),
    ) as PipelinesState;

    expect(state).toMatchObject({
      iterationDetails: null,
      iterationDetailsLoading: true,
      iterationDetailsError: false,
      iterationDetailsUnavailable: false,
      detailRequestId: 11,
      detailProjectKey: 'demo',
      detailPipelineId: 7,
      detailIterationId: 103,
      detailCatalogTransport: 'live',
      detailCatalogVersion: 5,
      detailCatalogRequestId: 5,
      detailTransport: 'live',
    });
  });

  test('keeps the current detail mounted while the same iteration is refreshed', () => {
    const currentDetail = { ...detail, id: 103, pipelineId: 7 };
    const loadedState = {
      ...createCatalogState(),
      iterationDetails: currentDetail,
    } as PipelinesState;

    const state = aiFactoryPipelinesReducer(
      loadedState,
      detailAction(FETCH_START),
    ) as PipelinesState;

    expect(state).toMatchObject({
      iterationDetails: currentDetail,
      iterationDetailsLoading: true,
      iterationDetailsError: false,
      iterationDetailsUnavailable: false,
    });
  });

  test('accepts only the matching detail success and exposes its reduced payload', () => {
    const loading = aiFactoryPipelinesReducer(
      createCatalogState(),
      detailAction(FETCH_START),
    ) as PipelinesState;

    const state = aiFactoryPipelinesReducer(loading, detailAction(FETCH_SUCCESS)) as PipelinesState;

    expect(state).toMatchObject({
      iterationDetails: detail,
      iterationDetailsLoading: false,
      iterationDetailsError: false,
      iterationDetailsUnavailable: false,
    });
  });

  test.each([
    ['request id', { requestId: 12 }],
    ['project', { projectKey: 'other-project' }],
    ['pipeline identity', { pipelineId: 8 }],
    ['iteration identity', { iterationId: 104 }],
    ['catalog transport', { catalogTransport: 'mock' as const }],
    ['catalog version', { catalogVersion: 6 }],
    ['catalog request', { catalogRequestId: 6 }],
    ['detail transport', { detailTransport: 'unavailable' as const }],
  ])('ignores stale detail success and error with mismatched %s', (_description, overrides) => {
    const loading = aiFactoryPipelinesReducer(
      createCatalogState(),
      detailAction(FETCH_START),
    ) as PipelinesState;
    const staleMeta = { ...detailMeta, ...overrides };

    expect(aiFactoryPipelinesReducer(loading, detailAction(FETCH_SUCCESS, staleMeta))).toBe(
      loading,
    );
    expect(aiFactoryPipelinesReducer(loading, detailAction(FETCH_ERROR, staleMeta))).toBe(loading);
  });

  test.each([
    ['ordinary failure', {}, true, false],
    ['unavailable transport', { isUnavailable: true }, false, true],
    ['request cancellation', { isCancellation: true }, false, false],
  ])(
    'records %s without retaining stale detail data',
    (_description, flags, expectedError, expectedUnavailable) => {
      const loading = aiFactoryPipelinesReducer(
        createCatalogState(),
        detailAction(FETCH_START),
      ) as PipelinesState;
      const state = aiFactoryPipelinesReducer(loading, {
        ...detailAction(FETCH_ERROR),
        meta: { ...detailMeta, ...flags },
      }) as PipelinesState;

      expect(state).toMatchObject({
        iterationDetails: null,
        iterationDetailsLoading: false,
        iterationDetailsError: expectedError,
        iterationDetailsUnavailable: expectedUnavailable,
      });
    },
  );

  test('rejects a stale completion after the iteration route leaves the scoped workflow', () => {
    const loading = aiFactoryPipelinesReducer(
      createCatalogState(),
      detailAction(FETCH_START),
    ) as PipelinesState;
    const reset = aiFactoryPipelinesReducer(loading, {
      type: CLEAR_PAGE_STATE,
      payload: {
        oldPage: PROJECT_PIPELINE_ITERATION_PAGE,
        newPage: PROJECT_DASHBOARD_PAGE,
      },
    }) as PipelinesState;

    expect(aiFactoryPipelinesReducer(reset, detailAction(FETCH_SUCCESS))).toBe(reset);
    expect(aiFactoryPipelinesReducer(reset, detailAction(FETCH_ERROR))).toBe(reset);
    expect(reset).toMatchObject({
      catalogVersion: 0,
      catalogRequestId: null,
      iterationDetails: null,
      detailRequestId: null,
    });
  });
});
