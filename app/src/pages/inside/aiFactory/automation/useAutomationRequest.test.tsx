/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, useEffect } from 'react';
import { AxiosError } from 'axios';
import { mount, type ReactWrapper } from 'enzyme';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import type { AutomatePayload } from 'types/aiFactory';

import { useAutomationRequest } from './useAutomationRequest';

jest.mock('common/utils', () => ({
  ERROR_CANCELED: 'REQUEST_CANCELED',
  fetch: jest.fn(),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));

type HookResult = ReturnType<typeof useAutomationRequest>;

interface HarnessProps {
  projectKey?: string;
  isEnabled?: boolean;
  pipelineId?: number;
  onResult: (result: HookResult) => void;
}

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>, isRawResponse?: boolean) => Promise<unknown>
>;
let result: HookResult;

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const Harness = ({ projectKey = 'demo', isEnabled = true, pipelineId = 2, onResult }: HarnessProps) => {
  const request = useAutomationRequest(projectKey, isEnabled, pipelineId);

  useEffect(() => onResult(request), [onResult, request]);

  return null;
};

const captureResult = (nextResult: HookResult) => {
  result = nextResult;
};

const reply = (status: number, data: unknown) => ({ status, data });
const environments = { environments: ['beta5', 'qa'], default: 'beta5' };
const accepted = {
  iteration: { pipelineId: 2, iterationId: 201, number: 1 },
  accepted: [42],
  skipped: [],
};
const activeCase = (id: number, iteration = accepted.iteration) => ({
  id,
  automationState: {
    status: 'IN_PROGRESS',
    ciConnection: 'CONNECTED',
    fixInProgress: false,
    scenarioChangedAfterAutomation: false,
    iteration,
  },
});
const payload: AutomatePayload = {
  testCaseIds: [42],
  environment: 'beta5',
};

