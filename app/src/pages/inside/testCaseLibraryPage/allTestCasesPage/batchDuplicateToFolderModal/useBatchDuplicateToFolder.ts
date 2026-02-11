/*
 * Copyright 2025 EPAM Systems
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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import {
  updateFolderCounterAction,
  createFoldersSuccessAction,
} from 'controllers/testCase/actionCreators';
import { urlFolderIdSelector } from 'controllers/pages';

import { useRefetchCurrentTestCases } from '../../hooks/useRefetchCurrentTestCases';
import { useNavigateToFolder } from '../../hooks/useNavigateToFolder';

interface BatchDuplicateParams {
  testCaseIds: number[];
  testFolderId?: number;
  testFolder?: {
    name: string;
    parentTestFolderId?: number;
  };
}

interface BatchDuplicateResponse {
  testFolderId: number;
}

export const useBatchDuplicateToFolder = ({ onSuccess }: { onSuccess: () => void }) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const urlFolderId = useSelector(urlFolderIdSelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();
  const { navigateToFolder } = useNavigateToFolder();

  const batchDuplicate = useCallback(
    async ({ testCaseIds, testFolder, testFolderId }: BatchDuplicateParams) => {
      showSpinner();

      try {
        const response = await fetch<BatchDuplicateResponse>(
          URLS.testCaseBatchDuplicate(projectKey),
          {
            method: 'POST',
            data: { testCaseIds, testFolder, testFolderId },
          },
        );

        const targetFolderId = response.testFolderId;
        const isNewFolder = Boolean(testFolder);

        if (isNewFolder && testFolder) {
          dispatch(
            createFoldersSuccessAction({
              id: targetFolderId,
              name: testFolder.name,
              parentFolderId: testFolder.parentTestFolderId ?? null,
              countOfTestCases: testCaseIds.length,
            }),
          );
        } else {
          dispatch(
            updateFolderCounterAction({
              folderId: targetFolderId,
              delta: testCaseIds.length,
            }),
          );
        }

        const isViewingTargetFolder = Number(urlFolderId) === targetFolderId;

        if (isViewingTargetFolder) {
          refetchCurrentTestCases();
        } else {
          navigateToFolder({ folderId: targetFolderId });
        }

        dispatch(hideModalAction());
        onSuccess();
        dispatch(
          showSuccessNotification({
            messageId: 'testCasesDuplicatedSuccess',
          }),
        );
      } catch {
        dispatch(
          showErrorNotification({
            messageId: 'errorOccurredTryAgain',
          }),
        );
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      projectKey,
      urlFolderId,
      dispatch,
      onSuccess,
      refetchCurrentTestCases,
      navigateToFolder,
      hideSpinner,
    ],
  );

  return { batchDuplicate, isLoading };
};
