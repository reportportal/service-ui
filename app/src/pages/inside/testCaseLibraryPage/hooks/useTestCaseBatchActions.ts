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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { FolderWithFullPath } from 'controllers/testCase';
import { projectKeySelector } from 'controllers/project';

import { NewFolderData } from '../utils/getFolderFromFormValues';
import { useFolderActions } from './useFolderActions';
import { useRefetchCurrentTestCases } from './useRefetchCurrentTestCases';
import { useNavigateToFolder } from './useNavigateToFolder';
import { useFolderCounterUpdate } from './useFolderCounterUpdate';
import { processFolderDestination } from '../utils/processFolderDestination';

const getFolderPayload = (folder: FolderWithFullPath | NewFolderData): Record<string, unknown> => {
  if ('fullPath' in folder) {
    return { testFolderId: folder.id };
  }

  return {
    testFolder: {
      name: folder.name,
      ...(folder.parentTestFolderId != null && { parentTestFolderId: folder.parentTestFolderId }),
    },
  };
};

interface BatchMoveParams {
  testCaseIds: number[];
  destinationFolder: FolderWithFullPath | NewFolderData;
  sourceFolderDeltasMap?: Record<string, number>;
  onSuccess?: () => void;
}

interface BatchMoveResponse {
  testFolderId: number;
}

interface BatchUpdatePriorityPayload {
  testCaseIds: number[];
  priority: string;
}

export const useTestCaseBatchActions = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { createNewStoreFolder } = useFolderActions();
  const { batchFolderCounterUpdate, updateFolderCounter } = useFolderCounterUpdate();
  const { navigateToFolderAfterAction } = useNavigateToFolder();
  const refetchCurrentTestCases = useRefetchCurrentTestCases();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const batchMove = useCallback(
    async ({
      testCaseIds,
      destinationFolder,
      sourceFolderDeltasMap = {},
      onSuccess = noop,
    }: BatchMoveParams) => {
      try {
        showSpinner();

        const response = await fetch<BatchMoveResponse>(URLS.testCasesBatch(projectKey), {
          method: 'PATCH',
          data: {
            testCaseIds,
            ...getFolderPayload(destinationFolder),
          },
        });

        const { targetFolderId, newFolderDetails, isNewFolder } = processFolderDestination({
          destination: destinationFolder,
          responseFolderId: response?.testFolderId,
        });

        if (isNewFolder && Boolean(newFolderDetails)) {
          createNewStoreFolder({
            id: targetFolderId,
            folderName: newFolderDetails.name,
            parentFolderId: newFolderDetails.parentTestFolderId,
            countOfTestCases: testCaseIds.length,
          });
        } else {
          updateFolderCounter({
            folderId: targetFolderId,
            delta: testCaseIds.length,
          });
        }

        batchFolderCounterUpdate({ folderDeltasMap: sourceFolderDeltasMap, isRemoval: true });

        navigateToFolderAfterAction({
          targetFolderId,
          newFolderDetails,
        });

        dispatch(hideModalAction());
        onSuccess();
        showSuccessNotification({
          messageId: testCaseIds.length > 1 ? 'testCasesMovedSuccess' : 'testCaseMovedSuccess',
        });
      } catch {
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      projectKey,
      batchFolderCounterUpdate,
      navigateToFolderAfterAction,
      dispatch,
      createNewStoreFolder,
      updateFolderCounter,
      hideSpinner,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  const batchUpdatePriority = useCallback(
    async (payload: BatchUpdatePriorityPayload, onSuccess: VoidFn) => {
      try {
        showSpinner();

        await fetch(URLS.testCasesBatch(projectKey), {
          method: 'PATCH',
          data: { ...payload },
        });

        onSuccess();

        refetchCurrentTestCases();

        dispatch(hideModalAction());
        showSuccessNotification({
          messageId:
            payload.testCaseIds.length > 1 ? 'testCaseBulkUpdateSuccess' : 'testCaseUpdatedSuccess',
        });
      } catch (error: unknown) {
        showErrorNotification({
          message: (error as Error).message,
        });
      } finally {
        hideSpinner();
      }
    },
    [
      projectKey,
      dispatch,
      showSpinner,
      hideSpinner,
      refetchCurrentTestCases,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return {
    isLoading,
    batchMove,
    batchUpdatePriority,
  };
};
