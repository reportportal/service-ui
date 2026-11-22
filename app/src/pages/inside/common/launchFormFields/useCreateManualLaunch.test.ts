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
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';
import { NOTIFICATION_TYPES } from 'controllers/notification';
import { ExtendedTestCase } from 'types/testCase';
import { useCreateManualLaunch } from './useCreateManualLaunch';
import { LaunchFormData, LaunchMode } from './types';

const mockDispatch = jest.fn();
const mockState = {
  project: { info: { projectKey: 'demo' } },
  testCase: { folders: { data: [] as unknown[] } },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const mockedFetch = fetch as unknown as jest.Mock;
const LAUNCH_ID = 5;
const TEST_PLAN_ID = 9;
const testCases = [{ id: 1 }, { id: 2 }, { id: 3 }] as ExtendedTestCase[];
const formValues: LaunchFormData = { name: { id: LAUNCH_ID, name: 'launch' }, attributes: [] };

type HandleSubmit = ReturnType<typeof useCreateManualLaunch>['handleSubmit'];

const renderHook = (
  onSubmitSuccess: jest.Mock,
  {
    mode = LaunchMode.EXISTING,
    folderIds,
    selectedTestCaseIds = [1, 2, 3],
  }: { mode?: LaunchMode; folderIds?: number[]; selectedTestCaseIds?: number[] } = {},
) => {
  let handleSubmit: HandleSubmit | null = null;
  const capture = (result: ReturnType<typeof useCreateManualLaunch>) => {
    handleSubmit = result.handleSubmit;
  };
  const Harness = () => {
    capture(
      useCreateManualLaunch(
        testCases,
        mode,
        null,
        LAUNCH_ID,
        folderIds,
        undefined,
        onSubmitSuccess,
        selectedTestCaseIds,
      ),
    );
    return null;
  };
  mount(createElement(IntlProvider, { locale: 'en' }, createElement(Harness)));
  return (values: LaunchFormData) => handleSubmit?.(values);
};

const mockFetchByUrl = (responses: Record<string, () => Promise<unknown>>) => {
  mockedFetch.mockImplementation((url: string) => responses[url]());
};

const notificationTypes = () =>
  mockDispatch.mock.calls.map(
    ([action]: [{ type: string; payload?: { type?: string } }]) => action.payload?.type,
  );

describe('useCreateManualLaunch: add to existing launch', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockedFetch.mockReset();
  });

  test('a partial add warns and syncs only the added test cases to the test plan', async () => {
    mockFetchByUrl({
      [URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID)]: () =>
        Promise.resolve({
          totalCount: 3,
          successCount: 2,
          failureCount: 1,
          successTestCaseIds: [1, 3],
          errors: [{ testCaseId: 2, errorMessage: 'Already in the launch' }],
        }),
      [URLS.manualLaunchById('demo', LAUNCH_ID)]: () =>
        Promise.resolve({ id: LAUNCH_ID, testPlan: { id: TEST_PLAN_ID } }),
      [URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID)]: () => Promise.resolve({}),
    });
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess);

    await act(async () => {
      await handleSubmit(formValues);
    });

    expect(mockedFetch).toHaveBeenCalledWith(URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID), {
      method: 'POST',
      data: { testCaseIds: [1, 3] },
    });
    expect(notificationTypes()).toContain(NOTIFICATION_TYPES.WARNING);
    expect(notificationTypes()).not.toContain(NOTIFICATION_TYPES.SUCCESS);
    expect(onSubmitSuccess).toHaveBeenCalled();
  });

  test('a failed test plan sync is a warning, not a failure of the launch update', async () => {
    mockFetchByUrl({
      [URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID)]: () =>
        Promise.resolve({ totalCount: 3, successCount: 3, failureCount: 0 }),
      [URLS.manualLaunchById('demo', LAUNCH_ID)]: () =>
        Promise.resolve({ id: LAUNCH_ID, testPlan: { id: TEST_PLAN_ID } }),
      [URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID)]: () =>
        Promise.reject(new Error('Plan is archived')),
    });
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess);

    await act(async () => {
      await handleSubmit(formValues);
    });

    expect(notificationTypes()).toEqual([NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_TYPES.WARNING]);
    expect(onSubmitSuccess).toHaveBeenCalledWith(LaunchMode.EXISTING);
  });
});

