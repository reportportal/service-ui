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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { getFoldersAction } from 'controllers/testCase';

import { DuplicateTestCasePayload, DuplicateTestCaseResponse } from './types';

export const useDuplicateTestCase = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const duplicateTestCase = useCallback(
    async ({ testCaseId, testFolderId, name }: DuplicateTestCasePayload) => {
      showSpinner();

      try {
        const response = await fetch<DuplicateTestCaseResponse>(
          URLS.testCaseBatchDuplicate(projectKey),
          {
            method: 'POST',
            data: {
              testCaseIds: [testCaseId],
              testFolderId,
            },
          },
        );

        // Update the name of the duplicated test case
        const duplicatedTestCaseId = response.testCases?.[0]?.id;

        if (duplicatedTestCaseId) {
          await fetch(URLS.testCaseDetails(projectKey, duplicatedTestCaseId), {
            method: 'PATCH',
            data: { name },
          });
        }

        dispatch(hideModalAction());
        dispatch(getFoldersAction());

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
      showSuccessNotification,
      showErrorNotification,
      hideSpinner,
    ],
  );

  return {
    isLoading,
    duplicateTestCase,
  };
};
