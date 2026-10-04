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
import { mount, type ReactWrapper } from 'enzyme';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import type { AutomatePayload } from 'types/aiFactory';

import { useAutomationRequest } from './useAutomationRequest';

jest.mock('common/utils', () => ({
  ERROR_CANCELED: 'REQUEST_CANCELED',
  fetch: jest.fn(),
}));

type HookResult = ReturnType<typeof useAutomationRequest>;

interface HarnessProps {
  projectKey?: string;
  isEnabled?: boolean;
  onResult: (result: HookResult) => void;
}

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
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

const Harness = ({ projectKey = 'demo', isEnabled = true, onResult }: HarnessProps) => {
  const request = useAutomationRequest(projectKey, isEnabled);

  useEffect(() => onResult(request), [onResult, request]);

  return null;
};

const captureResult = (nextResult: HookResult) => {
  result = nextResult;
};

const environments = { environments: ['beta5', 'qa'], default: 'beta5' };
const accepted = {
  iteration: { pipelineId: 2, iterationId: 201, number: 1 },
  accepted: [42],
  skipped: [],
};
const payload: AutomatePayload = {
  testCaseIds: [42],
  environment: 'beta5',
  confirmReautomate: false,
};

describe('useAutomationRequest', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
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

  test('loads and normalizes A1 environments', async () => {
    fetchMock.mockResolvedValue(environments);

    await renderHook();

    expect(fetchMock).toHaveBeenCalledWith(
      URLS.tmsAutomationEnvironments('demo'),
      expect.objectContaining({ abort: expect.any(Function) }),
    );
    expect(result).toMatchObject({
      environments,
      isLoadingEnvironments: false,
      error: null,
    });
  });

  test('keeps malformed A1 and transport failures inline and supports reload', async () => {
    fetchMock
      .mockResolvedValueOnce({ environments: [], default: '' })
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockResolvedValueOnce(environments);

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
    fetchMock.mockResolvedValueOnce(environments).mockResolvedValueOnce(accepted);
    await renderHook();

    let response;
    await act(async () => {
      response = await result.start(payload);
    });

    expect(fetchMock).toHaveBeenLastCalledWith(URLS.tmsAutomation('demo'), {
      method: 'POST',
      data: payload,
      abort: expect.any(Function),
    });
    expect(response).toEqual(accepted);
    expect(result).toMatchObject({ isStarting: false, error: null });
  });

  test('maps the A2 confirmation conflict separately from generic failures', async () => {
    fetchMock
      .mockResolvedValueOnce(environments)
      .mockRejectedValueOnce({
        reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED',
        testCaseIds: [42],
      })
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
    expect(result.reautomationRequiredIds).toEqual([42]);
  });

  test('rejects malformed A2 and can clear its inline error', async () => {
    fetchMock
      .mockResolvedValueOnce(environments)
      .mockResolvedValueOnce({ ...accepted, accepted: [] });
    await renderHook();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });
    expect(result.error).toBe('INVALID_AUTOMATION_RESPONSE');

    act(() => result.clearError());
    expect(result.error).toBeNull();
  });

  test.each([
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED' },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [] },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [99] },
    { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: [42, 42] },
  ])('rejects a malformed 409 confirmation contract %#', async (error) => {
    fetchMock.mockResolvedValueOnce(environments).mockRejectedValueOnce(error);
    await renderHook();

    await act(async () => {
      expect(await result.start(payload)).toBeNull();
    });

    expect(result.error).toBe('JOB_START_FAILED');
    expect(result.reautomationRequiredIds).toEqual([]);
  });

  test('blocks A2 when the selected environment is not in the active A1 response', async () => {
    fetchMock.mockResolvedValueOnce(environments);
    await renderHook();

    await act(async () => {
      expect(await result.start({ ...payload, environment: 'prod' })).toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).toBe('INVALID_ENVIRONMENTS_RESPONSE');
  });

  test('clears A1 state and confirmation IDs when the project changes or reloads', async () => {
    const replacementA1 = createDeferred<typeof environments>();
    const reloadA1 = createDeferred<typeof environments>();
    fetchMock
      .mockResolvedValueOnce(environments)
      .mockRejectedValueOnce({
        reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED',
        testCaseIds: [42],
      })
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
      replacementA1.resolve(environments);
      await replacementA1.promise;
    });

    act(() => result.reloadEnvironments());
    expect(result).toMatchObject({
      environments: null,
      isLoadingEnvironments: true,
      reautomationRequiredIds: [],
    });
    await act(async () => {
      reloadA1.resolve(environments);
      await reloadA1.promise;
    });
  });

  test('ignores stale overlapping A1 results and their finally handlers', async () => {
    const first = createDeferred<typeof environments>();
    const second = createDeferred<typeof environments>();
    const firstCancel = jest.fn();
    const secondEnvironments = { environments: ['dev5'], default: 'dev5' };
    fetchMock
      .mockImplementationOnce((_url, params) => {
        (params?.abort as ((cancel: () => void) => void) | undefined)?.(firstCancel);
        return first.promise;
      })
      .mockReturnValueOnce(second.promise);
    wrapper = mount(<Harness projectKey="demo" onResult={captureResult} />);

    act(() => wrapper?.setProps({ projectKey: 'other' }));
    expect(firstCancel).toHaveBeenCalled();
    await act(async () => {
      second.resolve(secondEnvironments);
      await second.promise;
    });
    expect(result).toMatchObject({
      environments: secondEnvironments,
      isLoadingEnvironments: false,
    });

    await act(async () => {
      first.resolve(environments);
      await first.promise;
    });
    expect(result).toMatchObject({
      environments: secondEnvironments,
      isLoadingEnvironments: false,
    });
  });

  test('aborts and ignores stale overlapping A2 responses', async () => {
    const first = createDeferred<typeof accepted>();
    const second = createDeferred<typeof accepted>();
    const firstCancel = jest.fn();
    const secondAccepted = {
      ...accepted,
      iteration: { ...accepted.iteration, iterationId: 202, number: 2 },
    };
    fetchMock
      .mockResolvedValueOnce(environments)
      .mockImplementationOnce((_url, params) => {
        (params?.abort as ((cancel: () => void) => void) | undefined)?.(firstCancel);
        return first.promise;
      })
      .mockReturnValueOnce(second.promise);
    await renderHook();

    let firstResultPromise!: Promise<unknown>;
    let secondResultPromise!: Promise<unknown>;
    act(() => {
      firstResultPromise = result.start(payload);
      secondResultPromise = result.start(payload);
    });
    expect(firstCancel).toHaveBeenCalled();
    await act(async () => {
      first.resolve(accepted);
      second.resolve(secondAccepted);
      await Promise.all([first.promise, second.promise]);
    });

    await expect(firstResultPromise).resolves.toBeNull();
    await expect(secondResultPromise).resolves.toEqual(secondAccepted);
    expect(result).toMatchObject({ isStarting: false, error: null });
  });

  test.each(['unmount', 'project replacement'] as const)(
    'aborts and ignores an A2 response after %s',
    async (transition) => {
      const startRequest = createDeferred<typeof accepted>();
      const startCancel = jest.fn();
      fetchMock
        .mockResolvedValueOnce(environments)
        .mockImplementationOnce((_url, params) => {
          (params?.abort as ((cancel: () => void) => void) | undefined)?.(startCancel);
          return startRequest.promise;
        })
        .mockResolvedValueOnce(environments);
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
          expect.objectContaining({ abort: expect.any(Function) }),
        );
      }
      expect(startCancel).toHaveBeenCalled();

      await act(async () => {
        startRequest.resolve(accepted);
        await startRequest.promise;
      });
      await expect(startResult).resolves.toBeNull();
    },
  );
});
