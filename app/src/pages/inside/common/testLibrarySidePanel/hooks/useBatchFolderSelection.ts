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

import { useCallback, useRef, RefObject } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { useSelector } from 'react-redux';

import { foldersSelector, TransformedFolder } from 'controllers/testCase';
import { getAllSubfolderIds } from 'common/utils/folderUtils';

import { FolderTestCases, NumberSet, SetState } from '../testLibraryPanelContext';
import {
  getAllAddedLeafFolderIds,
  getEmptyLeafFolderIds,
  getSelectableIdsForFolders,
  partitionFoldersByCache,
  addToSet,
  removeFromSet,
} from '../utils';

import { useFetchAndCacheTestCases } from './useFetchAndCacheTestCases';

interface UseBatchFolderSelectionProps {
  isOpenRef: RefObject<boolean>;
  testPlanId: number | null;
  testCasesMap: Map<number, FolderTestCases>;
  setTestCasesMap: SetState<Map<number, FolderTestCases>>;
  setSelectedTestCasesIds: SetState<NumberSet>;
  setSelectedFolderIds: SetState<NumberSet>;
  setBatchLoadingFolderIds: SetState<NumberSet>;
}

export const useBatchFolderSelection = ({
  isOpenRef,
  testPlanId,
  testCasesMap,
  setTestCasesMap,
  setSelectedTestCasesIds,
  setSelectedFolderIds,
  setBatchLoadingFolderIds,
}: UseBatchFolderSelectionProps) => {
  const flatFolders = useSelector(foldersSelector);
  const testCasesMapRef = useRef(testCasesMap);
  testCasesMapRef.current = testCasesMap;

  const fetchAndCache = useFetchAndCacheTestCases({
    testPlanId,
    setTestCasesMap,
  });

  const getSelectionState = useCallback(
    (folder: TransformedFolder) => {
      const allSubfolderIds = getAllSubfolderIds(folder.id, flatFolders);
      const foldersWithTestCases = new Set(
        flatFolders
          .filter((flatFolder) => (flatFolder.countOfTestCases ?? 0) > 0)
          .map(({ id }) => id),
      );
      const subfolderIdsWithTestCases = allSubfolderIds.filter((id) =>
        foldersWithTestCases.has(id),
      );

      const { cachedFolderIds, uncachedFolderIds } = partitionFoldersByCache(
        subfolderIdsWithTestCases,
        testCasesMapRef.current,
      );

      const cachedIds = getSelectableIdsForFolders(cachedFolderIds, testCasesMapRef.current);

      return {
        cachedIds,
        uncachedFolderIds,
      };
    },
    [flatFolders],
  );

  const getFolderTestCaseIds = useCallback(
    async (folder: TransformedFolder): Promise<number[]> => {
      const { cachedIds, uncachedFolderIds } = getSelectionState(folder);

      if (isEmpty(uncachedFolderIds)) {
        return cachedIds;
      }

      addToSet({ setter: setBatchLoadingFolderIds, ids: [folder.id] });

      try {
        const { selectableIds: fetchedIds } = await fetchAndCache(uncachedFolderIds);

        return [...cachedIds, ...fetchedIds];
      } finally {
        removeFromSet({ setter: setBatchLoadingFolderIds, ids: [folder.id] });
      }
    },
    [fetchAndCache, getSelectionState, setBatchLoadingFolderIds],
  );

  const batchSelectFolder = useCallback(
    async (folder: TransformedFolder) => {
      const { cachedIds, uncachedFolderIds } = getSelectionState(folder);
      const emptyLeafIds = getEmptyLeafFolderIds(folder);

      if (isEmpty(uncachedFolderIds)) {
        const allAddedLeafIds = getAllAddedLeafFolderIds(folder, testCasesMapRef.current);

        addToSet({ setter: setSelectedTestCasesIds, ids: cachedIds });
        addToSet({ setter: setSelectedFolderIds, ids: [...emptyLeafIds, ...allAddedLeafIds] });

        return;
      }

      addToSet({ setter: setBatchLoadingFolderIds, ids: [folder.id] });

      try {
        const { selectableIds: fetchedIds, newCacheEntries } =
          await fetchAndCache(uncachedFolderIds);

        if (!isOpenRef.current) {
          return;
        }

        const allAddedLeafIds = getAllAddedLeafFolderIds(
          folder,
          new Map([...testCasesMapRef.current, ...newCacheEntries]),
        );

        addToSet({ setter: setSelectedTestCasesIds, ids: [...cachedIds, ...fetchedIds] });
        addToSet({ setter: setSelectedFolderIds, ids: [...emptyLeafIds, ...allAddedLeafIds] });
      } finally {
        removeFromSet({ setter: setBatchLoadingFolderIds, ids: [folder.id] });
      }
    },
    [
      isOpenRef,
      fetchAndCache,
      getSelectionState,
      setSelectedTestCasesIds,
      setSelectedFolderIds,
      setBatchLoadingFolderIds,
    ],
  );

  const batchDeselectFolder = useCallback(
    (folder: TransformedFolder) => {
      const folderIds = getAllSubfolderIds(folder.id, flatFolders);

      removeFromSet({
        setter: setSelectedTestCasesIds,
        ids: getSelectableIdsForFolders(folderIds, testCasesMapRef.current),
      });
      removeFromSet({
        setter: setSelectedFolderIds,
        ids: [
          ...getEmptyLeafFolderIds(folder),
          ...getAllAddedLeafFolderIds(folder, testCasesMapRef.current),
        ],
      });
    },
    [flatFolders, setSelectedTestCasesIds, setSelectedFolderIds],
  );

  return {
    batchSelectFolder,
    batchDeselectFolder,
    getFolderTestCaseIds,
  };
};
