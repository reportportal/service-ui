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

import { TransformedFolder } from 'controllers/testCase';

// Adding more test cases than this by dropping whole folders asks for confirmation first, because
// every test case of the subtree is downloaded before the add request.
export const LARGE_FOLDER_ADD_THRESHOLD = 1000;

// Test cases in the given folders and all their subfolders (testsCount is per folder).
export const countFolderTestCases = (folders: TransformedFolder[]): number =>
  folders.reduce(
    (total, folder) =>
      total + (folder.testsCount || 0) + countFolderTestCases(folder.folders ?? []),
    0,
  );