describe('useCreateManualLaunch: add folders', () => {
  const FOLDER_ID = 21;
  const SUBFOLDER_ID = 22;
  const setLibraryFolders = (rootCount: number, subfolderCount: number) => {
    mockState.testCase.folders.data = [
      { id: FOLDER_ID, name: 'Root', countOfTestCases: rootCount, parentFolderId: null },
      {
        id: SUBFOLDER_ID,
        name: 'Child',
        countOfTestCases: subfolderCount,
        parentFolderId: FOLDER_ID,
      },
    ];
  };
  const requestedUrls = () => mockedFetch.mock.calls.map(([url]: [string]) => url);

  beforeEach(() => {
    mockDispatch.mockClear();
    mockedFetch.mockReset();
    setLibraryFolders(2, 3);
  });

  test('adds a folder to an existing launch and its test plan by folder id', async () => {
    mockFetchByUrl({
      [URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID)]: () =>
        Promise.resolve({
          totalCount: 5,
          successCount: 5,
          failureCount: 0,
          successTestCaseIds: [1, 2, 3, 4, 5],
          errors: [],
        }),
      [URLS.manualLaunchById('demo', LAUNCH_ID)]: () =>
        Promise.resolve({ id: LAUNCH_ID, testPlan: { id: TEST_PLAN_ID } }),
      [URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID)]: () => Promise.resolve({}),
    });
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess, {
      folderIds: [FOLDER_ID],
      selectedTestCaseIds: undefined,
    });

    await act(async () => {
      await handleSubmit(formValues);
    });

    expect(requestedUrls()).toEqual([
      URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID),
      URLS.manualLaunchById('demo', LAUNCH_ID),
      URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID),
    ]);
    expect(mockedFetch).toHaveBeenCalledWith(URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID), {
      method: 'POST',
      data: { folderIds: [FOLDER_ID] },
    });
    expect(mockedFetch).toHaveBeenCalledWith(URLS.testPlanTestCasesBatch('demo', TEST_PLAN_ID), {
      method: 'POST',
      data: { folderIds: [FOLDER_ID] },
    });
    expect(notificationTypes()).toEqual([NOTIFICATION_TYPES.SUCCESS]);
    expect(onSubmitSuccess).toHaveBeenCalledWith(LaunchMode.EXISTING);
  });

  test('creates a new launch from a folder without downloading its test cases', async () => {
    mockFetchByUrl({
      [URLS.manualLaunch('demo')]: () => Promise.resolve({ id: LAUNCH_ID }),
    });
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess, {
      mode: LaunchMode.NEW,
      folderIds: [FOLDER_ID],
      selectedTestCaseIds: undefined,
    });

    await act(async () => {
      await handleSubmit({ name: 'New launch', attributes: [] });
    });

    expect(requestedUrls()).toEqual([URLS.manualLaunch('demo')]);
    expect(mockedFetch).toHaveBeenCalledWith(URLS.manualLaunch('demo'), {
      method: 'POST',
      data: expect.objectContaining({
        name: 'New launch',
        testCaseIds: [],
        folderIds: [FOLDER_ID],
      }) as unknown,
    });
    expect(onSubmitSuccess).toHaveBeenCalledWith(LaunchMode.NEW);
  });

  test('a folder subtree above the limit shows the limit message and sends nothing', async () => {
    setLibraryFolders(ADD_BY_FOLDER_LIMIT, 1);
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess, {
      folderIds: [FOLDER_ID],
      selectedTestCaseIds: undefined,
    });

    await act(async () => {
      await handleSubmit(formValues);
    });

    expect(mockedFetch).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: NOTIFICATION_TYPES.ERROR,
          messageId: 'addByFolderLimitExceeded',
          values: { count: ADD_BY_FOLDER_LIMIT + 1, limit: ADD_BY_FOLDER_LIMIT },
        }) as unknown,
      }),
    );
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });

  test('a folder rejected by the server over the limit shows the server message', async () => {
    mockFetchByUrl({
      [URLS.batchAddTestCasesToLaunch('demo', LAUNCH_ID)]: () =>
        Promise.reject(
          Object.assign(
            new Error('Folders contain 6000 test cases, the limit per request is 5000'),
            { errorCode: 40016 },
          ),
        ),
    });
    const onSubmitSuccess = jest.fn();
    const handleSubmit = renderHook(onSubmitSuccess, {
      folderIds: [FOLDER_ID],
      selectedTestCaseIds: undefined,
    });

    await act(async () => {
      await handleSubmit(formValues);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Folders contain 6000 test cases, the limit per request is 5000',
        }) as unknown,
      }),
    );
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });
});
