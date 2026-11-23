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
import { createRoot, type Root } from 'react-dom/client';

import { NOTIFICATION_TYPES } from 'controllers/notification';

import { useDuplicateFolder } from './useDuplicateFolder';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
const mockFetchAllFolders = jest.fn();
const mockHandleOperationError = jest.fn();
const mockShowErrorNotification = jest.fn();
const mockHandleOperationSuccess = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => 'proj',
}));
jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));
jest.mock('controllers/testCase/utils/fetchAllFolders', () => ({
  fetchAllFolders: (...args: unknown[]) => mockFetchAllFolders(...args) as unknown,
}));
jest.mock('../../../hooks/useFolderOperationUI', () => ({
  useFolderOperationUI: () => ({
    isLoading: false,
    handleOperationStart: jest.fn(),
    handleOperationSuccess: mockHandleOperationSuccess,
    handleOperationError: mockHandleOperationError,
    showErrorNotification: mockShowErrorNotification,
  }),
}));
jest.mock('../../../hooks/useNavigateToFolder', () => ({
  useNavigateToFolder: () => ({ navigateToFolderAfterAction: jest.fn() }),
}));
jest.mock('./duplicationResult', () => ({
  getDuplicationFailure: () => ({ successCount: 1, totalCount: 2, failureCount: 1, errors: '' }),
}));

describe('useDuplicateFolder', () => {
  let container: HTMLDivElement;
  let root: Root;
  const hook: { duplicateFolder?: ReturnType<typeof useDuplicateFolder>['duplicateFolder'] } = {};

  const Harness = () => {
    const { duplicateFolder } = useDuplicateFolder();

    useEffect(() => {
      hook.duplicateFolder = duplicateFolder;
    }, [duplicateFolder]);

    return null;
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    jest.clearAllMocks();
    container = document.createElement('div');
    root = createRoot(container);
    act(() => root.render(<Harness />));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('reports a partial duplication even when the folder refresh fails', async () => {
    mockFetch.mockResolvedValueOnce({ id: 7, name: 'Copy', parentFolderId: null });
    mockFetchAllFolders.mockRejectedValueOnce(new Error('refresh failed'));

    await act(() => hook.duplicateFolder?.({ folderId: 3, folderName: 'Copy' }));

    expect(mockHandleOperationError).toHaveBeenCalled();
    expect(mockHandleOperationSuccess).not.toHaveBeenCalled();
    expect(mockShowErrorNotification).toHaveBeenCalledWith({ messageId: 'errorOccurredTryAgain' });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          messageId: 'batchPartialFailure',
          type: NOTIFICATION_TYPES.WARNING,
        }) as unknown,
      }),
    );
  });
});
