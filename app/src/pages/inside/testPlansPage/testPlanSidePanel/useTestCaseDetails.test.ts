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

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { useTestCaseDetails } from './useTestCaseDetails';

const mockFetch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => 'project_key',
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({ isLoading: false, showSpinner: jest.fn(), hideSpinner: jest.fn() }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookResult = ReturnType<typeof useTestCaseDetails>;

describe('useTestCaseDetails', () => {
  let root: Root;
  let hook: HookResult;

  const Probe = ({ testCaseId }: { testCaseId: number }) => {
    const result = useTestCaseDetails({ testCaseId, testPlanId: 5 });

    // eslint-disable-next-line react-hooks/globals
    hook = result;
    return null;
  };

  const render = async (testCaseId: number) => {
    await act(async () => {
      root.render(createElement(Probe, { testCaseId }));
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    mockFetch.mockReset();
    root = createRoot(document.createElement('div'));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('does not keep the previous test case details while the next one loads', async () => {
    mockFetch.mockResolvedValueOnce({ id: 1, name: 'First' });
    await render(1);
    expect(hook.testCaseDetails).toEqual({ id: 1, name: 'First' });

    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    await render(2);

    expect(hook.testCaseDetails).toBeNull();
  });
});
