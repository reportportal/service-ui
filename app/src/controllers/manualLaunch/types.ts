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

import { Page } from 'types/common';

import { Launch } from 'pages/inside/manualLaunchesPage/types';

// Action parameter types
export interface GetManualLaunchesParams {
  offset?: string | number;
  limit?: string | number;
}

export interface GetManualLaunchParams {
  launchId: string | number;
}

export interface GetManualLaunchFoldersParams {
  launchId: string | number;
  offset?: string | number;
  limit?: string | number;
}

export interface GetManualLaunchTestCaseExecutionsParams {
  launchId: string | number;
  offset?: string | number;
  limit?: string | number;
}

// State types
export interface ManualLaunchState {
  data: {
    content: Launch[] | null;
    page: Page | null;
  };
  isLoading?: boolean;
  activeManualLaunch?: Launch | null;
  isLoadingActive?: boolean;
}

export interface ManualLaunchFoldersState {
  data: {
    content: ManualLaunchFolder[];
    page: Page | null;
  } | null;
  isLoading?: boolean;
}

export interface ManualLaunchTestCaseExecutionsState {
  data: {
    content: TestCaseExecution[];
    page: Page | null;
  } | null;
  isLoading?: boolean;
}

// API Response types
export interface ManualLaunchFolder {
  id: number;
  name: string;
  countOfTestCases: number;
  parentFolderId?: number;
}

export interface ManualLaunchFoldersResponse {
  content: ManualLaunchFolder[];
  page: Page;
}

export interface Attachment {
  id: string | number;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface BtsTicket {
  id: number;
}

export interface ExecutionComment {
  comment?: string;
  btsTicket?: BtsTicket;
  attachments?: Attachment[];
}

export interface TestFolder {
  id: number;
  testItemId?: number; // Reference to link folder with test case executions
}

export interface Attribute {
  id: number;
  key: string;
  value?: string;
}

export interface Preconditions {
  value: string;
  attachments?: Attachment[];
}

export interface ManualScenarioStep {
  id: number;
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
}

export type ManualScenarioType = 'STEPS';

export interface ManualScenario {
  id: number;
  executionEstimationTime: number;
  linkToRequirements?: string;
  preconditions?: Preconditions;
  attributes?: Attribute[];
  manualScenarioType: ManualScenarioType;
  steps?: ManualScenarioStep[];
}

export interface TestCaseExecution {
  id: number;
  executionStatus?: string;
  executionComment?: ExecutionComment;
  startedAt?: number;
  finishedAt?: number;
  duration?: number;
  testCaseVersionId?: number;
  testItemId?: number;
  testCaseId: number;
  testCaseName: string;
  testCaseDescription?: string;
  testCasePriority?: string;
  testFolder?: TestFolder;
  manualScenario?: ManualScenario;
  attributes?: Attribute[];
}

export interface TestCaseExecutionsResponse {
  content: TestCaseExecution[];
  page: Page;
}
