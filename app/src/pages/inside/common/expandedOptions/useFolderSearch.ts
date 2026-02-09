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

import { useState, useCallback, ChangeEvent, useRef, useEffect, useMemo } from 'react';

import { useOnClickOutside } from 'common/hooks';

import { hasMatchInTree, collectFoldersToExpand } from './utils';
import { UseFolderSearchParams } from './types';

export const useFolderSearch = ({
  folders,
  expandedIds,
  onToggleFolder,
}: UseFolderSearchParams) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [searchExpandedIds, setSearchExpandedIds] = useState<Set<number>>(new Set());
  const [userClosedDuringSearch, setUserClosedDuringSearch] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  useOnClickOutside(searchWrapperRef, () => {
    if (isSearchVisible && !searchQuery) {
      setIsSearchVisible(false);
    }
  });

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setIsSearchVisible(false);
  }, []);

  const handleMagnifierClick = useCallback(() => {
    if (isSearchVisible && !searchQuery) {
      setIsSearchVisible(false);
    } else {
      handleSearchToggle();
    }
  }, [isSearchVisible, searchQuery, handleSearchToggle]);

  const filteredFolders = useMemo(
    () => (searchQuery ? folders.filter((folder) => hasMatchInTree(folder, searchQuery)) : folders),
    [folders, searchQuery],
  );

  const hasAnyMatch = filteredFolders.length > 0;

  const foldersToExpand = useMemo(
    () => (searchQuery ? collectFoldersToExpand(folders, searchQuery) : []),
    [folders, searchQuery],
  );

  useEffect(() => {
    if (searchQuery) {
      setSearchExpandedIds(new Set(foldersToExpand));
      setUserClosedDuringSearch(new Set());
    } else {
      setSearchExpandedIds(new Set());
      setUserClosedDuringSearch(new Set());
    }
  }, [searchQuery, foldersToExpand]);

  const effectiveExpandedIds = useMemo(
    () => [
      ...new Set([
        ...expandedIds,
        ...[...searchExpandedIds].filter((id) => !userClosedDuringSearch.has(id)),
      ]),
    ],
    [expandedIds, searchExpandedIds, userClosedDuringSearch],
  );

  const handleToggleFolder = useCallback(
    (folder: TransformedFolder) => {
      if (searchQuery && searchExpandedIds.has(folder.id)) {
        const isCurrentlyExpanded = effectiveExpandedIds.includes(folder.id);
        if (isCurrentlyExpanded) {
          setUserClosedDuringSearch((prev) => new Set([...prev, folder.id]));
        } else {
          setUserClosedDuringSearch((prev) => {
            const next = new Set(prev);
            next.delete(folder.id);
            return next;
          });
        }
      }
      onToggleFolder(folder);
    },
    [searchQuery, searchExpandedIds, effectiveExpandedIds, onToggleFolder],
  );

  return {
    searchQuery,
    isSearchVisible,
    searchInputRef,
    searchWrapperRef,
    filteredFolders,
    hasAnyMatch,
    effectiveExpandedIds,
    handleToggleFolder,
    handleSearchChange,
    handleSearchClear,
    handleMagnifierClick,
  };
};
