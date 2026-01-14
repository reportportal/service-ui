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
import { isEmpty } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { createFoldersBatchSuccessAction } from 'controllers/testCase/actionCreators';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { Folder } from 'controllers/testCase/types';
import { fetchAllFolders } from 'controllers/testCase/utils/fetchAllFolders';

import { useFolderActions } from '../../../hooks/useFolderActions';
import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';

export const useDuplicateFolder = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { createNewStoreFolder } = useFolderActions();
  const { navigateToFolderAfterAction } = useNavigateToFolder();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const duplicateFolder = useCallback(
    async ({
      folderId,
      folderName,
      parentFolderId,
    }: {
      folderId: number;
      folderName: string;
      parentFolderId?: number;
    }) => {
      showSpinner();

      let duplicatedFolder: Folder;

      try {
        duplicatedFolder = await fetch<Folder>(URLS.testFolderDuplicate(projectKey, folderId), {
          method: 'POST',
          data: {
            name: folderName,
            ...(parentFolderId ? { parentTestFolderId: parentFolderId } : {}),
          },
        });
      } catch {
        showErrorNotification({
          messageKey: 'errorOccurredTryAgain',
        });
        hideSpinner();

        return;
      }

      createNewStoreFolder({
        targetFolderId: duplicatedFolder.id,
        folderName: duplicatedFolder.name,
        parentFolderId: duplicatedFolder.parentFolderId,
        countOfTestCases: duplicatedFolder.countOfTestCases,
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
        hideSpinner();
      }

      dispatch(hideModalAction());
      showSuccessNotification({ messageKey: 'testCaseFolderDuplicatedSuccess' });

      navigateToFolderAfterAction({
        targetFolderId: duplicatedFolder.id,
        newFolderDetails: {
          name: duplicatedFolder.name,
          parentTestFolderId: duplicatedFolder.parentFolderId,
        },
      });

      hideSpinner();
    },
    [
      projectKey,
      dispatch,
      showSpinner,
      hideSpinner,
      createNewStoreFolder,
      navigateToFolderAfterAction,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return { duplicateFolder, isLoading };
};
