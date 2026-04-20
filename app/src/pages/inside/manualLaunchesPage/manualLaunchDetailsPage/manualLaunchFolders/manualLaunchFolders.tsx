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

import { useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import {
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  manualLaunchTestCaseExecutionsPageSelector,
  isLoadingManualLaunchFoldersSelector,
  isLoadingManualLaunchTestCaseExecutionsSelector,
  urlManualLaunchFolderIdSelector,
  expandManualLaunchFoldersToLevelAction,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';
import { MANUAL_LAUNCH_DETAILS_PAGE, locationSelector } from 'controllers/pages';
import { ExecutionStatus } from 'types/testCase';
import { useManualLaunchId, useProjectDetails } from 'hooks/useTypedSelector';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { transformFoldersToDisplay, filterEmptyFolders } from 'common/utils/folderUtils';
import { ExpandedOptions } from '../../../common/expandedOptions';
import { ManualLaunchExecutions } from '../manualLaunchExecutions';
import { useManualLaunchSearchFilteredFolders } from './useManualLaunchSearchFilteredFolders';

export const ManualLaunchFolders = () => {
  const dispatch = useDispatch();
  const launchId = useManualLaunchId();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const pageInfo = useSelector(manualLaunchTestCaseExecutionsPageSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);

  const {
    searchQuery,
    filterPriorities,
    filterTags,
    statusFilter,
    limit: queryLimit,
  } = useSelector(locationSelector)?.query ?? {};

  const urlFolderId = useSelector(urlManualLaunchFolderIdSelector);
  const urlFolderIdNumber = urlFolderId ? Number(urlFolderId) : null;

  const activeFolder = useMemo(
    () => folders.find(({ id }) => id === urlFolderIdNumber),
    [urlFolderIdNumber, folders],
  );

  const transformedFolders = useMemo(
    () => filterEmptyFolders(transformFoldersToDisplay(folders)),
    [folders],
  );

  useEffect(() => {
    if (urlFolderIdNumber && !isEmpty(folders)) {
      dispatch(
        expandManualLaunchFoldersToLevelAction({
          folderId: urlFolderIdNumber,
          folders,
        }),
      );
    }
  }, [urlFolderIdNumber, folders, dispatch]);

  const {
    searchFilteredFolders,
    searchFilteredExpandedIds,
    isSearchFilteredLoading,
    hasSearchFilteredFolders,
    handleToggleSearchFilteredFolder,
    setAllExpandedInFilter,
    setAllCollapsedInFilter,
    filteredTotalTestCases,
  } = useManualLaunchSearchFilteredFolders({
    searchQuery,
    launchId,
    filterPriorities,
    filterTags,
    statusFilter: statusFilter as ExecutionStatus | undefined,
  });

  const navigateToFolder = useCallback(
    (folderId?: number) => {
      dispatch({
        type: MANUAL_LAUNCH_DETAILS_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          launchId,
          ...(folderId && { manualLaunchPageRoute: `folder/${folderId}` }),
        },
        meta: {
          query: {
            ...defaultManualLaunchesQueryParams,
            ...(searchQuery && { searchQuery }),
            ...(filterPriorities && { filterPriorities }),
            ...(filterTags && { filterTags }),
            ...(statusFilter && { statusFilter }),
            limit: queryLimit ?? defaultManualLaunchesQueryParams.limit,
          },
        },
      });
    },
    [
      dispatch,
      organizationSlug,
      projectSlug,
      launchId,
      searchQuery,
      filterPriorities,
      filterTags,
      statusFilter,
      queryLimit,
    ],
  );

  const handleFolderClick = useCallback(
    (folderId: number) => {
      navigateToFolder(folderId);
    },
    [navigateToFolder],
  );

  const handleAllExecutionsClick = useCallback(() => {
    navigateToFolder();
  }, [navigateToFolder]);

  useEffect(() => {
    if (urlFolderId && !activeFolder && !isLoadingFolders) {
      navigateToFolder();
    }
  }, [
    urlFolderId,
    activeFolder,
    isLoadingFolders,
    navigateToFolder,
    dispatch,
    filterPriorities,
    filterTags,
    statusFilter,
  ]);

  const searchFilteredData = useMemo(
    () => ({
      searchFilteredFolders,
      searchFilteredExpandedIds,
      isSearchFilteredLoading,
      hasSearchFilteredFolders,
      handleToggleSearchFilteredFolder,
      setAllExpandedInFilter,
      setAllCollapsedInFilter,
      filteredTotalTestCases,
    }),
    [
      searchFilteredFolders,
      searchFilteredExpandedIds,
      isSearchFilteredLoading,
      hasSearchFilteredFolders,
      handleToggleSearchFilteredFolder,
      setAllExpandedInFilter,
      setAllCollapsedInFilter,
      filteredTotalTestCases,
    ],
  );

  const hasExecutionFilters = !!(filterPriorities || filterTags);
  const hasFetchedExecutions = pageInfo !== undefined && pageInfo !== null;
  const executionTotal = pageInfo?.totalElements ?? 0;
  const hideFolderSidebar =
    hasExecutionFilters &&
    hasFetchedExecutions &&
    !isLoadingExecutions &&
    !isLoadingFolders &&
    isEmpty(executions) &&
    executionTotal === 0 &&
    isEmpty(transformedFolders);

  return (
    <ExpandedOptions
      activeFolderId={urlFolderIdNumber}
      folders={transformedFolders}
      instanceKey={TMS_INSTANCE_KEY.MANUAL_LAUNCH}
      searchQuery={searchQuery}
      searchAllFolders={folders}
      searchFilteredData={searchFilteredData}
      hideFolderSidebar={hideFolderSidebar}
      setAllTestCases={handleAllExecutionsClick}
      onFolderClick={handleFolderClick}
    >
      <ManualLaunchExecutions
        executions={executions}
        pageInfo={pageInfo}
        isLoading={isLoadingExecutions || isLoadingFolders}
        searchQuery={searchQuery}
      />
    </ExpandedOptions>
  );
};
