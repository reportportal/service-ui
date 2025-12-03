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
import { useSelector, useDispatch } from 'react-redux';
import { forOwn } from 'es-toolkit/compat';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { updateFolderCounterAction } from 'controllers/testCase';
import { useRefetchCurrentTestCases } from '../../hooks/useRefetchCurrentTestCases';

export const useBatchDeleteTestCases = ({ onSuccess }: { onSuccess: () => void }) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();

  const batchDelete = useCallback(
    async (testCaseIds: number[], folderDeltasMap: Record<string, number>) => {
      showSpinner();

      try {
        await fetch(URLS.testCasesBatch(projectKey), {
          method: 'DELETE',
          data: { testCaseIds },
        });

        forOwn(folderDeltasMap, (delta, folderId) => {
          dispatch(
            updateFolderCounterAction({
              folderId: Number(folderId),
              delta: -delta,
            }),
          );
        });

        refetchCurrentTestCases();

        onSuccess();

        showSuccessNotification({
          messageId: 'testCasesDeletedSuccess',
        });
      } catch {
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        });
      } finally {
        hideSpinner();
      }
    },
    [projectKey, dispatch, showSpinner, hideSpinner, refetchCurrentTestCases, onSuccess],
  );

  return { batchDelete, isLoading };
};
