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

import { IScenario } from 'pages/inside/testCaseLibraryPage/types';
import { StepData } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/testCaseDetails';
import { FilterOption } from './types';

export const STATUS_TYPES = {
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNSPECIFIED: 'unspecified',
} as const;

export const ITEMS_PER_PAGE_OPTIONS: number[] = [10, 25, 50, 100];

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Blocker', value: STATUS_TYPES.BLOCKER },
  { label: 'Critical', value: STATUS_TYPES.CRITICAL },
  { label: 'High Priority', value: STATUS_TYPES.HIGH },
  { label: 'Medium Priority', value: STATUS_TYPES.MEDIUM },
  { label: 'Low Priority', value: STATUS_TYPES.LOW },
  { label: 'Unspecified', value: STATUS_TYPES.UNSPECIFIED },
];

export const mockedTestCaseDescription =
  'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works. Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works';

export const mockedScenarios: IScenario[] = [
  {
    id: '1',
    precondition:
      'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works',
    instruction: '',
    expectedResult: '',
    attachments: [],
  },
  {
    id: '2',
    precondition:
      'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works',
    instruction: '',
    expectedResult: '',
    attachments: [
      { fileName: 'Slack_plugin.jar', size: 128 },
      { fileName: 'RALLY_plugin.jar', size: 62 },
      { fileName: 'Screenshot 2023-09-08 at 16.23.58.png', size: 0.6 },
      { fileName: 'Jira_plugin.jar', size: 12 },
    ],
  },
  {
    id: '3',
    precondition:
      'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works',
    instruction:
      'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works an always immediately view where things are going wrong. In this example there is a basic method called',
    expectedResult:
      'Example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works',
    attachments: [],
  },
];

export const mockedStepsData: StepData[] = [
  {
    id: '1',
    instructions: 'Open the web application login page in a supported browser',
    expectedResult: 'The login page loads correctly with fields for username and password visible',
  },
  {
    id: '2',
    instructions: 'Enter a valid username in the username field',
    expectedResult: 'The username appears in the field as entered, with no input errors',
  },
  {
    id: '3',
    instructions: 'Enter a valid password in the password field',
    expectedResult: '',
  },
  {
    id: '4',
    instructions: "Click the 'Login' button",
    expectedResult:
      'The system processes the input and navigates to the user dashboard if the credentials are correct',
  },
  {
    id: '5',
    instructions: '',
    expectedResult:
      'The user dashboard loads and displays the correct personalized information without errors the basic functionality',
  },
];
