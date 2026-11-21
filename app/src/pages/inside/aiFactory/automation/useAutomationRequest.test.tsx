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

  test('reports the environment configuration requirement on HTTP 400', async () => {
    fetchMock.mockResolvedValueOnce(reply(400, { message: 'No environments' }));

    await renderHook();

    expect(result.environments).toBeNull();
    expect(result.error).toBe('ENVIRONMENTS_NOT_CONFIGURED');
  });

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
      .mockResolvedValueOnce({
        id: 42,
        automationState: {
          status: 'IN_PROGRESS',
          ciConnection: 'CONNECTED',
          fixInProgress: false,
          scenarioChangedAfterAutomation: false,
          iteration: accepted.iteration,
        },
      });
    await renderHook();

    await act(async () => expect(await result.start(payload)).toEqual(accepted));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      URLS.testCaseDetails('demo', 42),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test('keeps a lost POST outcome unconfirmed when its case cannot verify the iteration', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, environments))
      .mockRejectedValueOnce(new AxiosError('Network error', 'ERR_NETWORK'))
      .mockResolvedValueOnce({ id: 42 });
    await renderHook();

    await act(async () => expect(await result.start(payload)).toBeNull());

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.error).toBe('START_NOT_CONFIRMED');
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
