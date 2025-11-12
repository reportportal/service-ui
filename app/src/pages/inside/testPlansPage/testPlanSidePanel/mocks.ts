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

import { CoverStatus } from './coverStatusCard';
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';
import { ManualScenario } from 'pages/inside/testCaseLibraryPage/types';
import { ExecutionStatusType } from './executionStatus';

export const MOCK_BREADCRUMB_PATH = ['Regression Weekly A-team', 'Checkout flow'];

export const MOCK_PRIORITY = 'unspecified' as const;

export const MOCK_DURATION = '16 min';

export const MOCK_DESCRIPTION = `Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works.

The first unit of work is to check if the user exists in the database. If the user does not exist, the method should throw an exception. The second unit of work is to validate the user permissions and roles. Finally, the third unit of work is to return the complete user object with all associated data.`;

export const MOCK_COVER_STATUS = CoverStatus.UNCOVERED;

export const MOCK_TAGS = ['Smoke', 'Regression', 'Payment', 'E2E'];

export const MOCK_EXECUTIONS = [
  { title: '# 70  Regression Instance B', status: ExecutionStatusType.RUNNING },
  { title: '# 24  Stream B API', status: ExecutionStatusType.PASSED },
  { title: '# 15  Smoke Test Suite', status: ExecutionStatusType.FAILED },
];

export const MOCK_SCENARIO: ManualScenario = {
  manualScenarioType: TestCaseManualScenario.STEPS,
  id: 1,
  executionEstimationTime: 960000,
  linkToRequirements: '',
  preconditions: {
    value: 'User is logged in with valid credentials. Shopping cart contains at least one item.',
    attachments: [],
  },
  attributes: [],
  steps: [
    {
      id: 1,
      instructions:
        'Navigate to the shopping cart page and verify all items are displayed correctly.',
      expectedResult:
        'Shopping cart page loads successfully. All items are visible with correct quantities and prices.',
      attachments: [],
      position: 1,
    },
    {
      id: 2,
      instructions:
        'Click on the "Proceed to Checkout" button and fill in the shipping information.',
      expectedResult:
        'Checkout page opens. Shipping form accepts valid input. Continue button becomes active.',
      attachments: [],
      position: 2,
    },
  ],
};
