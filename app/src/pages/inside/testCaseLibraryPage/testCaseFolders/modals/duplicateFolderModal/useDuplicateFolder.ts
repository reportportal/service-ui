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
import { isEmpty, isNil, isUndefined } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { createFoldersBatchSuccessAction } from 'controllers/testCase/actionCreators';
import { Folder } from 'controllers/testCase/types';
import { fetchAllFolders } from 'controllers/testCase/utils/fetchAllFolders';

import { useFolderActions } from '../../../hooks/useFolderActions';
import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';
import { useFolderOperationUI } from '../../../hooks/useFolderOperationUI';
import type { MoveFolderResponse } from '../moveFolderModal/types';

export const useDuplicateFolder = () => {
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
  const { navigateToFolderAfterAction } = useNavigateToFolder();

  const duplicateFolder = useCallback(
    async ({
      folderId,
      folderName,
      parentFolderId,
      index,
      fromDragDrop,
    }: {
      folderId: number;
      folderName: string;
      parentFolderId?: number | null;
      index?: number;
      fromDragDrop?: boolean;
    }) => {
      const isDragDropOperation = Boolean(fromDragDrop);
      handleOperationStart({ fromDragDrop: isDragDropOperation });

      let duplicatedFolder: Folder;

      try {
        const data: { name: string; parentTestFolderId?: number; index?: number } = {
          name: folderName,
          index,
        };

        if (!isNil(parentFolderId)) {
          data.parentTestFolderId = parentFolderId;
        }

        duplicatedFolder = await fetch<Folder>(URLS.testFolderDuplicate(projectKey, folderId), {
          method: 'POST',
          data,
        });

        // TODO Backend doesn't support index in duplicate API, need to move folder to correct position - change this when backend is fixed
        if (isDragDropOperation && !isUndefined(index)) {
          try {
            let moveData: { parentTestFolder?: object; parentTestFolderId?: number; index: number };
            if (parentFolderId === null) {
              moveData = { parentTestFolder: {}, index };
            } else if (!isUndefined(parentFolderId)) {
              moveData = { parentTestFolderId: parentFolderId, index };
            } else {
              moveData = { index };
            }

            const moveResponse = await fetch<MoveFolderResponse>(
              URLS.folder(projectKey, duplicatedFolder.id),
              {
                method: 'PATCH',
                data: moveData,
              },
            );

            // Update duplicatedFolder with correct index from move response
            duplicatedFolder.index = moveResponse.index;
          } catch {
            // TODO Continue anyway, folder is created even if position is wrong - delete this when backend is fixed
          }
        }
      } catch {
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        });
        handleOperationError({ fromDragDrop: isDragDropOperation });

        return;
      }

      createNewStoreFolder({
        id: duplicatedFolder.id,
        folderName: duplicatedFolder.name,
        parentFolderId: duplicatedFolder.parentFolderId,
        countOfTestCases: duplicatedFolder.countOfTestCases,
        index: duplicatedFolder.index,
      });

      handleOperationSuccess({
        fromDragDrop: isDragDropOperation,
        successMessageId: 'testCaseFolderDuplicatedSuccess',
      });

      try {
        const subfolders = await fetchAllFolders({
          projectKey,
          filters: { 'filter.eq.parentId': duplicatedFolder.id },
        });

        if (!isEmpty(subfolders)) {
          dispatch(createFoldersBatchSuccessAction(subfolders));
        }
      } catch {
        handleOperationError({ fromDragDrop: isDragDropOperation });
      }

      navigateToFolderAfterAction({
        targetFolderId: duplicatedFolder.id,
        newFolderDetails: {
          name: duplicatedFolder.name,
          parentTestFolderId: duplicatedFolder.parentFolderId,
        },
      });
    },
    [
      projectKey,
      dispatch,
      handleOperationStart,
      handleOperationSuccess,
      handleOperationError,
      createNewStoreFolder,
      navigateToFolderAfterAction,
      showErrorNotification,
    ],
  );

  return { duplicateFolder, isLoading };
};
