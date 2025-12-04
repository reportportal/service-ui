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
  setActiveFolderId,
  getTestCaseByFolderIdAction,
  getAllTestCasesAction,
  moveFolderSuccessAction,
  createFoldersSuccessAction,
} from 'controllers/testCase/actionCreators';
import { testCasesPageSelector } from 'controllers/testCase';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks/useDebouncedSpinner';
import { URLS } from 'common/urls';
import { urlFolderIdSelector } from 'controllers/pages';

import { getTestCaseRequestParams } from '../../../utils';

interface MoveFolderApiParams {
  folderId: number;
  parentTestFolderId?: number;
  parentTestFolder?: {
    name: string;
    parentTestFolderId?: number;
  };
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
  const currentFolderId = useSelector(urlFolderIdSelector);
  const testCasesPageData = useSelector(testCasesPageSelector);

  const moveFolder = useCallback(
    async ({ folderId, parentTestFolderId, parentTestFolder }: MoveFolderApiParams) => {
      showSpinner();

      try {
        const response = await fetch<MoveFolderResponse>(URLS.folder(projectKey, folderId), {
          method: 'PATCH',
          data: parentTestFolder ? { parentTestFolder } : { parentTestFolderId },
        });

        const newParentFolderId = response.parentFolderId;

        if (parentTestFolder) {
          dispatch(
            createFoldersSuccessAction({
              id: newParentFolderId,
              name: parentTestFolder.name,
              parentFolderId: parentTestFolder.parentTestFolderId ?? null,
              countOfTestCases: 0,
            }),
          );

          dispatch(
            moveFolderSuccessAction({
              folderId,
              parentTestFolderId: newParentFolderId,
            }),
          );
        } else {
          dispatch(
            moveFolderSuccessAction({
              folderId,
              parentTestFolderId: newParentFolderId,
            }),
          );
        }

        dispatch(hideModalAction());
        dispatch(showSuccessNotification({ messageId: 'testCaseFolderMovedSuccess' }));

        const isViewingMovedFolder = Number(currentFolderId) === folderId;

        if (isViewingMovedFolder) {
          const paginationParams = getTestCaseRequestParams(testCasesPageData);

          if (newParentFolderId) {
            dispatch(setActiveFolderId({ activeFolderId: newParentFolderId }));
            dispatch(
              getTestCaseByFolderIdAction({
                folderId: newParentFolderId,
                ...paginationParams,
              }),
            );
          } else {
            dispatch(setActiveFolderId({ activeFolderId: null }));
            dispatch(getAllTestCasesAction(paginationParams));
          }
        }
      } catch {
        dispatch(
          showErrorNotification({
            messageId: 'testCaseFolderMoveFailed',
          }),
        );
      } finally {
        hideSpinner();
      }
    },
    [projectKey, dispatch, showSpinner, hideSpinner, currentFolderId, testCasesPageData],
  );

  return { moveFolder, isLoading };
};
