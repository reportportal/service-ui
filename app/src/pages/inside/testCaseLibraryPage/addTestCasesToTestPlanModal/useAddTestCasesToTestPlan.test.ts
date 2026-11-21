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
import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';
import type { TestPlanDto } from 'controllers/testPlan/types';

import { useAddTestCasesToTestPlan } from './useAddTestCasesToTestPlan';
import { AddTestCasesToTestPlanModalData } from './types';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
const mockShowSuccessNotification = jest.fn();
const mockShowErrorNotification = jest.fn();
const mockState = { project: { info: { projectKey: 'demo' } }, form: {} };

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({ isLoading: false, showSpinner: jest.fn(), hideSpinner: jest.fn() }),
  useNotification: () => ({
    showSuccessNotification: mockShowSuccessNotification,
    showErrorNotification: mockShowErrorNotification,
  }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookResult = ReturnType<typeof useAddTestCasesToTestPlan>;

const TEST_PLAN_ID = 11;
const FOLDER_ID = 4;
const testPlan = { id: TEST_PLAN_ID, name: 'Plan' } as TestPlanDto;

const Probe = ({
  data,
  onRender,
}: {
  data: AddTestCasesToTestPlanModalData;
  onRender: (result: HookResult) => void;
}) => {
  onRender(useAddTestCasesToTestPlan({ ...data, change: jest.fn() }));
  return null;
};

describe('useAddTestCasesToTestPlan', () => {
  let root: Root;
  let hook: HookResult;

  const render = (data: AddTestCasesToTestPlanModalData) => {
    act(() => {
      root.render(
        createElement(Probe, {
          data,
          onRender: (result) => {
            hook = result;
          },
        }),
      );
    });
  };

  const submit = async () => {
    await act(async () => {
      await hook.addTestCasesToTestPlan({ selectedTestPlan: testPlan });
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    root = createRoot(document.createElement('div'));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('adds a folder by its id without downloading its test cases', async () => {
    mockFetch.mockResolvedValueOnce({
      totalCount: 3,
      successCount: 3,
      failureCount: 0,
      successTestCaseIds: [1, 2, 3],
    });
    render({ folderId: FOLDER_ID, itemCount: 3 });

    await submit();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID), {
      method: 'post',
      data: { folderIds: [FOLDER_ID] },
    });
    expect(mockShowSuccessNotification).toHaveBeenCalledWith({
      messageId: 'testCasesAddingToTestPlanSuccess',
    });
    expect(mockShowErrorNotification).not.toHaveBeenCalled();
  });

  test('does nothing for a folder without test cases', async () => {
    render({ folderId: FOLDER_ID, itemCount: 0 });

    await submit();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockShowSuccessNotification).not.toHaveBeenCalled();
    expect(mockShowErrorNotification).not.toHaveBeenCalled();
  });

  test('a folder whose test cases are already in the plan is a success, not a partial failure', async () => {
    mockFetch.mockResolvedValueOnce({
      totalCount: 2,
      successCount: 2,
      failureCount: 0,
      successTestCaseIds: [1, 2],
      errors: [],
    });
    render({ folderId: FOLDER_ID, itemCount: 2 });

    await submit();

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ messageId: 'batchPartialFailure' }) as unknown,
      }),
    );
    expect(mockShowSuccessNotification).toHaveBeenCalled();
  });

  test('a folder above the limit shows the limit message and sends nothing', async () => {
    render({ folderId: FOLDER_ID, itemCount: ADD_BY_FOLDER_LIMIT + 1 });

    await submit();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockShowErrorNotification).toHaveBeenCalledWith({
      messageId: 'addByFolderLimitExceeded',
      values: { count: ADD_BY_FOLDER_LIMIT + 1, limit: ADD_BY_FOLDER_LIMIT },
    });
  });

  test('a folder rejected by the server shows the server message', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce({
      errorCode: 40016,
      message: 'Folders contain 6000 test cases, the limit per request is 5000',
    });
    render({ folderId: FOLDER_ID, itemCount: 10 });

    await submit();

    expect(mockShowErrorNotification).toHaveBeenCalledWith({
      message: 'Folders contain 6000 test cases, the limit per request is 5000',
      messageId: undefined,
    });
  });

  test('selected test cases are still sent as ids', async () => {
    mockFetch.mockResolvedValueOnce({ totalCount: 2, successCount: 2, failureCount: 0 });
    render({ selectedTestCaseIds: [7, 8] });

    await submit();

    expect(mockFetch).toHaveBeenCalledWith(URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID), {
      method: 'post',
      data: { testCaseIds: [7, 8] },
    });
  });
});
