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
import type { AppState } from 'types/store';
import { ExecutionStatus } from 'types/testCase';

import { MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE, defaultManualLaunchesQueryParams } from './constants';

export const getManualLaunchDetailsFetchParams = (state: AppState) => {
  const { launchId, manualLaunchPageRoute } = state.location?.payload || {};
  const folderSegment = manualLaunchPageRoute?.split('/')[1];
  const folderId = folderSegment || undefined;
  const query =
    (state.location as { query?: Record<string, string | undefined> } | undefined)?.query || {};

  const { offset, limit } = getRouterParams({
    namespace: MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
    defaultParams: defaultManualLaunchesQueryParams,
    state: state as Parameters<typeof getRouterParams>[0]['state'],
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
