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
import { mount, type ReactWrapper } from 'enzyme';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import type { TestCaseAiRS } from 'types/aiFactory';

import { useTestCaseAi } from './useTestCaseAi';

jest.mock('common/utils', () => ({
  ERROR_CANCELED: 'REQUEST_CANCELED',
  fetch: jest.fn(),
}));

interface HarnessProps {
  projectKey: string;
  testCaseId: number;
  isEnabled: boolean;
  resourceVersion?: number;
  onResult: (result: HookResult) => void;
}

type HookResult = ReturnType<typeof useTestCaseAi>;
const fetchMock = fetch as unknown as jest.MockedFunction<
  (url: string, params?: unknown) => Promise<unknown>
>;

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const createResponse = (): TestCaseAiRS => ({
  pipelineLinks: [],
  lifecycleHistory: [],
});

let hookResult: HookResult;

const Harness = ({
  projectKey,
  testCaseId,
  isEnabled,
  resourceVersion,
  onResult,
}: HarnessProps) => {
  const result = useTestCaseAi(projectKey, testCaseId, isEnabled, resourceVersion);

  useEffect(() => onResult(result), [onResult, result]);

  return null;
};

const captureHookResult = (result: HookResult) => {
  hookResult = result;
};

describe('useTestCaseAi', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  test.each([
    { projectKey: 'demo', testCaseId: 42, isEnabled: false },
    { projectKey: '', testCaseId: 42, isEnabled: true },
    { projectKey: 'demo', testCaseId: 0, isEnabled: true },
  ])('does not fetch for invalid or disabled input %#', (props) => {
    wrapper = mount(<Harness {...props} onResult={captureHookResult} />);

    expect(fetch).not.toHaveBeenCalled();
    expect(hookResult).toMatchObject({ data: null, isLoading: false, isError: false });
  });

  test('loads lifecycle data and exposes it only after the active request resolves', async () => {
    const response = createResponse();
    const request = createDeferred<TestCaseAiRS>();
    fetchMock.mockReturnValue(request.promise);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={42} isEnabled onResult={captureHookResult} />,
    );

    expect(fetch).toHaveBeenCalledWith(
      URLS.testCaseAi('demo', 42),
      expect.objectContaining({ abort: expect.any(Function) }),
    );
    expect(hookResult).toMatchObject({ data: null, isLoading: true, isError: false });

    await act(async () => {
      request.resolve(response);
      await request.promise;
    });
    expect(hookResult).toMatchObject({ data: response, isLoading: false, isError: false });
  });

  test('does not expose a stale response after the requested test case changes', async () => {
    const firstRequest = createDeferred<TestCaseAiRS>();
    const secondRequest = createDeferred<TestCaseAiRS>();
    const staleResponse = createResponse();
    const currentResponse = { ...createResponse(), lifecycleHistory: [] };
    fetchMock.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={41} isEnabled onResult={captureHookResult} />,
    );

    wrapper.setProps({ testCaseId: 42 });
    await act(async () => {
      firstRequest.resolve(staleResponse);
      await firstRequest.promise;
    });
    expect(hookResult).toMatchObject({ data: null, isLoading: true, isError: false });

    await act(async () => {
      secondRequest.resolve(currentResponse);
      await secondRequest.promise;
    });
    expect(hookResult).toMatchObject({ data: currentResponse, isLoading: false, isError: false });
  });

  test.each(['success', 'error'] as const)(
    'ignores stale %s after the project key changes',
    async (staleOutcome) => {
      const staleRequest = createDeferred<TestCaseAiRS>();
      const currentRequest = createDeferred<TestCaseAiRS>();
      const currentResponse = createResponse();
      fetchMock
        .mockReturnValueOnce(staleRequest.promise)
        .mockReturnValueOnce(currentRequest.promise);
      wrapper = mount(
        <Harness
          projectKey="first-project"
          testCaseId={42}
          isEnabled
          onResult={captureHookResult}
        />,
      );

      wrapper.setProps({ projectKey: 'second-project' });
      await act(async () => {
        if (staleOutcome === 'success') {
          staleRequest.resolve(createResponse());
          await staleRequest.promise;
        } else {
          staleRequest.reject(new Error('Stale project error'));
          await staleRequest.promise.catch(() => undefined);
        }
      });

      expect(fetch).toHaveBeenNthCalledWith(
        1,
        URLS.testCaseAi('first-project', 42),
        expect.objectContaining({ abort: expect.any(Function) }),
      );
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        URLS.testCaseAi('second-project', 42),
        expect.objectContaining({ abort: expect.any(Function) }),
      );
      expect(hookResult).toMatchObject({ data: null, isLoading: true, isError: false });

      await act(async () => {
        currentRequest.resolve(currentResponse);
        await currentRequest.promise;
      });
      expect(hookResult.data).toBe(currentResponse);
      expect(hookResult).toMatchObject({ isLoading: false, isError: false });
    },
  );

  test('starts a fresh request when the test case resource version changes', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    wrapper = mount(
      <Harness
        projectKey="demo"
        testCaseId={42}
        isEnabled
        resourceVersion={100}
        onResult={captureHookResult}
      />,
    );

    wrapper.setProps({ resourceVersion: 200 });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('exposes an error and starts a fresh request when reloaded', async () => {
    const retryResponse = createResponse();
    fetchMock
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(retryResponse);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={42} isEnabled onResult={captureHookResult} />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(hookResult).toMatchObject({ data: null, isLoading: false, isError: true });

    await act(async () => {
      hookResult.reload();
      await Promise.resolve();
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(hookResult).toMatchObject({ data: retryResponse, isLoading: false, isError: false });
  });

  test('keeps last-good data for the same resource while a reload is pending and after it fails', async () => {
    const response = createResponse();
    const reloadRequest = createDeferred<TestCaseAiRS>();
    fetchMock.mockResolvedValueOnce(response).mockReturnValueOnce(reloadRequest.promise);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={42} isEnabled onResult={captureHookResult} />,
    );
    await act(async () => {
      await Promise.resolve();
    });

    act(() => hookResult.reload());
    expect(hookResult).toMatchObject({ data: response, isLoading: true, isError: false });

    await act(async () => {
      reloadRequest.reject(new Error('Network error'));
      await reloadRequest.promise.catch(() => undefined);
    });
    expect(hookResult).toMatchObject({ data: response, isLoading: false, isError: true });
  });

  test('does not carry last-good data to another test-case resource', async () => {
    const response = createResponse();
    const nextRequest = createDeferred<TestCaseAiRS>();
    fetchMock.mockResolvedValueOnce(response).mockReturnValueOnce(nextRequest.promise);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={41} isEnabled onResult={captureHookResult} />,
    );
    await act(async () => {
      await Promise.resolve();
    });

    wrapper.setProps({ testCaseId: 42 });

    expect(hookResult).toMatchObject({ data: null, isLoading: true, isError: false });
  });

  test('ignores a stale rejection after the requested resource changes', async () => {
    const staleRequest = createDeferred<TestCaseAiRS>();
    const currentResponse = createResponse();
    fetchMock.mockReturnValueOnce(staleRequest.promise).mockResolvedValueOnce(currentResponse);
    wrapper = mount(
      <Harness projectKey="demo" testCaseId={41} isEnabled onResult={captureHookResult} />,
    );

    wrapper.setProps({ testCaseId: 42 });
    await act(async () => {
      staleRequest.reject(new Error('Stale network error'));
      await staleRequest.promise.catch(() => undefined);
      await Promise.resolve();
    });

    expect(hookResult).toMatchObject({
      data: currentResponse,
      isLoading: false,
      isError: false,
    });
  });
});
