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
import { useDispatch } from 'react-redux';
import { useDebouncedSpinner } from 'common/hooks';
import { useNotification, type NotificationMessageKey } from 'common/hooks/useNotification';
import { hideModalAction } from 'controllers/modal';
import { getFoldersAction } from 'controllers/testCase/actionCreators';

interface UseFolderOperationUIParams {
  fromDragDrop: boolean;
  successMessageId?: NotificationMessageKey;
}

export const useFolderOperationUI = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const handleOperationStart = useCallback(
    ({ fromDragDrop }: UseFolderOperationUIParams) => {
      if (!fromDragDrop) {
        showSpinner();
      }
    },
    [showSpinner],
  );

  const handleOperationSuccess = useCallback(
    ({ fromDragDrop, successMessageId }: UseFolderOperationUIParams) => {
      if (fromDragDrop) {
        // Silent refresh when triggered from drag-and-drop
        dispatch(getFoldersAction({ silent: true }));
      } else {
        // Show UI feedback when triggered from menu/modal
        dispatch(hideModalAction());
        if (successMessageId) {
          showSuccessNotification({ messageId: successMessageId });
        }
        hideSpinner();
      }
    },
    [dispatch, showSuccessNotification, hideSpinner],
  );

  const handleOperationError = useCallback(
    ({ fromDragDrop }: UseFolderOperationUIParams) => {
      if (!fromDragDrop) {
        hideSpinner();
      }
    },
    [hideSpinner],
  );

  return {
    isLoading,
    handleOperationStart,
    handleOperationSuccess,
    handleOperationError,
    showErrorNotification,
  };
};
