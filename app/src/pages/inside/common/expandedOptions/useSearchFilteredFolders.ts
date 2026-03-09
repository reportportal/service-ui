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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { TransformedFolder, Folder, foldersSelector } from 'controllers/testCase';
import { transformFoldersToDisplay, getParentFoldersIds } from 'common/utils/folderUtils';

interface FoldersDto {
  content: Folder[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

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
        const limit = 1000;
        const ids = new Set<number>();

        let offset = 0;
        let totalElements = Infinity;

        while (offset < totalElements) {
          if (abortController.signal.aborted) {
            return;
          }

          // eslint-disable-next-line no-await-in-loop
          const response = await fetch<FoldersDto>(
            URLS.testFolders(projectKey, {
              offset,
              limit,
              sort: 'id,ASC',
              'filter.cnt.testCaseName': searchQuery,
            }),
          );

          response.content.forEach((folder) => ids.add(folder.id));
          totalElements = response.page.totalElements;
          offset += limit;
        }

        if (!abortController.signal.aborted) {
          setFilteredFolderIds(ids);
        }
      } catch {
        if (!abortController.signal.aborted) {
          setFilteredFolderIds(new Set());
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFilteredFolders();

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
