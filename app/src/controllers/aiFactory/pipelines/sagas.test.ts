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
  getPipelineIterationDetailsAction,
  getPipelineIterationsAction,
} from './actionCreators';
import {
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
} from './constants';
import { aiFactoryPipelinesSagas, normalizePipelineComparison } from './sagas';
import { getPipelineCatalogTransport } from './transport';

jest.mock('common/utils', () => {
  const actual = jest.requireActual<typeof import('common/utils')>('common/utils');

  return { ...actual, fetch: jest.fn() };
});
jest.mock('./transport', () => {
  const actual = jest.requireActual<typeof import('./transport')>('./transport');

  return { ...actual, getPipelineCatalogTransport: jest.fn(actual.getPipelineCatalogTransport) };
});

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;

interface SagaStateOptions {
  transport?: 'mock' | 'live';
  catalogVersion?: number;
  catalogProjectKey?: string | null;
}

const createSagaState = ({
  transport = 'mock',
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

describe('pipeline transport saga boundaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('uses Redux catalog provenance for detail requests instead of mutable storage', async () => {
    localStorage.setItem('ai_factory_transport', JSON.stringify({ pipelineCatalog: 'live' }));
    fetchMock.mockResolvedValue({ id: 103, pipelineId: 7, number: 3 });
    let notifyComplete: () => void = () => undefined;
    const complete = new Promise<void>((resolve) => {
      notifyComplete = resolve;
    });
    const harness = startPipelineSagas(
      createSagaState({ transport: 'mock', catalogVersion: 1, catalogProjectKey: 'demo' }),
      (action) => {
      const candidate = action as { type?: string; meta?: { namespace?: string } };
      if (
        candidate.type === FETCH_SUCCESS &&
        candidate.meta?.namespace === PIPELINE_ITERATION_DETAILS_NAMESPACE
      ) {
        notifyComplete();
      }
      },
    );

    await Promise.resolve();
    harness.dispatch(getPipelineIterationDetailsAction(7, 103));
    await complete;

    expect(fetchMock).toHaveBeenCalledWith(URLS.tmsPipelineIterationById('demo', 7, 103), {
      signal: expect.any(AbortSignal),
    });
    expect(getPipelineCatalogTransport).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await harness.stop();
  });

  test.each([
    ['unresolved catalog', createSagaState()],
    [
      'catalog from another project',
      createSagaState({ transport: 'mock', catalogVersion: 1, catalogProjectKey: 'other' }),
    ],
    [
      'non-mock catalog',
      createSagaState({ transport: 'live', catalogVersion: 1, catalogProjectKey: 'demo' }),
    ],
  ])('blocks direct P3 for %s', async (_description, state) => {
    const harness = startPipelineSagas(state);

    await Promise.resolve();
    harness.dispatch(getPipelineIterationDetailsAction(7, 103));
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(harness.dispatched).not.toContainEqual(
      expect.objectContaining({
        meta: expect.objectContaining({ namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE }),
      }),
    );
    await harness.stop();
  });

  test('runs sibling LP2 requests independently without aborting the first request', async () => {
    const resolvers: Array<(value: { content: unknown[] }) => void> = [];
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
          resolvers.push(resolve as (value: { content: unknown[] }) => void);
          if (resolvers.length === 2) notifyStarted();
        }),
    );
    const harness = startPipelineSagas(
      createSagaState({ transport: 'mock', catalogVersion: 7, catalogProjectKey: 'demo' }),
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
      URLS.tmsPipelineIterations('demo', 1),
      URLS.tmsPipelineIterations('demo', 2),
    ]);

    resolvers.forEach((resolve) => resolve({ content: [] }));
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
    expect(starts.every(({ meta }) => meta.transport === 'mock')).toBe(true);
    await harness.stop();
  });

  test.each([
    ['stale', false],
    ['current', true],
  ])('%s LP2 failure emits the expected global notification', async (_description, isCurrent) => {
    fetchMock.mockRejectedValue(new Error('request failed'));
    const state = createSagaState({
      transport: 'mock',
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
