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
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { FolderWithFullPath } from 'controllers/testCase';

import { useFolderActions } from '../../hooks/useFolderActions';

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
  const { processFolderDestinationAndComplete } = useFolderActions();
  const { showSuccessNotification, showErrorNotification } = useNotification();

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

        processFolderDestinationAndComplete({
          destination: testFolder ?? ({ id: response.testFolderId } as FolderWithFullPath),
          responseFolderId: response.testFolderId,
          testCaseCount: testCaseIds.length,
        });

        dispatch(hideModalAction());
        onSuccess();
        showSuccessNotification({
          messageId: 'testCasesDuplicatedSuccess',
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
      dispatch,
      onSuccess,
      processFolderDestinationAndComplete,
      hideSpinner,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { batchDuplicate, isLoading };
};
