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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { locationQuerySelector } from 'controllers/pages';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { getManualLaunchesAction, defaultManualLaunchesQueryParams } from 'controllers/manualLaunch';

import { DeleteManualLaunchModalData } from './deleteManualLaunchModal';

interface UseDeleteManualLaunchesOptions {
  onSuccess?: VoidFn;
  data: DeleteManualLaunchModalData;
}

export const useDeleteManualLaunches = ({ onSuccess, data }: UseDeleteManualLaunchesOptions) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const query = useSelector(locationQuerySelector);

  const handleLimitOffset = useCallback(() => {
    const limit = Number(query?.limit) || defaultManualLaunchesQueryParams.limit;
    const offset = Number(query?.offset) || defaultManualLaunchesQueryParams.offset;

    const isBatchDelete = data.type !== 'single';
    const deletedCount = isBatchDelete ? data.launchIds.length : 1;

    const nextOffset =
      deletedCount >= limit && offset > 0
        ? Math.max(offset - limit, 0)
        : offset;

    return {
      offset: nextOffset,
      limit,
    };
  }, [query]);

  const deleteLaunches = useCallback(
    async (data: DeleteManualLaunchModalData) => {
      showSpinner();

      try {
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
          await fetch(URLS.manualLaunch(projectKey), {
            method: 'DELETE',
            data: { launchIds: data.launchIds },
          });

          dispatch(
            showSuccessNotification({
              messageId: 'manualLaunchesBatchDeletedSuccess',
              values: { count: data.launchIds.length },
            }),
          );

          data.onClearSelection?.();
        }

        dispatch(hideModalAction());
        dispatch(
          getManualLaunchesAction(handleLimitOffset()),
        );
        onSuccess?.();
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
    [projectKey, query, showSpinner, hideSpinner, onSuccess, dispatch],
  );

  return { isLoading, deleteLaunches };
};
