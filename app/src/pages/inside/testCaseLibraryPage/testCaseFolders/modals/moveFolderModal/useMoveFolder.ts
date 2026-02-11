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

import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  moveFolderSuccessAction,
  createFoldersSuccessAction,
} from 'controllers/testCase/actionCreators';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner } from 'common/hooks/useDebouncedSpinner';

import { useNavigateToFolder } from '../../../hooks/useNavigateToFolder';
import { FolderDestination } from '../../../utils/getFolderDestinationFromFormValues';

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
  const { navigateToFolder } = useNavigateToFolder();

  const moveFolder = useCallback(
    async ({ folderId, parentTestFolderId, parentTestFolder }: MoveFolderApiParams) => {
      showSpinner();

      try {
        const response = await fetch<MoveFolderResponse>(URLS.folder(projectKey, folderId), {
          method: 'PATCH',
          data: parentTestFolder ? { parentTestFolder } : { parentTestFolderId },
        });
        const movedFolderParentId = response.parentFolderId ?? null;

        if (parentTestFolder?.name) {
          dispatch(
            createFoldersSuccessAction({
              id: movedFolderParentId,
              name: parentTestFolder.name,
              parentFolderId: parentTestFolder.parentTestFolderId ?? null,
              countOfTestCases: 0,
            }),
          );
          dispatch(
            moveFolderSuccessAction({
              folderId,
              parentTestFolderId: movedFolderParentId,
            }),
          );
        } else {
          dispatch(
            moveFolderSuccessAction({
              folderId,
              parentTestFolderId: movedFolderParentId,
            }),
          );
        }

        dispatch(hideModalAction());
        dispatch(showSuccessNotification({ messageId: 'testCaseFolderMovedSuccess' }));

        const targetFolderId = parentTestFolder?.name ? movedFolderParentId : response.id;
        const expandToParentId = parentTestFolder?.name
          ? parentTestFolder.parentTestFolderId
          : response.parentFolderId;

        navigateToFolder({ folderId: targetFolderId, parentIdToExpand: expandToParentId });
      } catch {
        dispatch(showErrorNotification({ messageId: 'testCaseFolderMoveFailed' }));
      } finally {
        hideSpinner();
      }
    },
    [showSpinner, projectKey, dispatch, hideSpinner, navigateToFolder],
  );

  return { moveFolder, isLoading };
};
