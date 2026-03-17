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

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import {
  Folder,
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
  extraFilters?: Record<string, string | number>;
  allFoldersOverride?: Folder[];
}

export const useSearchFilteredFolders = ({
  searchQuery,
  extraFilters,
  allFoldersOverride,
}: UseSearchFilteredFoldersParams) => {
  const dispatch = useDispatch();
  const defaultFolders = useSelector(foldersSelector);
  const allFolders = allFoldersOverride ?? defaultFolders;
  const filteredFolderData = useSelector(filteredFoldersSelector);
  const isLoading = useSelector(isLoadingFilteredFoldersSelector);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const prevSearchQueryRef = useRef(searchQuery);
  const initialFoldersRef = useRef(allFolders);

  useEffect(() => {
    if (prevSearchQueryRef.current !== searchQuery) {
      setCollapsedIds(new Set());
      prevSearchQueryRef.current = searchQuery;
    }

    if (!searchQuery) {
      dispatch(clearFilteredFoldersAction());
      return;
    }

    initialFoldersRef.current = allFolders;
    dispatch(getFilteredFoldersAction({ searchQuery, extraFilters }));
  }, [searchQuery, extraFilters, dispatch]);

  useEffect(() => {
    if (!searchQuery || allFolders === initialFoldersRef.current) {
      return;
    }

    initialFoldersRef.current = allFolders;
    dispatch(getFilteredFoldersAction({ searchQuery, extraFilters }));
  }, [allFolders, searchQuery, extraFilters, dispatch]);

  const relevantFolderIds = useMemo(() => {
    if (!searchQuery || filteredFolderData.length === 0) return new Set<number>();

    const filteredIds = new Set(filteredFolderData.map((folder) => folder.id));
    const idsWithAncestors = new Set<number>(filteredIds);

    filteredIds.forEach((id) => {
      getParentFoldersIds(id, allFolders).forEach((parentId) => idsWithAncestors.add(parentId));
    });

    return idsWithAncestors;
  }, [filteredFolderData, allFolders, searchQuery]);

  const filteredCountsMap = useMemo(
    () => new Map(filteredFolderData.map((folder) => [folder.id, folder.countOfTestCases])),
    [filteredFolderData],
  );

  const relevantFolders = useMemo(() => {
    if (!searchQuery || relevantFolderIds.size === 0) return [];

    return allFolders
      .filter((folder) => relevantFolderIds.has(folder.id))
      .map((folder) => {
        const filteredCount = filteredCountsMap.get(folder.id);

        return { ...folder, countOfTestCases: filteredCount ?? 0 };
      });
  }, [allFolders, relevantFolderIds, searchQuery, filteredCountsMap]);

  const transformedFilteredFolders = useMemo(
    () => (searchQuery ? transformFoldersToDisplay(relevantFolders) : []),
    [relevantFolders, searchQuery],
  );

  const allFilteredFolderIds = useMemo(
    () => (searchQuery ? collectAllFolderIds(transformedFilteredFolders) : []),
    [transformedFilteredFolders, searchQuery],
  );

  const expandedFilteredFolderIds = useMemo(
    () => allFilteredFolderIds.filter((id) => !collapsedIds.has(id)),
    [allFilteredFolderIds, collapsedIds],
  );

  const handleToggleSearchFilteredFolder = useCallback(
    (folder: TransformedFolder) => {
      setCollapsedIds((prev) => {
        const next = new Set(prev);

        if (next.has(folder.id)) {
          next.delete(folder.id);
        } else {
          next.add(folder.id);
        }

        return next;
      });
    },
    [],
  );

  const hasFilteredFolders = !isEmpty(transformedFilteredFolders);

  const filteredTotalTestCases = useMemo(() => {
    if (!searchQuery) {
      return 0;
    }

    return filteredFolderData.reduce((sum, folder) => sum + (folder.countOfTestCases || 0), 0);
  }, [filteredFolderData, searchQuery]);

  return {
    searchFilteredFolders: transformedFilteredFolders,
    searchFilteredExpandedIds: expandedFilteredFolderIds,
    isSearchFilteredLoading: isLoading,
    hasSearchFilteredFolders: hasFilteredFolders,
    handleToggleSearchFilteredFolder,
    filteredTotalTestCases,
  };
};
