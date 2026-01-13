/*
 * Copyright 2025 EPAM Systems
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

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { showErrorNotification } from 'controllers/notification';
import { useDebouncedSpinner } from 'common/hooks';

import { Launch, LaunchesResponse, ManualTestCase, UrlsHelper } from './types';

const getExecutionStatistics = (launch: Launch) => ({
  total: launch.statistics?.executions?.total ?? 0,
  passed: launch.statistics?.executions?.passed ?? 0,
  failed: launch.statistics?.executions?.failed ?? 0,
  skipped: launch.statistics?.executions?.skipped ?? 0,
  inProgress: launch.statistics?.executions?.inProgress ?? 5,
});

export const transformLaunchToManualTestCase = (launch: Launch): ManualTestCase => {
  const { total, passed, failed, skipped, inProgress } = getExecutionStatistics(launch);
  const { id, number, name, startTime } = launch;

  // TODO: after backend implementation
  const testsToRun = total - passed - failed - skipped - inProgress;

  return {
    id,
    count: number,
    name,
    startTime: new Date(startTime).getTime(),
    totalTests: total,
    successTests: passed,
    failedTests: failed,
    skippedTests: skipped,
    inProgressTests: inProgress,
    testsToRun,
  };
};

export const getLaunchStatistics = (launch: Launch) => {
  const { total, passed, failed, skipped } = getExecutionStatistics(launch);
  // TODO: after backend implementation
  const inProgressTests = 0;
  const testsToRun = total - passed - failed - skipped;

  return {
    totalTests: total,
    passedTests: passed,
    failedTests: failed,
    skippedTests: skipped,
    testsToRun,
    inProgressTests,
  };
};

export const useManualLaunches = (offset: number, limit: number) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const [launchesData, setLaunchesData] = useState<LaunchesResponse | null>(null);

  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const fetchManualLaunches = useCallback(async () => {
    try {
      showSpinner();

      const typedURLS = URLS as UrlsHelper;
      const response = await fetch<LaunchesResponse>(
        typedURLS.manualLaunchesListPagination(projectKey, { offset, limit }),
      );

      setLaunchesData(response);
    } catch {
      dispatch(
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        }),
      );
    } finally {
      hideSpinner();
    }
  }, [projectKey, offset, limit]);

  useEffect(() => {
    void fetchManualLaunches();
  }, [fetchManualLaunches]);

  return {
    content: launchesData?.content || [],
    page: launchesData?.page,
    isLoading,
    refetch: fetchManualLaunches,
  };
};
