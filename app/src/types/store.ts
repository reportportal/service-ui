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
import { TestPlanState } from 'controllers/testPlan/selectors';
import { TestCaseState } from 'controllers/testCase/selectors';
import { UserState } from 'controllers/user/types';
import { NotificationState } from 'controllers/notification/types';
import { ModalState } from 'controllers/modal/types';

export interface BaseAppState {
  location?: {
    payload?: ProjectDetails & {
      testPlanId?: string;
      testCaseId?: string;
    };
    prev?: {
      payload?: ProjectDetails;
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
  testCase?: TestCaseAppState['testCase'];
  user?: UserState;
  notifications?: NotificationState;
  modal?: ModalState;
}
