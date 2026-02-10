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
import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { getManualLaunchesAction } from 'controllers/manualLaunch';

interface UseBatchDeleteManualLaunchesOptions {
  onSuccess: VoidFn;
}

export const useBatchDeleteManualLaunches = ({
  onSuccess,
}: UseBatchDeleteManualLaunchesOptions) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const batchDelete = useCallback(
    async (launchIds: number[]) => {
      showSpinner();

      try {
        await fetch(URLS.batchDeleteManualLaunches(projectKey), {
          method: 'DELETE',
          data: { launchIds },
        });

        dispatch(getManualLaunchesAction());
        onSuccess();

        dispatch(
          showSuccessNotification({
            messageId: 'manualLaunchesBatchDeletedSuccess',
            values: { count: launchIds.length },
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
    [projectKey, showSpinner, hideSpinner, onSuccess, dispatch],
  );

  return { batchDelete, isLoading };
};
