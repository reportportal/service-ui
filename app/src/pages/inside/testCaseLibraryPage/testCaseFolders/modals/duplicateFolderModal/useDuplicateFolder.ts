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
import { isNil } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction } from 'controllers/fetch';
import { projectKeySelector } from 'controllers/project';
import { NAMESPACE } from 'controllers/testCase/constants';
import { foldersSelector } from 'controllers/testCase';
import { Folder } from 'controllers/testCase/types';
import { fetchAllFolders } from 'controllers/testCase/utils/fetchAllFolders';

import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';
import { useFolderOperationUI } from '../../../hooks/useFolderOperationUI';
import { getFolderNames } from '../../../utils/getFolderNames';

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
  const allFolders = useSelector(foldersSelector);
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
      } catch {
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        });
        handleOperationError({ fromDragDrop: isDragDropOperation });

        return;
      }

      try {
        const updatedFolders = await fetchAllFolders({ projectKey });

        dispatch(fetchSuccessAction(NAMESPACE, { content: updatedFolders }));
      } catch {
        handleOperationError({ fromDragDrop: isDragDropOperation });

        return;
      }

      const { folderName: originalFolderName, targetFolderName } = getFolderNames(
        allFolders,
        folderId,
        duplicatedFolder.parentFolderId,
      );

      handleOperationSuccess({
        fromDragDrop: isDragDropOperation,
        skipFolderRefresh: true,
        successMessageId: 'testCaseFolderDuplicatedSuccess',
        messageValues: {
          folderName: originalFolderName,
          targetFolderName,
        },
      });

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
      navigateToFolderAfterAction,
      showErrorNotification,
      allFolders,
    ],
  );

  return { duplicateFolder, isLoading };
};
