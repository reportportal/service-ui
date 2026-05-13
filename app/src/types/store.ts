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

import { ProjectDetails } from 'pages/organization/constants';
import type { TestPlanState } from 'controllers/testPlan/state';
import type { MilestoneState } from 'controllers/milestone/types';
import type { TestCaseState } from 'controllers/testCase/state';
import type {
  ManualLaunchState,
  ManualLaunchFoldersState,
  ManualLaunchTestCaseExecutionsState,
  ActiveManualLaunchExecutionState,
} from 'controllers/manualLaunch/types';
import type { UserState } from 'controllers/user/types';
import type { NotificationState } from 'controllers/notification/types';
import type { ModalState } from 'controllers/modal/types';

export interface LocationQuery {
  offset?: string;
  limit?: string;
  testCasesSearchParams?: string;
  searchQuery?: string;
  filterPriorities?: string;
  filterTags?: string;
  statusFilter?: string;
  filterStatuses?: string;
  filterCompletion?: string;
  filterStartTimeFrom?: string;
  filterStartTimeTo?: string;
  filterTestPlan?: string;
  filterCompositeAttribute?: string;
}

export interface BaseAppState {
  location?: {
    pathname?: string;
    payload?: ProjectDetails & {
      testPlanId?: string;
      testCaseId?: string;
      launchId?: string;
      manualLaunchPageRoute?: string;
    };
    query?: LocationQuery;
    prev?: {
      payload?: ProjectDetails;
      query?: LocationQuery;
    };
  };
}

export interface TestPlanAppState extends BaseAppState {
  testPlan?: TestPlanState;
}

export interface TestCaseAppState extends BaseAppState {
  testCase?: TestCaseState;
}

export interface AppState extends BaseAppState {
  testPlan?: TestPlanAppState['testPlan'];
  milestone?: MilestoneState;
  testCase?: TestCaseAppState['testCase'];
  manualLaunch?: ManualLaunchState;
  manualLaunchFolders?: ManualLaunchFoldersState;
  manualLaunchTestCaseExecutions?: ManualLaunchTestCaseExecutionsState;
  activeManualLaunchExecution?: ActiveManualLaunchExecutionState;
  user?: UserState;
  notifications?: NotificationState;
  modal?: ModalState;
}
