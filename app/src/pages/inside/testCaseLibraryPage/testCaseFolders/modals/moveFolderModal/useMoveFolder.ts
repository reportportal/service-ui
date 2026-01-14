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

import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { moveFolderSuccessAction } from 'controllers/testCase/actionCreators';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';

import { useFolderActions } from '../../../hooks/useFolderActions';
import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';
import { FolderDestination } from '../../../utils/getFolderDestinationFromFormValues';
import { processFolderDestination } from '../../../utils/processFolderDestination';

interface MoveFolderApiParams extends FolderDestination {
  folderId: number;
}

interface MoveFolderResponse {
  id: number;
  name: string;
  parentFolderId: number;
}

export const useMoveFolder = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { createNewStoreFolder } = useFolderActions();
  const { navigateToFolder } = useNavigateToFolder();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const moveFolder = useCallback(
    async ({ folderId, parentTestFolderId, parentTestFolder }: MoveFolderApiParams) => {
      showSpinner();

      try {
        const response = await fetch<MoveFolderResponse>(URLS.folder(projectKey, folderId), {
          method: 'PATCH',
          data: parentTestFolder ? { parentTestFolder } : { parentTestFolderId },
        });
        const movedFolderParentId = response.parentFolderId ?? null;

        const { targetFolderId, newFolderDetails, isNewFolder } = processFolderDestination({
          destination: { parentTestFolder, parentTestFolderId },
          responseFolderId: parentTestFolder?.name ? movedFolderParentId : response.id,
        });

        if (isNewFolder && newFolderDetails) {
          createNewStoreFolder({
            targetFolderId,
            folderName: newFolderDetails.name,
            parentFolderId: newFolderDetails.parentTestFolderId,
          });
        }

        dispatch(
          moveFolderSuccessAction({
            folderId,
            parentTestFolderId: movedFolderParentId,
          }),
        );

        dispatch(hideModalAction());
        showSuccessNotification({ messageKey: 'testCaseFolderMovedSuccess' });

        navigateToFolder({
          folderId,
          parentIdToExpand: movedFolderParentId,
        });
      } catch {
        showErrorNotification({ messageKey: 'testCaseFolderMoveFailed' });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      projectKey,
      dispatch,
      navigateToFolder,
      createNewStoreFolder,
      hideSpinner,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { moveFolder, isLoading };
};
