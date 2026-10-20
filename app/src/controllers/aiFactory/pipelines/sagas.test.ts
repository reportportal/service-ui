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

import { runSaga } from 'redux-saga';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { CriterionKey, PipelineCompareRS, StageKey, StageStatus } from 'types/aiFactory';

import {
  getPipelineComparisonAction,
  getPipelineIterationDetailsAction,
  getPipelineIterationsAction,
  getPipelinesAction,
} from './actionCreators';
import {
  PIPELINE_COMPARISON_NAMESPACE,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';
import { aiFactoryPipelinesSagas, normalizePipelineComparison } from './sagas';
import {
  PipelineCatalogTransport,
} from './transport';

jest.mock('common/utils', () => {
  const actual = jest.requireActual<typeof import('common/utils')>('common/utils');

  return { ...actual, fetch: jest.fn() };
});

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;

interface SagaStateOptions {
  transport?: PipelineCatalogTransport;
  catalogVersion?: number;
  catalogProjectKey?: string | null;
}

const createSagaState = ({
  transport = 'live',
  catalogVersion = 0,
  catalogProjectKey = null,
}: SagaStateOptions = {}) => ({
  project: { info: { projectKey: 'demo' } },
  aiFactoryPipelines: {
    data: [],
    transport,
    catalogVersion,
    catalogRequestId: catalogVersion > 0 ? catalogVersion : null,
    catalogProjectKey,
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    comparison: null,
  },
});

const startPipelineSagas = (
  state: ReturnType<typeof createSagaState>,
  onDispatch: (action: unknown) => void = () => undefined,
) => {
  const subscribers: Array<(action: unknown) => void> = [];
  const dispatched: unknown[] = [];
  const task = runSaga(
    {
      subscribe: (subscriber: (action: unknown) => void) => {
        subscribers.push(subscriber);
        return () => {
          const index = subscribers.indexOf(subscriber);
          if (index >= 0) subscribers.splice(index, 1);
        };
      },
      dispatch: (action) => {
        dispatched.push(action);
        onDispatch(action);
      },
      getState: () => state,
    },
    aiFactoryPipelinesSagas,
  );

  return {
    dispatched,
    dispatch: (action: unknown) => subscribers.slice().forEach((subscriber) => subscriber(action)),
    stop: async () => {
      task.cancel();
      await task.done;
    },
  };
};

const response = (overrides: Partial<PipelineCompareRS> = {}): PipelineCompareRS => ({
  current: {
    id: 102,
    pipelineId: 1,
    iterationNumber: 2,
    status: 'PASSED',
    attributes: { spec: 'REQ-2', requirementTitle: 'Candidate', jira: 'JIRA-2' },
    metrics: {
      testCasesCount: 4,
      suiteScore: 91,
      readyCount: 3,
      fixRoundsCount: 0,
      costTotal: 1.2,
    },
    durationMillis: 1200,
    stages: [
      {
        stageKey: StageKey.GRADE,
        status: 'PASSED',
        metrics: { metric: 91, cost: 0.4, durationMs: 300 },
      },
    ],
  },
  previous: {
    id: 101,
    pipelineId: 1,
    iterationNumber: 1,
    status: 'NEEDS_HUMAN',
    attributes: { spec: 'REQ-1' },
    metrics: { testCasesCount: 3, suiteScore: 80 },
    stages: [
      {
        stageKey: StageKey.CREATE,
        status: 'PASSED',
        metrics: { metric: 3 },
      },
      {
        stageKey: StageKey.GRADE,
        status: 'FAILED',
        metrics: { metric: 80 },
      },
    ],
  },
  ...overrides,
});

const criterionAverages = {
  [CriterionKey.ATOMICITY]: 10,
  [CriterionKey.CLEAR_STEPS]: 15,
  [CriterionKey.EXPECTED_RESULTS]: 16,
  [CriterionKey.NO_INVENTED_LOGIC]: 17,
  [CriterionKey.NO_INVENTED_UI]: 12,
  [CriterionKey.COHERENCE]: 8,
};

const richResponse = (overrides: Partial<PipelineCompareRS> = {}): PipelineCompareRS => {
  const raw = response();
  return {
    ...raw,
    mock: { kind: 'REPORTPORTAL_AI_FACTORY_COMPARE_DEMO', version: 1 },
    current: {
      ...raw.current,
      mockMetrics: {
        requirement: { specId: 'REQ-2', title: 'Candidate', jiraKey: 'JIRA-2' },
        testCasesCount: 4,
        suiteScore: 91,
        readyCount: 3,
        fixRoundsCount: 0,
        autoReadyPromotedCount: 2,
        criterionAverages,
        costTotal: 1.2,
        durationMs: 1200,
      },
      stages: raw.current?.stages?.map((stage) => ({
        ...stage,
        mockMetrics: { metric: 91, cost: 0.4, durationMs: 300 },
      })),
    },
    previous: {
      ...raw.previous,
      mockMetrics: {
        requirement: { specId: 'REQ-1' },
        testCasesCount: 3,
        suiteScore: 80,
        readyCount: 2,
        fixRoundsCount: 1,
        autoReadyPromotedCount: 1,
        criterionAverages,
        costTotal: 1,
        durationMs: 1000,
      },
      stages: raw.previous?.stages?.map((stage) => ({
        ...stage,
        mockMetrics: { metric: stage.stageKey === String(StageKey.CREATE) ? 3 : 80 },
      })),
    },
    ...overrides,
  };
};

describe('normalizePipelineComparison', () => {
  test('treats ordinary LP4 as status-only and ignores opaque rich-looking fields', () => {
    const result = normalizePipelineComparison(response(), 1, 102, 101);

    expect(result).toMatchObject({
      mode: 'status-only',
      pipelineId: 1,
      candidate: {
        id: 102,
        number: 2,
        status: 'COMPLETED',
      },
      baseline: {
        id: 101,
        number: 1,
        status: 'IN_REVIEW',
      },
      hasDifferentRequirements: false,
    });
    expect(result.candidate.requirement).toBeUndefined();
    expect(result.candidate.testCasesCount).toBeUndefined();
    expect(result.candidate.costTotal).toBeUndefined();
    expect(result.candidate.durationMs).toBeUndefined();
    expect(result.stages.map(({ key }) => key)).toEqual([StageKey.GRADE, StageKey.CREATE]);
    expect(result.stages.find(({ key }) => key === String(StageKey.GRADE))?.candidate).toEqual({
      status: StageStatus.PASSED,
    });
  });

  describe('LP1-LP3 live transport', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    test.each([
      ['empty', { content: [], page: { number: 1, size: 100, totalElements: 0, totalPages: 0 } }],
      ['nonempty', {
        content: [{ id: 9, name: 'Real pipeline', type: 'TEST_CASE_GENERATION' }],
        page: { number: 1, size: 100, totalElements: 1, totalPages: 1 },
      }],
    ])('renders %s LP1 response without synthetic data', async (_name, payload) => {
      fetchMock.mockResolvedValue(payload);
      let notifyComplete: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
      const harness = startPipelineSagas(createSagaState(), (action) => {
        const candidate = action as { type?: string; meta?: { namespace?: string } };
        if (candidate.type === FETCH_SUCCESS && candidate.meta?.namespace === PIPELINES_NAMESPACE) {
          notifyComplete();
        }
      });

      await Promise.resolve();
      harness.dispatch(getPipelinesAction());
      await complete;

      expect(fetchMock).toHaveBeenCalledWith(URLS.pipelineCatalog('demo'), {
        signal: expect.any(AbortSignal),
      });
      expect(harness.dispatched).toContainEqual(expect.objectContaining({
        type: FETCH_SUCCESS,
        payload: expect.objectContaining({ data: expect.any(Array) }),
        meta: expect.objectContaining({ namespace: PIPELINES_NAMESPACE, transport: 'live' }),
      }));
      const success = harness.dispatched.find((action) =>
        (action as { type?: string }).type === FETCH_SUCCESS,
      ) as { payload: { data: unknown[] } };
      expect(success.payload.data).toHaveLength(payload.content.length);
      await harness.stop();
    });

    test('reports LP1 failure without substituting mock data', async () => {
      fetchMock.mockRejectedValue(new Error('backend unavailable'));
      let notifyComplete: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
      const harness = startPipelineSagas(createSagaState(), (action) => {
        const candidate = action as { type?: string; meta?: { namespace?: string } };
        if (candidate.type === FETCH_ERROR && candidate.meta?.namespace === PIPELINES_NAMESPACE) {
          notifyComplete();
        }
      });

      await Promise.resolve();
      harness.dispatch(getPipelinesAction());
      await complete;

      expect(harness.dispatched).not.toContainEqual(expect.objectContaining({ type: FETCH_SUCCESS }));
      await harness.stop();
    });

    test('sends LP1 name search and page offset', async () => {
      fetchMock.mockResolvedValue({
        content: [], page: { number: 1, size: 100, totalElements: 0, totalPages: 0 },
      });
      let notifyComplete: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
      const harness = startPipelineSagas(createSagaState(), (action) => {
        const candidate = action as { type?: string; meta?: { namespace?: string } };
        if (candidate.type === FETCH_SUCCESS && candidate.meta?.namespace === PIPELINES_NAMESPACE) {
          notifyComplete();
        }
      });

      await Promise.resolve();
      harness.dispatch(getPipelinesAction({ search: 'missing', offset: 0, limit: 100 }));
      await complete;

      expect(fetchMock).toHaveBeenCalledWith(
        URLS.pipelineCatalog('demo', { offset: 0, limit: 100, search: 'missing' }),
        { signal: expect.any(AbortSignal) },
      );
      await harness.stop();
    });

    test('uses real LP2 and LP3 endpoints for a resolved catalog', async () => {
      fetchMock.mockImplementation((url) => Promise.resolve(
        url.includes('/iteration/')
          ? { status: 200, data: { id: 103, pipelineId: 7, iterationNumber: 3, stages: [] } }
          : { content: [], page: { number: 1, size: 100, totalElements: 0, totalPages: 0 } },
      ));
      let successes = 0;
      let notifyComplete: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
      const harness = startPipelineSagas(
        createSagaState({ transport: 'live', catalogVersion: 1, catalogProjectKey: 'demo' }),
        (action) => {
          const candidate = action as { type?: string; meta?: { namespace?: string } };
          if (candidate.type === FETCH_SUCCESS &&
            [PIPELINE_ITERATIONS_NAMESPACE, PIPELINE_ITERATION_DETAILS_NAMESPACE].includes(
              candidate.meta?.namespace as typeof PIPELINE_ITERATIONS_NAMESPACE,
            )) {
            successes += 1;
            if (successes === 2) notifyComplete();
          }
        },
      );

      await Promise.resolve();
      harness.dispatch(getPipelineIterationsAction([7]));
      harness.dispatch(getPipelineIterationDetailsAction(7, 103));
      await complete;

      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
        URLS.pipelineCatalogIterations('demo', 7),
        URLS.pipelineIterationById('demo', 103),
      ]);
      expect(harness.dispatched).toContainEqual(expect.objectContaining({
        type: FETCH_SUCCESS,
        payload: { data: expect.objectContaining({ kind: 'reduced', id: 103 }) },
        meta: expect.objectContaining({ namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE }),
      }));
      await harness.stop();
    });

    test('loads LP3 directly before the catalog has been fetched', async () => {
      fetchMock.mockResolvedValue({
        status: 200,
        data: { id: 103, pipelineId: 7, iterationNumber: 3, stages: [] },
      });
      let finish: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { finish = resolve; });
      const harness = startPipelineSagas(createSagaState(), (action) => {
        const candidate = action as { type?: string; meta?: { namespace?: string } };
        if (candidate.type === FETCH_SUCCESS &&
          candidate.meta?.namespace === PIPELINE_ITERATION_DETAILS_NAMESPACE) finish();
      });

      await Promise.resolve();
      harness.dispatch(getPipelineIterationDetailsAction(7, 103));
      await complete;

      expect(fetchMock).toHaveBeenCalledWith(
        URLS.pipelineIterationById('demo', 103),
        expect.objectContaining({ signal: expect.any(AbortSignal), validateStatus: expect.any(Function) }),
        true,
      );
      expect(harness.dispatched).toContainEqual(expect.objectContaining({
        type: FETCH_SUCCESS,
        payload: { data: expect.objectContaining({ id: 103, pipelineId: 7, kind: 'reduced' }) },
        meta: expect.objectContaining({ catalogVersion: 0, catalogRequestId: 0 }),
      }));
      await harness.stop();
    });

    test.each([
      [403, null, 'forbidden'],
      [404, null, 'notFound'],
      [204, null, null],
      [200, {}, null],
    ])('handles LP3 HTTP %s with empty or denied data as an inline state', async (status, data, detailFailureKind) => {
      fetchMock.mockResolvedValue({ status, data });
      let finish: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { finish = resolve; });
      const harness = startPipelineSagas(createSagaState(), (action) => {
        const candidate = action as { type?: string; meta?: { namespace?: string } };
        if (candidate.type === FETCH_ERROR &&
          candidate.meta?.namespace === PIPELINE_ITERATION_DETAILS_NAMESPACE) finish();
      });

      await Promise.resolve();
      harness.dispatch(getPipelineIterationDetailsAction(7, 103));
      await complete;

      expect(harness.dispatched).toContainEqual(expect.objectContaining({
        type: FETCH_ERROR,
        meta: expect.objectContaining({
          namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE,
          silent: true,
          ...(detailFailureKind ? { detailFailureKind } : { isUnavailable: true }),
        }),
      }));
      expect(harness.dispatched).not.toContainEqual(expect.objectContaining({ type: FETCH_SUCCESS }));
      await harness.stop();
    });
    test.each([
      ['invalid pipeline identity', 0, 103],
      ['invalid iteration identity', 7, Number.NaN],
    ])(
      'rejects %s before creating detail state or traffic',
      async (_description, pipelineId, iterationId) => {
        const harness = startPipelineSagas(
          createSagaState({ transport: 'live', catalogVersion: 1, catalogProjectKey: 'demo' }),
        );

        await Promise.resolve();
        harness.dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId));
        await Promise.resolve();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(harness.dispatched).toEqual([]);
        await harness.stop();
      },
    );

    test('runs sibling LP2 requests independently without aborting the first request', async () => {
      const resolvers: Array<(value: unknown) => void> = [];
      let notifyStarted: () => void = () => undefined;
      const bothStarted = new Promise<void>((resolve) => {
        notifyStarted = resolve;
      });
      let successfulRequests = 0;
      let notifyComplete: () => void = () => undefined;
      const bothComplete = new Promise<void>((resolve) => {
        notifyComplete = resolve;
      });
      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvers.push(resolve as (value: unknown) => void);
            if (resolvers.length === 2) notifyStarted();
          }),
      );
      const harness = startPipelineSagas(
        createSagaState({ transport: 'live', catalogVersion: 7, catalogProjectKey: 'demo' }),
        (action) => {
          const candidate = action as { type?: string; meta?: { namespace?: string } };
          if (
            candidate.type === FETCH_SUCCESS &&
            candidate.meta?.namespace === PIPELINE_ITERATIONS_NAMESPACE
          ) {
            successfulRequests += 1;
            if (successfulRequests === 2) notifyComplete();
          }
        },
      );

      await Promise.resolve();
      harness.dispatch(getPipelineIterationsAction([1]));
      harness.dispatch(getPipelineIterationsAction([2]));
      await bothStarted;

      const firstSignal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
      const secondSignal = fetchMock.mock.calls[1][1]?.signal as AbortSignal;
      expect(firstSignal.aborted).toBe(false);
      expect(secondSignal.aborted).toBe(false);
      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
        URLS.pipelineCatalogIterations('demo', 1),
        URLS.pipelineCatalogIterations('demo', 2),
      ]);

      resolvers.forEach((resolve) => resolve({ content: [], page: { number: 1, size: 100, totalElements: 0, totalPages: 0 } }));
      await bothComplete;
      const iterationActions = harness.dispatched.filter((action) => {
        const candidate = action as { meta?: { namespace?: string } };
        return candidate.meta?.namespace === PIPELINE_ITERATIONS_NAMESPACE;
      }) as Array<{
        type: string;
        meta: { pipelineId: number; requestId: number; catalogVersion: number; transport: string };
      }>;
      const starts = iterationActions.filter(({ type }) => type !== FETCH_SUCCESS);
      const successes = iterationActions.filter(({ type }) => type === FETCH_SUCCESS);

      expect(starts).toHaveLength(2);
      expect(successes).toHaveLength(2);
      expect(starts.map(({ meta }) => meta.pipelineId)).toEqual([1, 2]);
      expect(new Set(starts.map(({ meta }) => meta.requestId))).toHaveProperty('size', 2);
      expect(starts.every(({ meta }) => meta.catalogVersion === 7)).toBe(true);
      expect(starts.every(({ meta }) => meta.transport === 'live')).toBe(true);
      await harness.stop();
    });

    test('sends LP2 search and page offset for a single pipeline', async () => {
      fetchMock.mockResolvedValue({
        content: [{ id: 102, pipelineId: 1, iterationNumber: 2, status: 'Passed' }],
        page: { number: 2, size: 1, totalElements: 2, totalPages: 2 },
      });
      let notifyComplete: () => void = () => undefined;
      const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
      const harness = startPipelineSagas(
        createSagaState({ transport: 'live', catalogVersion: 7, catalogProjectKey: 'demo' }),
        (action) => {
          const candidate = action as { type?: string; meta?: { namespace?: string } };
          if (candidate.type === FETCH_SUCCESS &&
            candidate.meta?.namespace === PIPELINE_ITERATIONS_NAMESPACE) notifyComplete();
        },
      );

      await Promise.resolve();
      harness.dispatch(getPipelineIterationsAction([1], { search: '#2', offset: 1, limit: 1 }));
      await complete;

      expect(fetchMock).toHaveBeenCalledWith(
        URLS.pipelineCatalogIterations('demo', 1, { offset: 1, limit: 1, search: '#2' }),
        { signal: expect.any(AbortSignal) },
      );
      expect(harness.dispatched).toContainEqual(expect.objectContaining({
        type: FETCH_SUCCESS,
        payload: {
          data: [expect.objectContaining({ id: 102, pipelineId: 1 })],
          page: { number: 2, size: 1, totalElements: 2, totalPages: 2, offset: 1 },
        },
      }));
      await harness.stop();
    });

    test.each([
      ['stale', false],
      ['current', true],
    ])('%s LP2 failure emits the expected global notification', async (_description, isCurrent) => {
      fetchMock.mockRejectedValue(new Error('request failed'));
      const state = createSagaState({
        transport: 'live',
        catalogVersion: 7,
        catalogProjectKey: 'demo',
      });
      let notifyFailureHandled: () => void = () => undefined;
      const failureHandled = new Promise<void>((resolve) => {
        notifyFailureHandled = resolve;
      });
      const harness = startPipelineSagas(state, (action) => {
        const candidate = action as {
          type?: string;
          meta?: { namespace?: string; pipelineId?: number; requestId?: number };
        };
        if (
          candidate.meta?.namespace === PIPELINE_ITERATIONS_NAMESPACE &&
          candidate.meta.pipelineId === 1 &&
          candidate.meta.requestId !== undefined
        ) {
          if (candidate.type === FETCH_START) {
            state.aiFactoryPipelines.iterationRequestIdByPipeline[1] = isCurrent
              ? candidate.meta.requestId
              : candidate.meta.requestId + 1;
          }
          if (candidate.type === FETCH_ERROR) notifyFailureHandled();
        }
      });

      await Promise.resolve();
      harness.dispatch(getPipelineIterationsAction([1]));
      await failureHandled;
      await Promise.resolve();
      await Promise.resolve();

      const notifications = harness.dispatched.filter((action) => {
        const candidate = action as { payload?: { messageId?: string } };
        return candidate.payload?.messageId === 'aiFactoryPipelinesLoadingFailed';
      });
      expect(notifications).toHaveLength(isCurrent ? 1 : 0);
      await harness.stop();
    });
  });

  test('requests and validates the published LP4 response for a live catalog', async () => {
    fetchMock.mockResolvedValue({
      baseline: {
        id: 11,
        pipelineId: 7,
        pipelineName: 'Generation',
        iterationNumber: 1,
        status: 'Passed',
        statusCategory: 'PASSED',
        stages: [],
      },
      candidate: {
        id: 12,
        pipelineId: 7,
        pipelineName: 'Generation',
        iterationNumber: 2,
        status: 'In review',
        statusCategory: 'WAITING',
        stages: [],
      },
      sameScope: true,
      metrics: [{ key: 'score', baseline: '80', candidate: '90', delta: '10' }],
    });
    let notifyComplete: () => void = () => undefined;
    const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
    const harness = startPipelineSagas(createSagaState({ transport: 'live' }), (action) => {
      const result = action as { type?: string; meta?: { namespace?: string } };
      if (result.type === FETCH_SUCCESS && result.meta?.namespace === PIPELINE_COMPARISON_NAMESPACE) {
        notifyComplete();
      }
    });
    await Promise.resolve();
    harness.dispatch(getPipelineComparisonAction(7, 12, 11));
    await complete;
    expect(fetchMock).toHaveBeenCalledWith(
      URLS.pipelineIterationComparison('demo', 12, 11),
      { signal: expect.any(AbortSignal) },
    );
    expect(harness.dispatched).toContainEqual(expect.objectContaining({
      type: FETCH_SUCCESS,
      payload: { data: expect.objectContaining({
        mode: 'live',
        projectKey: 'demo',
        pipelineId: 7,
        metrics: [expect.objectContaining({ key: '0:score', delta: '10' })],
      }) },
    }));
    await harness.stop();
  });

  test('surfaces a missing LP4 comparison as an inline fetch error', async () => {
    fetchMock.mockRejectedValue({ message: 'Not found' });
    let notifyComplete: () => void = () => undefined;
    const complete = new Promise<void>((resolve) => { notifyComplete = resolve; });
    const harness = startPipelineSagas(createSagaState({ transport: 'live' }), (action) => {
      const result = action as { type?: string; meta?: { namespace?: string } };
      if (result.type === FETCH_ERROR && result.meta?.namespace === PIPELINE_COMPARISON_NAMESPACE) {
        notifyComplete();
      }
    });
    await Promise.resolve();
    harness.dispatch(getPipelineComparisonAction(7, 12, 11));
    await complete;
    expect(harness.dispatched).toContainEqual(expect.objectContaining({
      type: FETCH_ERROR,
      meta: expect.objectContaining({ namespace: PIPELINE_COMPARISON_NAMESPACE }),
    }));
    await harness.stop();
  });

  test('enables mock-rich metrics, requirements, criterion averages, and Auto-Ready only with marker', () => {
    const result = normalizePipelineComparison(richResponse(), 1, 102, 101);

    expect(result).toMatchObject({
      mode: 'mock-rich',
      hasDifferentRequirements: true,
      candidate: {
        requirement: { specId: 'REQ-2', title: 'Candidate', jiraKey: 'JIRA-2' },
        testCasesCount: 4,
        readyCount: 3,
        autoReadyPromotedCount: 2,
        criterionAverages,
      },
      baseline: {
        requirement: { specId: 'REQ-1' },
        autoReadyPromotedCount: 1,
      },
    });
    expect(
      result.stages.find(({ key }) => key === String(StageKey.GRADE))?.candidate,
    ).toMatchObject({
      metric: 91,
      cost: 0.4,
      durationMs: 300,
    });
  });

  test('uses stage delta entries by key ahead of embedded stage snapshots', () => {
    const result = normalizePipelineComparison(
      richResponse({
        stageDeltas: [
          {
            stageKey: StageKey.GRADE,
            current: { status: 'FAILED', mockMetrics: { metric: 70 } },
            previous: { status: 'PASSED', mockMetrics: { metric: 88 } },
          },
        ],
      }),
      1,
      102,
      101,
    );

    expect(result.stages.find(({ key }) => key === String(StageKey.GRADE))).toMatchObject({
      candidate: { status: StageStatus.FAILED, metric: 70 },
      baseline: { status: StageStatus.PASSED, metric: 88 },
    });
  });

  test('preserves unknown stages, canonicalizes aliases, and rejects duplicate normalized keys', () => {
    const withUnknown = response();
    withUnknown.current?.stages?.push({ stageKey: 'OPAQUE_STAGE', metrics: { metric: 100 } });

    expect(
      normalizePipelineComparison(withUnknown, 1, 102, 101).stages.map(({ key }) => key),
    ).toEqual([StageKey.GRADE, 'OPAQUE_STAGE', StageKey.CREATE]);

    const withDuplicate = response();
    withDuplicate.current?.stages?.push({ stageKey: 'grade' });
    expect(() => normalizePipelineComparison(withDuplicate, 1, 102, 101)).toThrow(
      'Pipeline comparison contains duplicate stage keys',
    );
  });

  test.each(['toString', '__proto__', 'NOT_A_STATUS', undefined])(
    'maps unsupported runtime status %p to UNKNOWN',
    (status) => {
      const raw = response();
      raw.current = { ...raw.current, status };
      raw.current.stages = [{ stageKey: StageKey.GRADE, status }];

      const result = normalizePipelineComparison(raw, 1, 102, 101);

      expect(result.candidate.status).toBe('UNKNOWN');
      expect(
        result.stages.find(({ key }) => key === String(StageKey.GRADE))?.candidate?.status,
      ).toBe('UNKNOWN');
    },
  );

  test('rejects same, missing, and cross-pipeline iteration identities', () => {
    expect(() => normalizePipelineComparison(response(), 1, 101, 101)).toThrow(
      'Pipeline comparison requires two different iterations',
    );
    expect(() =>
      normalizePipelineComparison(response({ current: undefined }), 1, 102, 101),
    ).toThrow('Pipeline comparison identity mismatch');
    expect(() =>
      normalizePipelineComparison(
        response({ current: { ...response().current, pipelineId: 2 } }),
        1,
        102,
        101,
      ),
    ).toThrow('Pipeline comparison identity mismatch');
  });

  test('accepts only finite numeric metrics and leaves opaque or absent values undefined', () => {
    const raw = richResponse();
    raw.current = {
      ...raw.current,
      mockMetrics: {
        testCasesCount: 0,
        suiteScore: 101,
        readyCount: 1,
        fixRoundsCount: Number.NaN,
        autoReadyPromotedCount: -1,
        criterionAverages: { ...criterionAverages, [CriterionKey.ATOMICITY]: 16 },
        costTotal: -1,
        durationMs: Number.POSITIVE_INFINITY,
      },
      stages: [
        {
          stageKey: StageKey.GRADE,
          mockMetrics: { metric: 101, cost: -1, durationMs: Number.NaN },
        },
      ],
    };

    const result = normalizePipelineComparison(raw, 1, 102, 101);

    expect(result.candidate).toMatchObject({ id: 102, testCasesCount: 0 });
    expect(result.candidate.suiteScore).toBeUndefined();
    expect(result.candidate.readyCount).toBeUndefined();
    expect(result.candidate.fixRoundsCount).toBeUndefined();
    expect(result.candidate.costTotal).toBeUndefined();
    expect(result.candidate.durationMs).toBeUndefined();
    expect(result.candidate.autoReadyPromotedCount).toBeUndefined();
    expect(result.candidate.criterionAverages).toBeUndefined();
    expect(result.stages.find(({ key }) => key === String(StageKey.GRADE))?.candidate).toEqual({
      status: 'UNKNOWN',
      metric: undefined,
      cost: undefined,
      durationMs: undefined,
    });
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid iteration number %p',
    (iterationNumber) => {
      const raw = response();
      raw.current = { ...raw.current, iterationNumber };

      expect(() => normalizePipelineComparison(raw, 1, 102, 101)).toThrow(
        'Pipeline comparison identity mismatch',
      );
    },
  );

  test('orders stages by a valid shared sequence before source order', () => {
    const raw = richResponse();
    raw.current = {
      ...raw.current,
      stages: [
        { stageKey: StageKey.GRADE, sequence: 2, status: 'PASSED' },
        { stageKey: 'custom-stage', sequence: 0, status: 'PENDING' },
        { stageKey: StageKey.CREATE, sequence: 1, status: 'PASSED' },
      ],
    };
    raw.previous = {
      ...raw.previous,
      stages: [
        { stageKey: StageKey.CREATE, sequence: 1, status: 'PASSED' },
        { stageKey: StageKey.GRADE, sequence: 2, status: 'FAILED' },
        { stageKey: 'custom-stage', sequence: 0, status: 'PENDING' },
      ],
    };

    const result = normalizePipelineComparison(raw, 1, 102, 101);

    expect(result.stages.map(({ key, sequence }) => [key, sequence])).toEqual([
      ['custom-stage', 0],
      [StageKey.CREATE, 1],
      [StageKey.GRADE, 2],
    ]);
  });

  test('falls back to canonical rich ordering when sequences conflict', () => {
    const raw = richResponse();
    raw.current = {
      ...raw.current,
      stages: [
        { stageKey: StageKey.GRADE, sequence: 1 },
        { stageKey: StageKey.CREATE, sequence: 3 },
      ],
    };
    raw.previous = {
      ...raw.previous,
      stages: [
        { stageKey: StageKey.CREATE, sequence: 0 },
        { stageKey: StageKey.GRADE, sequence: 2 },
      ],
    };

    const result = normalizePipelineComparison(raw, 1, 102, 101);

    expect(result.stages.map(({ key }) => key)).toEqual([StageKey.CREATE, StageKey.GRADE]);
    expect(result.stages.every(({ sequence }) => sequence === undefined)).toBe(true);
  });

  test.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'ignores invalid stage sequence %p and preserves status-only source order',
    (sequence) => {
      const raw = response();
      raw.current = {
        ...raw.current,
        stages: [{ stageKey: StageKey.GRADE, sequence }, { stageKey: StageKey.CREATE }],
      };
      raw.previous = { ...raw.previous, stages: [] };

      const result = normalizePipelineComparison(raw, 1, 102, 101);

      expect(result.stages.map(({ key }) => key)).toEqual([StageKey.GRADE, StageKey.CREATE]);
      expect(
        result.stages.find(({ key }) => key === String(StageKey.GRADE))?.sequence,
      ).toBeUndefined();
    },
  );
});
