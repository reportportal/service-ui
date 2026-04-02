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

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  manualLaunchFoldersSelector,
  manualLaunchFilteredFoldersSelector,
  isLoadingManualLaunchFilteredFoldersSelector,
  getManualLaunchFilteredFoldersAction,
  clearManualLaunchFilteredFoldersAction,
} from 'controllers/manualLaunch';
import type { ManualLaunchFolder } from 'controllers/manualLaunch';
import { useSearchFilteredFolderDisplay } from 'common/hooks';

interface UseManualLaunchSearchFilteredFoldersParams {
  searchQuery?: string;
  launchId: string | number;
  filterPriorities?: string;
  filterTags?: string;
}

export const useManualLaunchSearchFilteredFolders = ({
  searchQuery,
  launchId,
  filterPriorities,
  filterTags,
}: UseManualLaunchSearchFilteredFoldersParams) => {
  const dispatch = useDispatch();
  const allFolders = useSelector(manualLaunchFoldersSelector);
  const filteredFolderData = useSelector(manualLaunchFilteredFoldersSelector);
  const isLoading = useSelector(isLoadingManualLaunchFilteredFoldersSelector);

  useEffect(() => {
    if (!searchQuery) {
      dispatch(clearManualLaunchFilteredFoldersAction());
      return;
    }

    dispatch(
      getManualLaunchFilteredFoldersAction({
        launchId,
        searchQuery,
        ...(filterPriorities && { filterPriorities }),
        ...(filterTags && { filterTags }),
      }),
    );
  }, [searchQuery, launchId, filterPriorities, filterTags, dispatch]);

  return useSearchFilteredFolderDisplay<ManualLaunchFolder>({
    searchQuery,
    allFolders,
    filteredFolderData,
    isLoading,
  });
};
