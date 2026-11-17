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
import { useSelector } from 'react-redux';
import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { useRefetchCurrentTestCases } from '../../hooks/useRefetchCurrentTestCases';
import { useFolderCounterUpdate } from '../../hooks/useFolderCounterUpdate';

export const useBatchDeleteTestCases = ({
  onSuccess,
  testCasesToDelete,
}: {
  onSuccess: VoidFn;
  testCasesToDelete: number;
}) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const projectKey = useSelector(projectKeySelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases(testCasesToDelete);
  const { batchFolderCounterUpdate } = useFolderCounterUpdate();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const batchDelete = useCallback(
    async (testCaseIds: number[], folderDeltasMap: Record<string, number>) => {
      showSpinner();

      try {
        await fetch(URLS.testCasesBatch(projectKey), {
          method: 'DELETE',
          data: { testCaseIds },
        });

        batchFolderCounterUpdate({
          folderDeltasMap,
          isRemoval: true,
        });

        refetchCurrentTestCases();

        onSuccess();

        showSuccessNotification({
          messageId: testCaseIds.length > 1 ? 'testCasesDeletedSuccess' : 'testCaseDeletedSuccess',
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
      projectKey,
      showSpinner,
      hideSpinner,
      refetchCurrentTestCases,
      onSuccess,
      batchFolderCounterUpdate,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { batchDelete, isLoading };
};
