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

import { act, ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';
import { TransformedFolder } from 'controllers/testCase';

import { TestPlanDropZones } from '../testPlanDropZones';
import { TestPlanDropZonesContainer } from './testPlanDropZonesContainer';

type DropZonesProps = ComponentProps<typeof TestPlanDropZones>;

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
const mockOpenModal = jest.fn();
const mockShowErrorNotification = jest.fn();
let mockDropZonesProps: DropZonesProps;

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
  useNotification: () => ({ showErrorNotification: mockShowErrorNotification }),
}));

jest.mock(
  'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage',
  () => ({
    AddTestCasesToLaunchModal: () => null,
    ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY: 'addTestCasesToLaunchModal',
  }),
);

jest.mock('../testPlanDropZones', () => ({
  TestPlanDropZones: (props: DropZonesProps) => {
    mockDropZonesProps = props;
    return null;
  },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const TEST_PLAN_ID = 3;

const folder = (id: number, testsCount: number, folders: TransformedFolder[] = []) =>
  ({ id, name: `Folder ${id}`, testsCount, parentFolderId: null, folders }) as TransformedFolder;

describe('TestPlanDropZonesContainer: dropped folders', () => {
  let root: Root;
  let onAddTestCases: jest.Mock;
  let onClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onAddTestCases = jest.fn().mockResolvedValue(true);
    onClose = jest.fn();
    root = createRoot(document.createElement('div'));
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <TestPlanDropZonesContainer
            testPlanId={TEST_PLAN_ID}
            onAddTestCases={onAddTestCases}
            onClose={onClose}
          />
        </IntlProvider>,
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('adds dropped folders to the plan by id without downloading their test cases', async () => {
    await act(async () => {
      mockDropZonesProps.onAddFolderToTestPlan([folder(1, 2, [folder(2, 3)]), folder(4, 1)]);
      await Promise.resolve();
    });

    expect(onAddTestCases).toHaveBeenCalledWith({ folderIds: [1, 4] });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('opens the launch modal with the dropped folders after adding them to the plan', async () => {
    await act(async () => {
      mockDropZonesProps.onAddFolderAndCreateLaunch([folder(1, 2, [folder(2, 3)])]);
      await Promise.resolve();
    });

    expect(onAddTestCases).toHaveBeenCalledWith({ folderIds: [1] });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedRowsIds: [],
        testCases: [],
        folderIds: [1],
        itemCount: 5,
        testPlanId: String(TEST_PLAN_ID),
      }),
    );
  });

  test('folders above the limit show the limit message and add nothing', () => {
    act(() => {
      mockDropZonesProps.onAddFolderToTestPlan([folder(1, ADD_BY_FOLDER_LIMIT, [folder(2, 1)])]);
    });

    expect(mockShowErrorNotification).toHaveBeenCalledWith({
      messageId: 'addByFolderLimitExceeded',
      values: { count: ADD_BY_FOLDER_LIMIT + 1, limit: ADD_BY_FOLDER_LIMIT },
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(onAddTestCases).not.toHaveBeenCalled();
  });

  test('large folders below the limit still ask for confirmation first', () => {
    act(() => {
      mockDropZonesProps.onAddFolderToTestPlan([folder(1, 1001)]);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { activeModal: expect.objectContaining({ id: 'confirmationModal' }) as unknown },
      }),
    );
    expect(onAddTestCases).not.toHaveBeenCalled();
  });
});
