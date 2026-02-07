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

import { Folder, TransformedFolder } from 'controllers/testCase';
import { PageInfo } from 'controllers/testPlan';

export interface LaunchAttribute {
  key: string;
  value: string;
}

export interface LaunchExecutions {
  total: number;
  failed?: number;
  passed?: number;
  skipped?: number;
  inProgress?: number;
}

export interface LaunchDefectGroup {
  total: number;
  [key: string]: number;
}

export interface LaunchDefects {
  system_issue?: LaunchDefectGroup;
  to_investigate?: LaunchDefectGroup;
  automation_bug?: LaunchDefectGroup;
  product_bug?: LaunchDefectGroup;
}

export interface LaunchStatistics {
  executions: LaunchExecutions;
  defects: LaunchDefects;
}

export interface Launch {
  owner: string;
  description: string;
  id: number;
  uuid: string;
  name: string;
  number: number;
  startTime: string;
  endTime: string;
  lastModified: string;
  status: string;
  statistics: LaunchStatistics;
  attributes: LaunchAttribute[];
  mode: string;
  type: string;
  analysing: string[];
  approximateDuration: number;
  hasRetries: boolean;
  rerun: boolean;
  metadata: Record<string, string>;
  retentionPolicy: string;
  testPlan: string;
}

export interface LaunchesResponse {
  content: Launch[];
  page: PageInfo;
}

export interface ManualTestCase {
  id: number;
  count: number;
  name: string;
  startTime: number;
  totalTests: number;
  successTests: number;
  failedTests: number;
  inProgressTests: number;
  skippedTests: number;
  testsToRun: number;
}

export interface LaunchOwner {
  id: number;
  email: string;
  name?: string;
}

export interface LaunchTestPlan {
  id: number;
  name: string;
}

export interface ExecutionStatistic {
  total: number;
  failed: number;
  passed: number;
  skipped: number;
  toRun: number;
  inProgress: number;
}

export interface ManualLaunchItem {
  id: number;
  name: string;
  description: string;
  owner: LaunchOwner;
  number: number;
  status: string;
  attributes: LaunchAttribute[];
  startTime: string;
  createdAt: string;
  type: string;
  mode: string;
  testPlan: LaunchTestPlan | null;
  executionStatistic: ExecutionStatistic;
}

export interface UrlsHelper {
  manualLaunchesListPagination: (projectKey: string, query?: Record<string, unknown>) => string;
  manualLaunchById: (projectKey: string, launchId: string | number) => string;
  manualLaunchFolders: (
    projectKey: string,
    launchId: string | number,
    query?: Record<string, unknown>,
  ) => string;
  manualLaunchTestCaseExecutions: (
    projectKey: string,
    launchId: string | number,
    query?: Record<string, unknown>,
  ) => string;
}

export type FoldersSelectorType = (state: unknown) => Folder[] | TransformedFolder[];
