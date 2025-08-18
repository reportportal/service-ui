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

export type HistoryOfActions = {
  time: number;
  user: {
    name: string;
    id?: number;
  };
  action: string;
  oldValue: string;
  newValue: string;
}[];

export const historyOfActions: HistoryOfActions = [
  {
    time: 1755092205194,
    user: {
      name: 'Amarai Shakhtasei',
      id: 3,
    },
    action: 'Edited Expected result',
    oldValue:
      'The "User Profile" section should be fully accessible, with all features and settings functioning smoothly without errors. Navigation should be intuitive, with a consistent user interface throughout.  If issues are found, they should be documented for further investigation and resolution.',
    newValue:
      'The "User Profile" section should be fully accessible, with all features and settings functioning smoothly without errors. Navigation should be intuitive, with a consistent user interface throughout. Any modifications or inputs made in this section should save correctly, and no unexpected behavior or inconsistencies should occur. If issues are found, they should be documented for further investigation and resolution.',
  },
  {
    time: 1754917125194,
    user: {
      name: 'Amarai Shakhtasei',
    },
    action: 'Added Steps',
    oldValue: '',
    newValue: 'Step 1, Step2, Step 3, Step 4, Step 5, Step 6, Step 7, Step 8',
  },
  {
    time: 1754307525194,
    user: {
      name: 'Amarai Shakhtasei',
      id: 3,
    },
    action: 'Added Precondition',
    oldValue: '',
    newValue:
      'The user must have a valid username and password. The web application must be accessible and running in a browser',
  },
  {
    time: 1754261925194,
    user: {
      name: 'Amarai Shakhtasei',
    },
    action: 'Changed Priority',
    oldValue: 'Major',
    newValue: 'Minor',
  },
  {
    time: 1753712325194,
    user: {
      name: 'Amarai Shakhtasei',
      id: 3,
    },
    action: 'Added requirements link',
    oldValue: '',
    newValue: 'https://jira.eu.com/97238_322_1225234433',
  },
  {
    time: 1753642725194,
    user: {
      name: 'Amarai Shakhtasei',
    },
    action: 'Added Description',
    oldValue: '',
    newValue:
      'Ideally you should have a test method for each separate unit of work so you can always immediately view where things are going wrong. In this example there is a basic method called getUserById() which will return a user and there is a total of 3 unit of works',
  },
  {
    time: 1749908325194,
    user: {
      name: 'Amarai Shakhtasei',
      id: 3,
    },
    action: 'Created Test Case',
    oldValue: '',
    newValue: '',
  },
];
