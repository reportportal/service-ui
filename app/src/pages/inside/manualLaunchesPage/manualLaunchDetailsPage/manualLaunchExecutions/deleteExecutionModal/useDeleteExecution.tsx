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
import { useDispatch, useSelector, useStore } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  buildGetManualLaunchTestCaseExecutionsParams,
  getManualLaunchTestCaseExecutionsAction,
  getManualLaunchFoldersAction,
  getManualLaunchAction,
  getManualLaunchDetailsFetchParams,
} from 'controllers/manualLaunch';

import type { DeleteExecutionModalData } from './types';

export const useDeleteExecution = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const store = useStore();
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const deleteExecutions = useCallback(
    async (payload: DeleteExecutionModalData) => {
      showSpinner();

      try {
        if (payload.type === 'single') {
          await fetch(
            URLS.deleteExecutionFromLaunch(projectKey, payload.launchId, payload.execution.id),
            { method: 'delete' },
          );
          showSuccessNotification({ messageId: 'executionDeletedSuccess' });
        } else {
          await fetch(URLS.batchDeleteExecutionsFromLaunch(projectKey, payload.launchId), {
            method: 'DELETE',
            data: { executionIds: payload.executionIds },
          });
          showSuccessNotification({
            messageId:
              payload.executionIds.length > 1 ? 'executionsDeletedSuccess' : 'executionDeletedSuccess',
          });
          payload.onClearSelection?.();
        }

        const params = getManualLaunchDetailsFetchParams(store.getState());
        const executionsParams = buildGetManualLaunchTestCaseExecutionsParams(
          params,
          payload.launchId,
        );

        dispatch(hideModalAction());
        if (executionsParams) {
          dispatch(getManualLaunchTestCaseExecutionsAction(executionsParams));
        }
        dispatch(
          getManualLaunchFoldersAction({
            launchId: payload.launchId,
            offset: 0,
            limit: 100,
            ...(params.filterPriorities && { filterPriorities: params.filterPriorities }),
            ...(params.filterTags && { filterTags: params.filterTags }),
          }),
        );
        dispatch(getManualLaunchAction({ launchId: payload.launchId }));
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
      dispatch,
      store,
      showSpinner,
      hideSpinner,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { isLoading, deleteExecutions };
};
