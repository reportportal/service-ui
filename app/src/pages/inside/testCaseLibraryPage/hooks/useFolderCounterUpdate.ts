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

import {
  updateFolderCounterAction,
  updateFolderCountersAction,
} from 'controllers/testCase/actionCreators';

const addDelta = (folderDeltas: Record<number, number>, folderId: number, delta: number) => {
  folderDeltas[folderId] = (folderDeltas[folderId] ?? 0) + delta;
};

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
      const folderDeltas: Record<number, number> = {};

      forOwn(folderDeltasMap, (delta, folderId) => {
        addDelta(folderDeltas, Number(folderId), isRemoval ? -delta : delta);
      });

      // One action for all folders: every counter change rebuilds the folder tree selectors.
      dispatch(updateFolderCountersAction(folderDeltas));
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
      const folderDeltas: Record<number, number> = {};

      if (folderDeltasMap) {
        forOwn(folderDeltasMap, (delta, folderId) => {
          addDelta(folderDeltas, Number(folderId), delta);
        });
      } else if (sourceFolderId) {
        addDelta(folderDeltas, sourceFolderId, -testCaseCount);
      }

      addDelta(folderDeltas, targetFolderId, testCaseCount);
      dispatch(updateFolderCountersAction(folderDeltas));
    },
    [dispatch],
  );

  return {
    updateFolderCounter,
    batchFolderCounterUpdate,
    updateFolderCounters,
  };
};
