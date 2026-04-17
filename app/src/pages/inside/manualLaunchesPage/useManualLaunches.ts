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

import { ExecutionStatistic, Launch, ManualTestCase } from './types';

type ResolvedLaunchExecutionStats = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  inProgress: number;
  testsToRun: number;
};

const fromExecutionStatistic = (stats: ExecutionStatistic): ResolvedLaunchExecutionStats => ({
  total: stats.total ?? 0,
  passed: stats.passed ?? 0,
  failed: stats.failed ?? 0,
  skipped: stats.skipped ?? 0,
  inProgress: stats.inProgress ?? 0,
  testsToRun: stats.toRun ?? 0,
});

const fromClassicLaunchStatistics = (launch: Launch): ResolvedLaunchExecutionStats => {
  const executions = launch.statistics?.executions;
  const total = executions?.total ?? 0;
  const passed = executions?.passed ?? 0;
  const failed = executions?.failed ?? 0;
  const skipped = executions?.skipped ?? 0;
  const inProgress = executions?.inProgress ?? 0;
  const testsToRun = Math.max(0, total - passed - failed - skipped - inProgress);

  return { total, passed, failed, skipped, inProgress, testsToRun };
};

const getExecutionStatistics = (launch: Launch): ResolvedLaunchExecutionStats =>
  launch.executionStatistic
    ? fromExecutionStatistic(launch.executionStatistic)
    : fromClassicLaunchStatistics(launch);

export const transformLaunchToManualTestCase = (launch: Launch): ManualTestCase => {
  const { total, passed, failed, skipped, inProgress, testsToRun } = getExecutionStatistics(launch);
  const { id, number, name, startTime, displayId } = launch;

  return {
    id,
    displayId,
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
  const { total, passed, failed, skipped, inProgress, testsToRun } = getExecutionStatistics(launch);

  return {
    totalTests: total,
    passedTests: passed,
    failedTests: failed,
    skippedTests: skipped,
    testsToRun,
    inProgressTests: inProgress,
  };
};
