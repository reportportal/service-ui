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

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Folder,
  foldersSelector,
  filteredFoldersSelector,
  isLoadingFilteredFoldersSelector,
  getFilteredFoldersAction,
  clearFilteredFoldersAction,
} from 'controllers/testCase';
import { useSearchFilteredFolderDisplay } from 'common/hooks';

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
  const initialFoldersRef = useRef(allFolders);

  useEffect(() => {
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

  return useSearchFilteredFolderDisplay({
    searchQuery,
    allFolders,
    filteredFolderData,
    isLoading,
  });
};
