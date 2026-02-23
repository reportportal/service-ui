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

import { createFoldersSuccessAction } from 'controllers/testCase/actionCreators';
import { FolderWithFullPath } from 'controllers/testCase';

import { NewFolderData } from '../utils/getFolderFromFormValues';
import { FolderDestination } from '../utils/getFolderDestinationFromFormValues';
import { processFolderDestination } from '../utils/processFolderDestination';
import { useNavigateToFolder } from './useNavigateToFolder';
import { useFolderCounterUpdate } from './useFolderCounterUpdate';

export const useFolderActions = () => {
  const dispatch = useDispatch();
  const { navigateToFolderAfterAction } = useNavigateToFolder();
  const { updateFolderCounter, updateFolderCounters } = useFolderCounterUpdate();

  const createNewStoreFolder = useCallback(
    ({
      id,
      folderName,
      parentFolderId,
      countOfTestCases = 0,
      index,
    }: {
      id: number;
      folderName: string;
      parentFolderId?: number | null;
      countOfTestCases?: number;
      index?: number;
    }) => {
      dispatch(
        createFoldersSuccessAction({
          id,
          name: folderName,
          parentFolderId: parentFolderId ?? null,
          countOfTestCases,
          index,
        }),
      );
    },
    [dispatch],
  );

  const processFolderDestinationAndComplete = useCallback(
    ({
      destination,
      responseFolderId,
      sourceFolderId,
      testCaseCount = 1,
    }: {
      destination: FolderDestination | NewFolderData | FolderWithFullPath;
      responseFolderId?: number;
      sourceFolderId?: number;
      testCaseCount?: number;
    }) => {
      const { targetFolderId, newFolderDetails, isNewFolder } = processFolderDestination({
        destination,
        responseFolderId,
      });

      const isCreatingNewFolder = isNewFolder && Boolean(newFolderDetails);
      const isMovingTestCases = Boolean(sourceFolderId && testCaseCount);

      if (isCreatingNewFolder) {
        createNewStoreFolder({
          id: targetFolderId,
          folderName: newFolderDetails.name,
          parentFolderId: newFolderDetails.parentTestFolderId,
          countOfTestCases: testCaseCount,
        });

        if (isMovingTestCases) {
          updateFolderCounter({
            folderId: sourceFolderId,
            delta: -testCaseCount,
          });
        }
      } else {
        updateFolderCounters({
          sourceFolderId,
          targetFolderId,
          testCaseCount,
        });
      }

      navigateToFolderAfterAction({
        targetFolderId,
        newFolderDetails,
      });
    },
    [navigateToFolderAfterAction, createNewStoreFolder, updateFolderCounter, updateFolderCounters],
  );

  return {
    createNewStoreFolder,
    processFolderDestinationAndComplete,
  };
};
