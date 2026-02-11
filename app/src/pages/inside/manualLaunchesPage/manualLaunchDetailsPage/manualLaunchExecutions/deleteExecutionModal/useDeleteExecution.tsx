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

import { useDispatch, useSelector } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  getManualLaunchTestCaseExecutionsAction,
  getManualLaunchFoldersAction,
  getManualLaunchAction,
} from 'controllers/manualLaunch';

export const useDeleteExecution = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const deleteExecution = async (launchId: string | number, executionId: number) => {
    try {
      showSpinner();

      const deleteUrl = URLS.deleteExecutionFromLaunch(projectKey, launchId, executionId);
      await fetch(deleteUrl, {
        method: 'delete',
      });

      dispatch(hideModalAction());
      showSuccessNotification({ messageId: 'executionDeletedSuccess' });

      dispatch(getManualLaunchTestCaseExecutionsAction({ launchId }));
      dispatch(getManualLaunchFoldersAction({ launchId }));
      dispatch(getManualLaunchAction({ launchId }));
    } catch (error: unknown) {
      showErrorNotification({
        message: (error as Error).message,
      });
    } finally {
      hideSpinner();
    }
  };

  return { isLoading, deleteExecution };
};