describe('useAutomationRequest', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    jest.mocked(useUserPermissions).mockReturnValue({
      canAutomateTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    jest.useRealTimers();
  });

  const renderHook = async (props: Omit<HarnessProps, 'onResult'> = {}) => {
    wrapper = mount(<Harness {...props} onResult={captureResult} />);
    await act(async () => {
      await Promise.resolve();
    });
  };

  test.each([
    { projectKey: '', isEnabled: true },
    { projectKey: 'demo', isEnabled: false },
  ])('does not make requests when disabled or missing a project %#', async (props) => {
    await renderHook(props);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      environments: null,
      isLoadingEnvironments: false,
      isStarting: false,
      error: null,
      reautomationRequiredIds: [],
    });

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('does not load environments or start automation for a viewer', async () => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canAutomateTestCases: false,
    } as ReturnType<typeof useUserPermissions>);

    await renderHook();

    expect(result).toMatchObject({
      environments: null,
      isLoadingEnvironments: false,
      isStarting: false,
      error: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('loads and normalizes A1 environments', async () => {
    fetchMock.mockResolvedValue(reply(200, environments));

    await renderHook();

    expect(fetchMock).toHaveBeenCalledWith(
      URLS.tmsAutomationEnvironments('demo'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
      true,
    );
    expect(result).toMatchObject({
      environments,
      isLoadingEnvironments: false,
      error: null,
    });
  });

  test('keeps malformed A1 and transport failures inline and supports reload', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, { environments: [], default: '' }))
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockResolvedValueOnce(reply(200, environments));

    await renderHook();
    expect(result.error).toBe('INVALID_ENVIRONMENTS_RESPONSE');

    await act(async () => {
      result.reloadEnvironments();
      await Promise.resolve();
    });
    expect(result.error).toBe('ENVIRONMENTS_LOAD_FAILED');

    await act(async () => {
      result.reloadEnvironments();
      await Promise.resolve();
    });
    expect(result).toMatchObject({ environments, error: null });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('posts the exact A2 payload and returns a normalized response', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, environments)).mockResolvedValueOnce(reply(202, accepted));
    await renderHook();

    let response;
    await act(async () => {
      response = await result.start(payload);
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      URLS.tmsAutomation('demo'),
      expect.objectContaining({ method: 'POST', data: payload, signal: expect.any(AbortSignal) }),
      true,
    );
    expect(response).toEqual(accepted);
    expect(result).toMatchObject({ isStarting: false, error: null });
  });

  test('maps the A2 confirmation conflict separately from generic failures', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockResolvedValueOnce(reply(409, {
        reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED',
        testCaseIds: [42],
      }))
      .mockRejectedValueOnce(new Error('502 Bad Gateway'));
    await renderHook();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(result.error).toBe('REAUTOMATE_CONFIRMATION_REQUIRED');
    expect(result.reautomationRequiredIds).toEqual([42]);

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(result.error).toBe('JOB_START_FAILED');
    expect(result.reautomationRequiredIds).toEqual([]);
  });

  test('rejects malformed A2 without treating it as an accepted launch', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockResolvedValueOnce(reply(202, { ...accepted, accepted: [] }));
    await renderHook();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(result.error).toBe('INVALID_AUTOMATION_RESPONSE');

  });

  test.each([
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED' },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [] },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [99] },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [42, 42] },
  ])('rejects a malformed 409 confirmation contract %#', async (error) => {
    fetchMock.mockResolvedValueOnce(reply(200, environments)).mockResolvedValueOnce(reply(409, error));
    await renderHook();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });

    expect(result.error).toBe('JOB_START_FAILED');
    expect(result.reautomationRequiredIds).toEqual([]);
  });

  test('blocks A2 when the selected environment is not in the active A1 response', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, environments));
    await renderHook();

    await act(async () => {
      expect(await result.start({ ...payload, environment: 'prod' })).toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).toBe('INVALID_ENVIRONMENTS_RESPONSE');
  });

  test('clears A1 state and confirmation IDs when the project changes or reloads', async () => {
    const replacementA1 = createDeferred<ReturnType<typeof reply>>();
    const reloadA1 = createDeferred<ReturnType<typeof reply>>();
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockResolvedValueOnce(reply(409, {
        reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED',
        testCaseIds: [42],
      }))
      .mockReturnValueOnce(replacementA1.promise)
      .mockReturnValueOnce(reloadA1.promise);
    await renderHook();
    await act(async () => {
      await result.start(payload);
    });
    expect(result.reautomationRequiredIds).toEqual([42]);

    act(() => wrapper?.setProps({ projectKey: 'other' }));
    expect(result).toMatchObject({
      environments: null,
      isLoadingEnvironments: true,
      error: null,
      reautomationRequiredIds: [],
    });
    await act(async () => {
      replacementA1.resolve(reply(200, environments));
      await replacementA1.promise;
    });

    act(() => result.reloadEnvironments());
    expect(result).toMatchObject({
      environments: null,
      isLoadingEnvironments: true,
      reautomationRequiredIds: [],
    });
    await act(async () => {
      reloadA1.resolve(reply(200, environments));
      await reloadA1.promise;
    });
  });

  test('ignores stale overlapping A1 results and their finally handlers', async () => {
    const first = createDeferred<ReturnType<typeof reply>>();
    const second = createDeferred<ReturnType<typeof reply>>();
    let firstSignal: AbortSignal | undefined;
    const secondEnvironments = { environments: ['dev5'], default: 'dev5' };
    fetchMock
      .mockImplementationOnce((_url, params) => {
        firstSignal = params?.signal as AbortSignal | undefined;
        return first.promise;
      })
      .mockReturnValueOnce(second.promise);
    wrapper = mount(<Harness projectKey="demo" onResult={captureResult} />);

    act(() => wrapper?.setProps({ projectKey: 'other' }));
    expect(firstSignal?.aborted).toBe(true);
    await act(async () => {
      second.resolve(reply(200, secondEnvironments));
      await second.promise;
    });
    expect(result).toMatchObject({
      environments: secondEnvironments,
      isLoadingEnvironments: false,
    });

    await act(async () => {
      first.resolve(reply(200, environments));
      await first.promise;
    });
    expect(result).toMatchObject({
      environments: secondEnvironments,
      isLoadingEnvironments: false,
    });
  });

  test('sends only one POST when submission is invoked twice during the same request', async () => {
    const response = createDeferred<ReturnType<typeof reply>>();
    fetchMock.mockResolvedValueOnce(reply(200, environments)).mockReturnValueOnce(response.promise);
    await renderHook();

    await act(async () => {
      const first = result.start(payload);
      await expect(result.start(payload)).resolves.toBeNull();
      response.resolve(reply(202, accepted));
      await expect(first).resolves.toEqual(accepted);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test.each([
    [40060, 'ENVIRONMENTS_NOT_CONFIGURED', undefined],
    [40016, 'ENVIRONMENTS_LOAD_FAILED', 'Could not resolve CI integration'],
  ])('handles environment lookup HTTP 400 with code %s', async (errorCode, error, errorMessage) => {
    fetchMock.mockResolvedValueOnce(
      reply(400, { errorCode, message: 'Could not resolve CI integration' }),
    );

    await renderHook();

    expect(result).toMatchObject({ environments: null, error, errorMessage });
  });

  test.each([
    [40060, 'ENVIRONMENTS_NOT_CONFIGURED', undefined, null],
    [40016, 'JOB_START_FAILED', 'Unknown environment beta5', environments],
  ])(
    'handles automation start HTTP 400 with code %s',
    async (errorCode, error, errorMessage, currentEnvironments) => {
      fetchMock
        .mockResolvedValueOnce(reply(200, environments))
        .mockResolvedValueOnce(reply(400, { errorCode, message: 'Unknown environment beta5' }));
      await renderHook();

      await act(async () => expect(await result.start(payload)).toBeNull());

      expect(result).toMatchObject({ environments: currentEnvironments, error, errorMessage });
    },
  );

  test.each([
    [{ errorCode: 40916 }, 'CI_NOT_CONNECTED', []],
    [
      { reason: 'NO_ELIGIBLE_TEST_CASES', skipped: [{ id: 42, displayId: 'TC42', reason: 'FIX_RUNNING' }] },
      'NO_ELIGIBLE_TEST_CASES',
      [{ id: 42, displayId: 'TC42', reason: 'FIX_RUNNING' }],
    ],
  ])('maps the distinct conflict body %j', async (body, error, skipped) => {
    fetchMock.mockResolvedValueOnce(reply(200, environments)).mockResolvedValueOnce(reply(409, body));
    await renderHook();

    await act(async () => expect(await result.start(payload)).toBeNull());
    expect(result).toMatchObject({ error, skipped });
  });

  test('recovers a lost POST response by reading the case and never resends the job', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce(activeCase(42));
    await renderHook();

    await act(async () =>
      expect(await result.start(payload)).toEqual({ ...accepted, recovery: { unconfirmed: [] } }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      URLS.testCaseDetails('demo', 42),
      expect.objectContaining({ signal: expect.any(AbortSignal), timeout: 10_000 }),
    );
  });

  test('retries only GET after a gateway timeout until the active iteration is visible', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockResolvedValueOnce(reply(504, {}))
      .mockResolvedValueOnce({ id: 42 })
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce(activeCase(42));
    await renderHook();

    await act(async () => {
      const outcome = result.start(payload);
      await jest.advanceTimersByTimeAsync(4_000);
      await expect(outcome).resolves.toEqual({ ...accepted, recovery: { unconfirmed: [] } });
    });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      URLS.tmsAutomationEnvironments('demo'),
      URLS.tmsAutomation('demo'),
      ...Array(3).fill(URLS.testCaseDetails('demo', 42)),
    ]);
  });

  test('keeps a lost POST outcome unconfirmed when its case cannot verify the iteration', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValue({ id: 42 });
    await renderHook();

    await act(async () => {
      const outcome = result.start(payload);
      await jest.advanceTimersByTimeAsync(9_000);
      await expect(outcome).resolves.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(fetchMock.mock.calls.filter(([url]) => url === URLS.tmsAutomation('demo'))).toHaveLength(1);
    expect(result.error).toBe('START_NOT_CONFIRMED');
  });

  test('ends recovery after 30 seconds even if a case GET is still pending', async () => {
    jest.useFakeTimers();
    const pendingRead = createDeferred<ReturnType<typeof activeCase>>();
    let recoverySignal: AbortSignal | undefined;
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockImplementationOnce((_url, params) => {
        recoverySignal = params?.signal as AbortSignal;
        return pendingRead.promise;
      });
    await renderHook();

    let outcome!: Promise<unknown>;
    await act(async () => {
      outcome = result.start(payload);
      await jest.advanceTimersByTimeAsync(29_999);
    });
    expect(result.isStarting).toBe(true);
    expect(recoverySignal?.aborted).toBe(false);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
      await expect(outcome).resolves.toBeNull();
    });
    expect(recoverySignal?.aborted).toBe(true);
    expect(result).toMatchObject({ isStarting: false, error: 'START_NOT_CONFIRMED' });

    await act(async () => {
      pendingRead.resolve(activeCase(42));
      await jest.advanceTimersByTimeAsync(10_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.error).toBe('START_NOT_CONFIRMED');
  });

  test('does not treat concurrent iterations for different selected cases as one job', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce(activeCase(42))
      .mockResolvedValueOnce(activeCase(43, { ...accepted.iteration, iterationId: 202, number: 2 }));
    await renderHook();

    await act(async () => {
      await expect(result.start({ ...payload, testCaseIds: [42, 43] })).resolves.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.error).toBe('START_NOT_CONFIRMED');
  });

  test('does not attribute a later snapshot to a different iteration during recovery', async () => {
    jest.useFakeTimers();
    const otherIteration = { ...accepted.iteration, iterationId: 202, number: 2 };
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce(activeCase(42))
      .mockResolvedValueOnce({ id: 43 })
      .mockResolvedValueOnce(activeCase(42, otherIteration))
      .mockResolvedValueOnce(activeCase(43, otherIteration));
    await renderHook();

    await act(async () => {
      const outcome = result.start({ ...payload, testCaseIds: [42, 43] });
      await jest.advanceTimersByTimeAsync(1_000);
      await expect(outcome).resolves.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(result.error).toBe('START_NOT_CONFIRMED');
  });

  test('returns only the cases observed in the last consistent snapshot', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce({ id: 42 })
      .mockResolvedValueOnce(activeCase(43))
      .mockImplementation((url) =>
        Promise.resolve(url === URLS.testCaseDetails('demo', 42) ? activeCase(42) : { id: 43 }),
      );
    await renderHook();

    await act(async () => {
      const outcome = result.start({ ...payload, testCaseIds: [42, 43] });
      await jest.advanceTimersByTimeAsync(9_000);
      await expect(outcome).resolves.toEqual({ ...accepted, recovery: { unconfirmed: [43] } });
    });

    expect(fetchMock).toHaveBeenCalledTimes(10);
  });

  test('cancels recovery and its retries when the project changes', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce({ id: 42 })
      .mockResolvedValueOnce(reply(200, environments));
    await renderHook();

    let outcome!: Promise<unknown>;
    await act(async () => {
      outcome = result.start(payload);
      await jest.advanceTimersByTimeAsync(0);
    });
    const recoverySignal = fetchMock.mock.calls[2][1]?.signal as AbortSignal;

    await act(async () => {
      wrapper?.setProps({ projectKey: 'other' });
      await Promise.resolve();
    });
    await expect(outcome).resolves.toBeNull();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });

    expect(recoverySignal.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3][0]).toBe(URLS.tmsAutomationEnvironments('other'));
    expect(result).toMatchObject({ isStarting: false, error: null });
  });

  test.each(['unmount', 'project replacement'] as const)(
    'aborts and ignores an A2 response after %s',
    async (transition) => {
      const startRequest = createDeferred<ReturnType<typeof reply>>();
      let startSignal: AbortSignal | undefined;
      fetchMock
        .mockResolvedValueOnce(reply(200, environments))
        .mockImplementationOnce((_url, params) => {
          startSignal = params?.signal as AbortSignal | undefined;
          return startRequest.promise;
        })
        .mockResolvedValueOnce(reply(200, environments));
      await renderHook();

      let startResult!: Promise<unknown>;
      act(() => {
        startResult = result.start(payload);
      });
      await act(async () => {
        if (transition === 'unmount') wrapper?.unmount();
        else wrapper?.setProps({ projectKey: 'other' });
        await Promise.resolve();
      });
      if (transition === 'project replacement') {
        expect(fetchMock).toHaveBeenCalledWith(
          URLS.tmsAutomationEnvironments('other'),
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
      true,
        );
      }
      expect(startSignal?.aborted).toBe(true);

      await act(async () => {
        startRequest.resolve(reply(202, accepted));
        await startRequest.promise;
      });
      await expect(startResult).resolves.toBeNull();
    },
  );
});
