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

import { getRouterParams } from 'common/utils';
import {
  MANUAL_LAUNCHES_FILTER_URL_KEYS,
  resolveFilterCompositeAttributeForApi,
  resolveFilterRetentionPolicyForApi,
} from 'common/manualLaunches/manualLaunchesFilterUrl';
import { importantLaunchesEnabledSelector } from 'controllers/appInfo';
import type { AppState } from 'types/store';
import { ExecutionStatus } from 'types/testCase';

import {
  MANUAL_LAUNCHES_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from './constants';
import type {
  GetManualLaunchesParams,
  GetManualLaunchFoldersParams,
  GetManualLaunchTestCaseExecutionsParams,
} from './types';

// Launch list request built from the URL (paging, search and all filters), so every refetch
// shows the same list the user is looking at.
export const getManualLaunchesFetchParams = (state: AppState): GetManualLaunchesParams => {
  const { offset, limit } = getRouterParams({
    namespace: MANUAL_LAUNCHES_NAMESPACE,
    defaultParams: defaultManualLaunchesQueryParams,
    state,
  });

  const { searchQuery, ...query } = (state.location?.query ?? {}) as Record<
    string,
    string | undefined
  >;

  const rawStatuses = query[MANUAL_LAUNCHES_FILTER_URL_KEYS.STATUSES];
  const filterStatuses = rawStatuses ? rawStatuses.split(',').filter(Boolean) : undefined;

  const rawStartTimeFrom = query[MANUAL_LAUNCHES_FILTER_URL_KEYS.START_TIME_FROM];
  const filterStartTimeFrom = rawStartTimeFrom ? Number(rawStartTimeFrom) : undefined;

  const rawStartTimeTo = query[MANUAL_LAUNCHES_FILTER_URL_KEYS.START_TIME_TO];
  const filterEndTimeTo = rawStartTimeTo ? Number(rawStartTimeTo) : undefined;

  return {
    offset,
    limit,
    searchQuery,
    filterStatuses,
    filterCompletion: query[MANUAL_LAUNCHES_FILTER_URL_KEYS.COMPLETION] || undefined,
    filterRetentionPolicy: importantLaunchesEnabledSelector(state)
      ? resolveFilterRetentionPolicyForApi(query)
      : undefined,
    filterStartTimeFrom: Number.isFinite(filterStartTimeFrom) ? filterStartTimeFrom : undefined,
    filterEndTimeTo: Number.isFinite(filterEndTimeTo) ? filterEndTimeTo : undefined,
    filterTestPlan: query[MANUAL_LAUNCHES_FILTER_URL_KEYS.TEST_PLAN] || undefined,
    filterCompositeAttribute: resolveFilterCompositeAttributeForApi(query),
  };
};

export const getManualLaunchDetailsFetchParams = (state: AppState) => {
  const { launchId, manualLaunchPageRoute } = state.location?.payload || {};
  const folderSegment = manualLaunchPageRoute?.split('/')[1];
  const folderId = folderSegment || undefined;
  const query = state.location?.query || {};

  const { offset, limit } = getRouterParams({
    namespace: MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
    defaultParams: defaultManualLaunchesQueryParams,
    state,
  });

  const rawStatus = query.statusFilter;
  const statusFilter = rawStatus ? (rawStatus as ExecutionStatus) : undefined;

  return {
    launchId,
    folderId,
    offset,
    limit,
    searchQuery: query.searchQuery,
    filterPriorities: query.filterPriorities,
    filterTags: query.filterTags,
    ...(statusFilter ? { statusFilter } : {}),
  };
};

export type ManualLaunchDetailsFetchParams = ReturnType<typeof getManualLaunchDetailsFetchParams>;

export const buildGetManualLaunchTestCaseExecutionsParams = (
  params: ManualLaunchDetailsFetchParams,
  launchIdOverride?: string | number,
): GetManualLaunchTestCaseExecutionsParams | null => {
  const launchId = launchIdOverride ?? params.launchId;

  if (launchId === undefined || launchId === '') {
    return null;
  }

  return {
    launchId,
    ...(params.folderId && { folderId: params.folderId }),
    offset: params.offset,
    limit: params.limit,
    ...(params.searchQuery && { searchQuery: params.searchQuery }),
    ...(params.filterPriorities && { filterPriorities: params.filterPriorities }),
    ...(params.filterTags && { filterTags: params.filterTags }),
    ...(params.statusFilter && { statusFilter: params.statusFilter }),
  };
};

// Folder tree request with the same filters as the execution list (incl. "To run only"),
// so folder counters match the table.
export const buildGetManualLaunchFoldersParams = (
  params: ManualLaunchDetailsFetchParams,
  launchId: string | number,
): GetManualLaunchFoldersParams => ({
  launchId,
  ...(params.filterPriorities && { filterPriorities: params.filterPriorities }),
  ...(params.filterTags && { filterTags: params.filterTags }),
  ...(params.statusFilter && { statusFilter: params.statusFilter }),
});
