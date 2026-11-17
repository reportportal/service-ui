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

export const mockTestPlanFolders = [
  {
    id: 100,
    name: 'Root Test Folder',
    description: 'Main folder containing all test cases',
    countOfTestCases: 25,
    subFolders: [
      {
        id: 101,
        name: 'Smoke Tests',
        description: 'Critical functionality tests',
        countOfTestCases: 8,
        parentFolderId: 100,
        subFolders: [
          {
            id: 102,
            name: 'Login Tests',
            countOfTestCases: 3,
            parentFolderId: 101,
          },
          {
            id: 103,
            name: 'Navigation Tests',
            countOfTestCases: 5,
            parentFolderId: 101,
          },
        ],
      },
      {
        id: 104,
        name: 'Regression Tests',
        description: 'Full regression test suite',
        countOfTestCases: 17,
        parentFolderId: 100,
      },
    ],
  },
  {
    id: 101,
    name: 'Smoke Tests',
    description: 'Critical functionality tests',
    countOfTestCases: 8,
    parentFolderId: 100,
    subFolders: [
      {
        id: 102,
        name: 'Login Tests',
        countOfTestCases: 3,
        parentFolderId: 101,
      },
      {
        id: 103,
        name: 'Navigation Tests',
        countOfTestCases: 5,
        parentFolderId: 101,
      },
    ],
  },
  {
    id: 102,
    name: 'Login Tests',
    countOfTestCases: 3,
    parentFolderId: 101,
  },
  {
    id: 103,
    name: 'Navigation Tests',
    countOfTestCases: 5,
    parentFolderId: 101,
  },
  {
    id: 104,
    name: 'Regression Tests',
    description: 'Full regression test suite',
    countOfTestCases: 17,
    parentFolderId: 100,
  },
];
