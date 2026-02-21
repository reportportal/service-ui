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
import { moveFolderSuccessAction } from 'controllers/testCase/actionCreators';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

import { useFolderActions } from '../../../hooks/useFolderActions';
import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';
import { useFolderOperationUI } from '../../../hooks/useFolderOperationUI';
import { processFolderDestination } from '../../../utils/processFolderDestination';
import { MoveFolderApiParams, MoveFolderResponse } from './types';

export const useMoveFolder = () => {
  const {
    isLoading,
    handleOperationStart,
    handleOperationSuccess,
    handleOperationError,
    showErrorNotification,
  } = useFolderOperationUI();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { createNewStoreFolder } = useFolderActions();
  const { navigateToFolder, navigateToFolderAfterAction, expandFoldersToLevel } =
    useNavigateToFolder();

  const moveFolder = useCallback(
    async ({
      folderId,
      parentTestFolderId,
      parentTestFolder,
      index,
      fromDragDrop,
    }: MoveFolderApiParams) => {
      const isDragDropOperation = Boolean(fromDragDrop);
      handleOperationStart({ fromDragDrop: isDragDropOperation });

      try {
        let data;
        if (parentTestFolder) {
          data = { parentTestFolder, index };
        } else if (parentTestFolderId === null) {
          data = { parentTestFolder: {}, index };
        } else {
          data = { parentTestFolderId, index };
        }

        const response = await fetch<MoveFolderResponse>(URLS.folder(projectKey, folderId), {
          method: 'PATCH',
          data,
        });

        const movedFolderParentId = response.parentFolderId ?? null;

        const { targetFolderId, newFolderDetails, isNewFolder } = processFolderDestination({
          destination: { parentTestFolder, parentTestFolderId },
          responseFolderId: parentTestFolder?.name ? movedFolderParentId : response.id,
        });

        if (isNewFolder && newFolderDetails) {
          createNewStoreFolder({
            id: targetFolderId,
            folderName: newFolderDetails.name,
            parentFolderId: newFolderDetails.parentTestFolderId,
          });
        }

        dispatch(
          moveFolderSuccessAction({
            folderId,
            parentTestFolderId: movedFolderParentId,
            index: response.index,
          }),
        );

        handleOperationSuccess({
          fromDragDrop: isDragDropOperation,
          successMessageId: 'testCaseFolderMovedSuccess',
        });

        if (isNewFolder && newFolderDetails) {
          navigateToFolderAfterAction({
            targetFolderId,
            newFolderDetails,
          });
          expandFoldersToLevel(targetFolderId);
        } else {
          navigateToFolder({
            folderId,
            parentIdToExpand: movedFolderParentId,
          });
        }
      } catch (error) {
        console.error('❌ Move folder failed:', error);
        showErrorNotification({ messageId: 'testCaseFolderMoveFailed' });
        handleOperationError({ fromDragDrop: isDragDropOperation });
      }
    },
    [
      projectKey,
      dispatch,
      handleOperationStart,
      handleOperationSuccess,
      handleOperationError,
      showErrorNotification,
      createNewStoreFolder,
      navigateToFolderAfterAction,
      expandFoldersToLevel,
      navigateToFolder,
    ],
  );

  return { moveFolder, isLoading };
};
