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

import { getDuplicationFailure } from './duplicationResult';

describe('getDuplicationFailure', () => {
  const folder = { id: 2, name: 'Copy', parentFolderId: null, countOfTestCases: 0 };

  test('returns null when everything was duplicated', () => {
    expect(
      getDuplicationFailure({
        ...folder,
        testCaseDuplicationStatistic: { totalCount: 3, successCount: 3, failureCount: 0 },
      }),
    ).toBeNull();
  });

  test('sums failures of test cases and subfolders with their messages', () => {
    expect(
      getDuplicationFailure({
        ...folder,
        testCaseDuplicationStatistic: {
          totalCount: 500,
          successCount: 488,
          failureCount: 12,
          errors: [{ testCaseId: 5, errorMessage: 'Name is too long' }],
        },
        folderDuplicationStatistic: { totalCount: 2, successCount: 2, failureCount: 0 },
      }),
    ).toEqual({ successCount: 490, totalCount: 502, failureCount: 12, errors: 'Name is too long' });
  });
});
