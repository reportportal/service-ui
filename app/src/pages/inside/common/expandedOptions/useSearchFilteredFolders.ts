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

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import {
  TransformedFolder,
  foldersSelector,
  filteredFoldersSelector,
  isLoadingFilteredFoldersSelector,
  getFilteredFoldersAction,
  clearFilteredFoldersAction,
} from 'controllers/testCase';
import { transformFoldersToDisplay, getParentFoldersIds } from 'common/utils/folderUtils';

const collectAllFolderIds = (folders: TransformedFolder[]): number[] => {
  const ids: number[] = [];

  const traverse = (list: TransformedFolder[]) => {
    list.forEach((folder) => {
      ids.push(folder.id);

      if (!isEmpty(folder.folders)) {
        traverse(folder.folders);
      }
    });
  };

  traverse(folders);

  return ids;
};

interface UseSearchFilteredFoldersParams {
  searchQuery?: string;
}

export const useSearchFilteredFolders = ({
  searchQuery,
}: UseSearchFilteredFoldersParams) => {
  const dispatch = useDispatch();
  const allFolders = useSelector(foldersSelector);
  const filteredFolderData = useSelector(filteredFoldersSelector);
  const isLoading = useSelector(isLoadingFilteredFoldersSelector);
  const testCases = useSelector((state: { testCase?: { testCases?: { list?: unknown[] } } }) =>
    state.testCase?.testCases?.list || []
  );

  useEffect(() => {
    if (!searchQuery) {
      dispatch(clearFilteredFoldersAction());
      return;
    }

    dispatch(getFilteredFoldersAction({ searchQuery }));
  }, [searchQuery, dispatch]);

  // Refetch filtered folders when test cases change (e.g., after delete/move)
  useEffect(() => {
    if (searchQuery) {
      dispatch(getFilteredFoldersAction({ searchQuery }));
    }
  }, [testCases.length, searchQuery, dispatch]);

  const relevantFolderIds = useMemo(() => {
    if (!searchQuery || filteredFolderData.length === 0) return new Set<number>();

    const filteredIds = new Set(filteredFolderData.map((folder) => folder.id));
    const idsWithAncestors = new Set<number>(filteredIds);

    filteredIds.forEach((id) => {
      getParentFoldersIds(id, allFolders).forEach((parentId) => idsWithAncestors.add(parentId));
    });

    return idsWithAncestors;
  }, [filteredFolderData, allFolders, searchQuery]);

  const relevantFolders = useMemo(() => {
    if (!searchQuery || relevantFolderIds.size === 0) return [];

    // Create a map of filtered folder IDs to their filtered counts
    const filteredCountsMap = new Map(
      filteredFolderData.map((folder) => [folder.id, folder.countOfTestCases]),
    );

    return allFolders
      .filter((folder) => relevantFolderIds.has(folder.id))
      .map((folder) => {
        if (filteredCountsMap.has(folder.id)) {
          const count = filteredCountsMap.get(folder.id);

          return count === undefined ? folder : { ...folder, countOfTestCases: count };
        }

        return { ...folder, countOfTestCases: 0 };
      });
  }, [allFolders, relevantFolderIds, searchQuery, filteredFolderData]);

  const transformedFilteredFolders = useMemo(
    () => (searchQuery ? transformFoldersToDisplay(relevantFolders) : []),
    [relevantFolders, searchQuery],
  );

  const expandedFilteredFolderIds = useMemo(
    () => (searchQuery ? collectAllFolderIds(transformedFilteredFolders) : []),
    [transformedFilteredFolders, searchQuery],
  );

  const hasFilteredFolders = !isEmpty(transformedFilteredFolders);

  return {
    searchFilteredFolders: transformedFilteredFolders,
    searchFilteredExpandedIds: expandedFilteredFolderIds,
    isSearchFilteredLoading: isLoading,
    hasSearchFilteredFolders: hasFilteredFolders,
  };
};
