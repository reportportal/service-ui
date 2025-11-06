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
import { updateFolderCounterAction } from 'controllers/testCase/actionCreators';
import {
  getTestCaseByFolderIdAction,
  getAllTestCasesAction,
  testCasesPageSelector,
} from 'controllers/testCase';
import { urlFolderIdSelector } from 'controllers/pages';
import { getTestCaseRequestParams } from 'pages/inside/testCaseLibraryPage/utils';

interface BatchDuplicateParams {
  testCaseIds: number[];
  testFolderId?: number;
  testFolder?: {
    name: string;
    parentTestFolderId?: number;
  };
}

export const useBatchDuplicateToFolder = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const urlFolderId = useSelector(urlFolderIdSelector);
  const testCasesPageData = useSelector(testCasesPageSelector);

  const batchDuplicate = useCallback(
    async ({ testCaseIds, testFolder, testFolderId }: BatchDuplicateParams) => {
      showSpinner();

      try {
        await fetch(URLS.testCaseBatchDuplicate(projectKey), {
          method: 'POST',
          data: { testCaseIds, testFolder, testFolderId },
        });

        // TODO: Get created folder id after backend supports it
        const targetFolderId = testFolderId || null;

        if (targetFolderId) {
          dispatch(
            updateFolderCounterAction({
              folderId: targetFolderId,
              delta: testCaseIds.length,
            }),
          );
        }

        const paginationParams = getTestCaseRequestParams(testCasesPageData);
        const isViewingTargetFolder = targetFolderId && Number(urlFolderId) === targetFolderId;
        const isViewingAllTestCases = !urlFolderId && !targetFolderId;

        if (isViewingTargetFolder) {
          dispatch(
            getTestCaseByFolderIdAction({
              folderId: targetFolderId,
              ...paginationParams,
            }),
          );
        }

        if (isViewingAllTestCases) {
          dispatch(getAllTestCasesAction(paginationParams));
        }

        dispatch(hideModalAction());
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
    [projectKey, dispatch, showSpinner, hideSpinner, urlFolderId, testCasesPageData],
  );

  return { batchDuplicate, isLoading };
};
