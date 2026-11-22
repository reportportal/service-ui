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

import { TestCase } from 'types/testCase';

import { FolderTestCases } from '../testLibraryPanelContext';
import { TestCasesResponse } from './fetchAllTestCases';
import { isFolderFullyCached } from './isFolderFullyCached';

// Merges a fetched page into the latest cache entry. A folder batch fetch (checkbox, drop) may have
// cached the complete folder while the page was in flight: a partial page must not replace it.
export const mergeFolderPage = (
  current: FolderTestCases,
  response: TestCasesResponse,
  isFirstPage: boolean,
  testPlanTestCases: TestCase[] | null,
): Partial<FolderTestCases> => {
  if (isFolderFullyCached(current)) {
    return {};
  }

  const addedToTestPlanIds =
    testPlanTestCases !== null
      ? new Set<number>(testPlanTestCases.map((testCase) => testCase.id))
      : current.addedToTestPlanIds;

  return {
    testCases: [...current.testCases, ...response.content],
    page: response.page,
    ...(isFirstPage && { addedToTestPlanIds }),
  };
};
