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
import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { readBatchResult } from 'common/utils/apiResponse';
import { useDebouncedSpinner } from 'common/hooks';
import {
  apiErrorNotificationAction,
  batchPartialFailureNotificationAction,
  getBatchFailedIds,
} from 'common/manualLaunches/batchResultNotifications';
import { projectKeySelector } from 'controllers/project';
import { updatePagePropertiesAction } from 'controllers/pages';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification } from 'controllers/notification';
import {
  getManualLaunchesAction,
  getManualLaunchesFetchParams,
  manualLaunchContentSelector,
} from 'controllers/manualLaunch';
import { AppState } from 'types/store';

import { DeleteManualLaunchModalData } from './types';

interface UseDeleteManualLaunchesOptions {
  onSuccess?: VoidFn;
  data: DeleteManualLaunchModalData;
}

export const useDeleteManualLaunches = ({ onSuccess }: UseDeleteManualLaunchesOptions) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const store = useStore<AppState>();

  const refetchLaunches = useCallback(
    (deletedCount: number) => {
      const state = store.getState();
      const params = getManualLaunchesFetchParams(state);
      const offset = Number(params.offset) || 0;
      const limit = Number(params.limit);
      const pageItemsCount = manualLaunchContentSelector(state)?.length ?? 0;

      // The whole page was deleted: step back a page through the URL, the route reloads the list.
      if (offset > 0 && deletedCount >= pageItemsCount) {
        dispatch(updatePagePropertiesAction({ offset: Math.max(offset - limit, 0), limit }));
        return;
      }

      dispatch(getManualLaunchesAction(params));
    },
    [store, dispatch],
  );

  const deleteLaunches = useCallback(
    async (data: DeleteManualLaunchModalData) => {
      showSpinner();

      try {
        let deletedCount = 1;

        if (data.type === 'single') {
          await fetch(URLS.manualLaunchById(projectKey, data.id), {
            method: 'DELETE',
          });

          dispatch(
            showSuccessNotification({
              messageId: 'manualLaunchDeletedSuccess',
              values: { name: data.name },
            }),
          );
        } else {
          const response = await fetch(URLS.manualLaunch(projectKey), {
            method: 'DELETE',
            data: { launchIds: data.launchIds },
          });
          const result = readBatchResult(response, data.launchIds.length);

          deletedCount = result.successCount;

          if (result.failureCount > 0) {
            // Keep the launches that were not deleted selected so the user can see and retry them.
            const failedIds = getBatchFailedIds(result);

            dispatch(batchPartialFailureNotificationAction(result));
            data.onKeepSelection?.(failedIds.length ? failedIds : data.launchIds);
          } else {
            dispatch(
              showSuccessNotification({
                messageId: 'manualLaunchesBatchDeletedSuccess',
                values: { count: data.launchIds.length },
              }),
            );

            data.onClearSelection?.();
          }
        }

        dispatch(hideModalAction());
        refetchLaunches(deletedCount);
        onSuccess?.();
      } catch (error) {
        dispatch(apiErrorNotificationAction(error));
      } finally {
        hideSpinner();
      }
    },
    [showSpinner, dispatch, refetchLaunches, onSuccess, projectKey, hideSpinner],
  );

  return { isLoading, deleteLaunches };
};
