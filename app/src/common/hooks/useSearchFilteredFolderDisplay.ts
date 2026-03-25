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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isEmpty } from 'es-toolkit/compat';

import {
  collectAllTransformedFolderIds,
  getParentFoldersIds,
  transformFoldersToDisplay,
  type BaseFolder,
  type TransformedFolder,
} from 'common/utils/folderUtils';

export interface SearchFilteredFolderRow {
  id: number;
  countOfTestCases?: number;
}

export interface UseSearchFilteredFolderDisplayParams<T extends SearchFilteredFolderRow> {
  searchQuery?: string;
  allFolders: BaseFolder[];
  filteredFolderData: T[];
  isLoading: boolean;
}

export const useSearchFilteredFolderDisplay = <T extends SearchFilteredFolderRow>({
  searchQuery,
  allFolders,
  filteredFolderData,
  isLoading,
}: UseSearchFilteredFolderDisplayParams<T>) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const prevSearchQueryRef = useRef(searchQuery);
  const respondedQueryRef = useRef<string | undefined>(undefined);

  const isQueryPending = !!searchQuery && searchQuery !== respondedQueryRef.current;

  useEffect(() => {
    if (prevSearchQueryRef.current !== searchQuery) {
      setCollapsedIds(new Set());
      prevSearchQueryRef.current = searchQuery;
    }

    if (!searchQuery) {
      respondedQueryRef.current = undefined;
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isLoading && searchQuery) {
      respondedQueryRef.current = searchQuery;
    }
  }, [isLoading, searchQuery]);

  const relevantFolderIds = useMemo(() => {
    if (!searchQuery || isEmpty(filteredFolderData)) {
      return new Set<number>();
    }

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
    if (!searchQuery || relevantFolderIds.size === 0) {
      return [];
    }

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
    () => (searchQuery ? collectAllTransformedFolderIds(transformedFilteredFolders) : []),
    [transformedFilteredFolders, searchQuery],
  );

  const expandedFilteredFolderIds = useMemo(
    () => allFilteredFolderIds.filter((id) => !collapsedIds.has(id)),
    [allFilteredFolderIds, collapsedIds],
  );

  const handleToggleSearchFilteredFolder = useCallback((folder: TransformedFolder) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);

      if (next.has(folder.id)) {
        next.delete(folder.id);
      } else {
        next.add(folder.id);
      }

      return next;
    });
  }, []);

  const hasFilteredFolders = !isEmpty(transformedFilteredFolders);

  const filteredTotalTestCases = useMemo(() => {
    if (!searchQuery) {
      return 0;
    }

    return filteredFolderData.reduce(
      (sum, folder) => sum + (folder.countOfTestCases || 0),
      0,
    );
  }, [filteredFolderData, searchQuery]);

  return {
    searchFilteredFolders: transformedFilteredFolders,
    searchFilteredExpandedIds: expandedFilteredFolderIds,
    isSearchFilteredLoading: isLoading || isQueryPending,
    hasSearchFilteredFolders: hasFilteredFolders,
    handleToggleSearchFilteredFolder,
    filteredTotalTestCases,
  };
};
