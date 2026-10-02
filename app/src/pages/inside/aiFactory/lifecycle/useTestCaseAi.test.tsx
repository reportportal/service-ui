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

const Harness = ({ projectKey, testCaseId, isEnabled, onResult }: HarnessProps) => {
  const result = useTestCaseAi(projectKey, testCaseId, isEnabled);

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
});
