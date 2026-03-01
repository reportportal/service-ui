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
import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import {
  getManualLaunchTestCaseExecutionsAction,
  getManualLaunchFoldersAction,
  getManualLaunchAction,
} from 'controllers/manualLaunch';

export const useBatchDeleteExecutions = ({
  onSuccess,
  launchId,
}: {
  onSuccess: VoidFn;
  launchId: string | number;
}) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const projectKey = useSelector(projectKeySelector);
  const dispatch = useDispatch();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const batchDelete = useCallback(
    async (executionIds: number[]) => {
      showSpinner();

      try {
        await fetch(URLS.batchDeleteExecutionsFromLaunch(projectKey, launchId), {
          method: 'DELETE',
          data: { executionIds },
        });

        onSuccess();

        showSuccessNotification({
          messageId:
            executionIds.length > 1 ? 'executionsDeletedSuccess' : 'executionDeletedSuccess',
        });

        dispatch(getManualLaunchTestCaseExecutionsAction({ launchId }));
        dispatch(getManualLaunchFoldersAction({ launchId }));
        dispatch(getManualLaunchAction({ launchId }));
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
      launchId,
      showSpinner,
      hideSpinner,
      dispatch,
      onSuccess,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { batchDelete, isLoading };
};
