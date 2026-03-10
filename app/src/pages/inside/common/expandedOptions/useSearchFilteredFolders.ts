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

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import { ERROR_CANCELED } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { TransformedFolder, foldersSelector } from 'controllers/testCase';
import { fetchAllFolders } from 'controllers/testCase/utils/fetchAllFolders';
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
  const projectKey = useSelector(projectKeySelector);
  const allFolders = useSelector(foldersSelector);
  const [filteredFolderIds, setFilteredFolderIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!searchQuery || !projectKey) {
      setFilteredFolderIds(new Set());
      setIsLoading(false);

      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchFilteredFolders = async () => {
      setIsLoading(true);

      try {
        const folders = await fetchAllFolders({
          projectKey,
          filters: { 'filter.cnt.testCaseName': searchQuery },
          signal: abortController.signal,
        });

        if (!abortController.signal.aborted) {
          setFilteredFolderIds(new Set(folders.map((f) => f.id)));
        }
      } catch (err) {
        if (err instanceof Error && err.message !== ERROR_CANCELED && !abortController.signal.aborted) {
          setFilteredFolderIds(new Set());
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchFilteredFolders();

    return () => {
      abortController.abort();
    };
  }, [searchQuery, projectKey]);

  const relevantFolderIds = useMemo(() => {
    if (!searchQuery || filteredFolderIds.size === 0) return new Set<number>();

    const idsWithAncestors = new Set<number>(filteredFolderIds);

    filteredFolderIds.forEach((id) => {
      getParentFoldersIds(id, allFolders).forEach((parentId) => idsWithAncestors.add(parentId));
    });

    return idsWithAncestors;
  }, [filteredFolderIds, allFolders, searchQuery]);

  const relevantFolders = useMemo(() => {
    if (!searchQuery || relevantFolderIds.size === 0) return [];

    return allFolders.filter((folder) => relevantFolderIds.has(folder.id));
  }, [allFolders, relevantFolderIds, searchQuery]);

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
