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

import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import {
  loadStageTrace,
  loadStageTraceAttempts,
  loadTraceIteration,
  StageTraceError,
  type StageTrace,
} from 'controllers/aiFactory/stageTrace';
import { useStageTrace, type UseStageTraceOptions } from './useStageTrace';

jest.mock('controllers/aiFactory/stageTrace', () => ({
  ...jest.requireActual<typeof import('controllers/aiFactory/stageTrace')>(
    'controllers/aiFactory/stageTrace',
  ),
  loadStageTrace: jest.fn(),
  loadStageTraceAttempts: jest.fn(),
  loadTraceIteration: jest.fn(),
}));
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const attemptsMock = jest.mocked(loadStageTraceAttempts);
const traceMock = jest.mocked(loadStageTrace);
const iterationMock = jest.mocked(loadTraceIteration);
const attempts = [
  { attempt: 1, traceStatus: 'REPORTED' as const, eventCount: 1, current: false },
  { attempt: 2, traceStatus: 'NOT_REPORTED' as const, eventCount: 0, current: true },
];
const trace = (attempt: number, text = 'full trace'): StageTrace => ({
  iterationId: 31,
  stageKey: 'fix',
  attempt,
  status: 'REPORTED',
  events: [{ seq: 0, type: 'FINAL', text }],
});
const initialOptions: UseStageTraceOptions = {
  resource: { projectKey: 'project-a', iterationId: 31, stageKey: 'fix' },
  pipelineId: 7,
  enabled: true,
  refresh: 0,
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((accept, decline) => {
    resolve = accept;
    reject = decline;
  });
  return { promise, resolve, reject };
};
let result: ReturnType<typeof useStageTrace>;
const Harness = (props: UseStageTraceOptions) => {
  const state = useStageTrace(props);
  useEffect(() => {
    result = state;
  }, [state]);
  return null;
};

// React 18 concurrent roots need this opt-in when using act without Enzyme's adapter.
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

