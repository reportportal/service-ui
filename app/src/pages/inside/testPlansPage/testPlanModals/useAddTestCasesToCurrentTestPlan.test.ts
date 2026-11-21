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

import { URLS } from 'common/urls';

import { useAddTestCasesToCurrentTestPlan } from './useAddTestCasesToCurrentTestPlan';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
const mockShowSuccessNotification = jest.fn();
const mockShowErrorNotification = jest.fn();
const mockReloadActiveTestPlan = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => 'project_key',
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({
    isLoading: false,
    showSpinner: jest.fn(),
    hideSpinner: jest.fn(),
  }),
  useNotification: () => ({
    showSuccessNotification: mockShowSuccessNotification,
    showErrorNotification: mockShowErrorNotification,
  }),
}));

jest.mock('./useReloadActiveTestPlan', () => ({
  useReloadActiveTestPlan: () => mockReloadActiveTestPlan,
}));

jest.mock('hooks/useTypedSelector', () => ({
  useTestPlanId: () => '7',
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookResult = ReturnType<typeof useAddTestCasesToCurrentTestPlan>;

describe('useAddTestCasesToCurrentTestPlan', () => {
  let root: Root;
  let hook: HookResult;

  const Probe = ({ onRender }: { onRender: (result: HookResult) => void }) => {
    onRender(useAddTestCasesToCurrentTestPlan());
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    root = createRoot(document.createElement('div'));
    act(() => {
      root.render(
        createElement(Probe, {
          onRender: (result) => {
            hook = result;
          },
        }),
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    jest.restoreAllMocks();
  });

  test('reports a partial result as a warning and keeps the panel open', async () => {
    mockFetch.mockResolvedValueOnce({
      totalCount: 3,
      successCount: 2,
      failureCount: 1,
      successTestCaseIds: [1, 2],
      errors: [{ testCaseId: 3, message: 'Test case 3 is already in the test plan' }],
    });

    const result = await hook.addTestCasesToCurrentTestPlan({ testCaseIds: [1, 2, 3] });

    expect(result).toBe(false);
    expect(mockReloadActiveTestPlan).toHaveBeenCalledTimes(1);
    expect(mockShowSuccessNotification).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'warning',
          messageId: 'batchPartialFailure',
          values: {
            successCount: 2,
            totalCount: 3,
            failureCount: 1,
            errors: 'Test case 3 is already in the test plan',
          },
        }) as unknown,
      }),
    );
  });

  test('reports the number of added test cases from the response', async () => {
    mockFetch.mockResolvedValueOnce({ totalCount: 2, successCount: 2, failureCount: 0 });

    const result = await hook.addTestCasesToCurrentTestPlan({ testCaseIds: [1, 2] });

    expect(result).toBe(true);
    expect(mockReloadActiveTestPlan).toHaveBeenCalledTimes(1);
    expect(mockShowSuccessNotification).toHaveBeenCalledWith({
      messageId: 'testCasesAddedToTestPlanFromLibrarySuccess',
      values: { count: 2 },
    });
  });

  test('adds folders by id and treats test cases already in the plan as added', async () => {
    mockFetch.mockResolvedValueOnce({
      totalCount: 4,
      successCount: 4,
      failureCount: 0,
      successTestCaseIds: [1, 2, 3, 4],
      errors: [],
    });

    const result = await hook.addTestCasesToCurrentTestPlan({ folderIds: [5, 6] });

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(URLS.testPlanTestCasesBatch('project_key', 7), {
      method: 'post',
      data: { folderIds: [5, 6] },
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockShowSuccessNotification).toHaveBeenCalledWith({
      messageId: 'testCasesAddedToTestPlanFromLibrarySuccess',
      values: { count: 4 },
    });
  });

  test('shows the backend error message', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce({ errorCode: 4091, message: 'Test plan is locked' });

    const result = await hook.addTestCasesToCurrentTestPlan({ testCaseIds: [1] });

    expect(result).toBe(false);
    expect(mockShowErrorNotification).toHaveBeenCalledWith({
      message: 'Test plan is locked',
      messageId: undefined,
    });
  });
});
