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
import { forOwn } from 'es-toolkit/compat';

import { updateFolderCounterAction } from 'controllers/testCase/actionCreators';

export const useFolderCounterUpdate = () => {
  const dispatch = useDispatch();

  const updateFolderCounter = useCallback(
    ({ folderId, delta }: { folderId: number; delta: number }) => {
      dispatch(updateFolderCounterAction({ folderId, delta }));
    },
    [dispatch],
  );

  const batchFolderCounterUpdate = useCallback(
    ({
      folderDeltasMap,
      isRemoval = false,
    }: {
      folderDeltasMap: Record<string, number> | Record<number, number>;
      isRemoval?: boolean;
    }) => {
      forOwn(folderDeltasMap, (delta, folderId) => {
        dispatch(
          updateFolderCounterAction({
            folderId: Number(folderId),
            delta: isRemoval ? -delta : delta,
          }),
        );
      });
    },
    [dispatch],
  );

  const updateFolderCounters = useCallback(
    ({
      sourceFolderId,
      targetFolderId,
      testCaseCount,
      folderDeltasMap,
    }: {
      targetFolderId: number;
      testCaseCount: number;
      sourceFolderId?: number;
      folderDeltasMap?: Record<number, number>;
    }) => {
      if (folderDeltasMap) {
        batchFolderCounterUpdate({ folderDeltasMap });
      } else if (sourceFolderId) {
        updateFolderCounter({
          folderId: sourceFolderId,
          delta: -testCaseCount,
        });
      }

      updateFolderCounter({ folderId: targetFolderId, delta: testCaseCount });
    },
    [updateFolderCounter, batchFolderCounterUpdate],
  );

  return {
    updateFolderCounter,
    batchFolderCounterUpdate,
    updateFolderCounters,
  };
};