describe('useStageTrace resource lifecycle', () => {
  let wrapper:
    | { setProps: (patch: Partial<UseStageTraceOptions>) => void; unmount: () => void }
    | undefined;
  beforeEach(() => {
    jest.resetAllMocks();
    attemptsMock.mockResolvedValue(attempts);
    traceMock.mockImplementation(({ attempt }) => Promise.resolve(trace(attempt ?? 2)));
    iterationMock.mockResolvedValue({ id: 31 } as Awaited<ReturnType<typeof loadTraceIteration>>);
  });
  afterEach(() => {
    act(() => wrapper?.unmount());
    wrapper = undefined;
  });
  const render = async (overrides: Partial<UseStageTraceOptions> = {}) => {
    const root = createRoot(document.createElement('div'));
    let props = { ...initialOptions, ...overrides };
    wrapper = {
      setProps: (patch) => {
        props = { ...props, ...patch };
        root.render(<Harness {...props} />);
      },
      unmount: () => root.unmount(),
    };
    await act(async () => {
      root.render(<Harness {...props} />);
      await Promise.resolve();
    });
  };

  test('does not read anything with the feature disabled', async () => {
    await render({ enabled: false });
    expect(attemptsMock).not.toHaveBeenCalled();
    expect(traceMock).not.toHaveBeenCalled();
    expect(iterationMock).not.toHaveBeenCalled();
    expect(result.loading).toBe(false);
  });

  test('chooses the current attempt by default and keeps snapshot failure independent from trace', async () => {
    iterationMock.mockRejectedValue(new Error('metadata failed'));
    await render();
    expect(traceMock).toHaveBeenCalledWith(
      { ...initialOptions.resource, attempt: 2 },
      expect.any(AbortSignal),
    );
    expect(result).toMatchObject({ trace: trace(2), metadataFailed: true, loading: false });
    expect(result.failure).toBeUndefined();
  });

  test('aborts and ignores a delayed attempt one result after switching to attempt two', async () => {
    const oldTrace = deferred<StageTrace>();
    traceMock.mockReturnValueOnce(oldTrace.promise).mockResolvedValueOnce(trace(2, 'latest'));
    await render({ attempt: 1 });
    const signal = traceMock.mock.calls[0][1];
    await act(async () => {
      wrapper?.setProps({ attempt: 2 });
      await Promise.resolve();
    });
    expect(signal?.aborted).toBe(true);
    expect(result.trace?.events[0].text).toBe('latest');
    await act(async () => {
      oldTrace.resolve(trace(1, 'stale'));
      await oldTrace.promise;
    });
    expect(result.trace?.events[0].text).toBe('latest');
    expect(result.trace?.attempt).toBe(2);
  });

  test('does not start a dependent trace request when the obsolete attempt list resolves after project change', async () => {
    const oldAttempts = deferred<typeof attempts>();
    attemptsMock.mockReturnValueOnce(oldAttempts.promise).mockResolvedValueOnce(attempts);
    await render();
    const signal = attemptsMock.mock.calls[0][1];
    const nextResource = { ...initialOptions.resource, projectKey: 'project-b' };
    await act(async () => {
      wrapper?.setProps({ resource: nextResource });
      await Promise.resolve();
    });
    expect(signal?.aborted).toBe(true);
    expect(traceMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      oldAttempts.resolve(attempts);
      await oldAttempts.promise;
    });
    expect(traceMock).toHaveBeenCalledTimes(1);
    expect(traceMock.mock.calls[0][0].projectKey).toBe('project-b');
    expect(result.scope).toContain('project-b');
  });

  test('hides the previous project trace immediately while the next project is loading', async () => {
    await render();
    const nextAttempts = deferred<typeof attempts>();
    const nextIteration = deferred<Awaited<ReturnType<typeof loadTraceIteration>>>();
    attemptsMock.mockReturnValueOnce(nextAttempts.promise);
    iterationMock.mockReturnValueOnce(nextIteration.promise);
    await act(async () => {
      wrapper?.setProps({ resource: { ...initialOptions.resource, projectKey: 'project-b' } });
      await Promise.resolve();
    });
    expect(result.loading).toBe(true);
    expect(result.trace).toBeUndefined();
    expect(result.iteration).toBeUndefined();
    expect(result.scope).toContain('project-b');
  });

  test('manual refresh rechecks a not-reported trace and can reveal subsequently reported events', async () => {
    traceMock.mockResolvedValueOnce({
      ...trace(2),
      status: 'NOT_REPORTED',
      reason: 'No output',
      events: [],
    });
    await render();
    expect(result.trace?.status).toBe('NOT_REPORTED');
    await act(async () => {
      wrapper?.setProps({ refresh: 1 });
      await Promise.resolve();
    });
    expect(attemptsMock).toHaveBeenCalledTimes(2);
    expect(traceMock).toHaveBeenCalledTimes(2);
    expect(result.trace?.status).toBe('REPORTED');
  });

  test.each(['FORBIDDEN', 'NOT_FOUND', 'INVALID_RESPONSE', 'REQUEST_FAILED'] as const)(
    'exposes %s without interpreting it as not reported',
    async (failure) => {
      attemptsMock.mockRejectedValue(new StageTraceError(failure));
      await render();
      expect(result).toMatchObject({ failure, loading: false });
      expect(result.trace).toBeUndefined();
      expect(traceMock).not.toHaveBeenCalled();
    },
  );

  test('aborts all resource requests on unmount', async () => {
    await render();
    const signal = attemptsMock.mock.calls[0][1];
    act(() => wrapper?.unmount());
    wrapper = undefined;
    expect(signal?.aborted).toBe(true);
    expect(iterationMock.mock.calls[0][3]).toBe(signal);
    expect(traceMock.mock.calls[0][1]).toBe(signal);
  });
});
