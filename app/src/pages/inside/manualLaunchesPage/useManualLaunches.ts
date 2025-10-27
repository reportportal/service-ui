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

import { Launch, LaunchesResponse, ManualTestCase } from './types';

const transformLaunchToManualTestCase = (launch: Launch): ManualTestCase => {
  const totalTests = launch.statistics?.executions?.total ?? 0;
  const successTests = launch.statistics?.executions?.passed ?? 0;
  const failedTests = launch.statistics?.executions?.failed ?? 0;
  const skippedTests = launch.statistics?.executions?.skipped ?? 0;

  const { id, number, name, startTime } = launch;

  return {
    id,
    count: number,
    name,
    startTime: new Date(startTime).getTime(),
    totalTests,
    successTests,
    failedTests,
    skippedTests,
    testsToRun: 0,
  };
};

export const useManualLaunches = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const [launches, setLaunches] = useState<ManualTestCase[]>([]);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const fetchManualLaunches = useCallback(async () => {
    try {
      showSpinner();

      const response = await fetch<LaunchesResponse>(URLS.manualLaunchesList(projectKey));

      const transformedData = response.content.map(transformLaunchToManualTestCase);
      setLaunches(transformedData);
    } catch (error) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  }, [projectKey]);

  useEffect(() => {
    void fetchManualLaunches();
  }, [fetchManualLaunches]);

  return {
    launches,
    isLoading,
    refetch: fetchManualLaunches,
  };
};
