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
  setActiveFolderId,
} from 'controllers/testCase/actionCreators';
import { getTestCaseByFolderIdAction } from 'controllers/testCase';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlFolderIdSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { useRefetchCurrentTestCases } from '../../hooks/useRefetchCurrentTestCases';

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
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();

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
          dispatch(setActiveFolderId({ activeFolderId: targetFolderId }));
          dispatch(
            getTestCaseByFolderIdAction({
              folderId: targetFolderId,
              limit: TestCasePageDefaultValues.limit,
              offset: TestCasePageDefaultValues.offset,
            }),
          );
          dispatch({
            type: TEST_CASE_LIBRARY_PAGE,
            payload: {
              testCasePageRoute: `folder/${targetFolderId}`,
              organizationSlug,
              projectSlug,
            },
          });
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
      projectKey,
      dispatch,
      showSpinner,
      hideSpinner,
      urlFolderId,
      refetchCurrentTestCases,
      organizationSlug,
      projectSlug,
      onSuccess,
    ],
  );

  return { batchDuplicate, isLoading };
};
