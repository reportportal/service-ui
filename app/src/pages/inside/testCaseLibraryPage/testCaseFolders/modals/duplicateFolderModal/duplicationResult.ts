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

import { readBatchResult } from 'common/utils/apiResponse';
import { Folder } from 'controllers/testCase/types';

export interface DuplicateFolderResponse extends Folder {
  testCaseDuplicationStatistic?: unknown;
  folderDuplicationStatistic?: unknown;
}

export interface DuplicationFailure {
  successCount: number;
  totalCount: number;
  failureCount: number;
  errors: string;
}

const MAX_ERRORS_SHOWN = 3;

// A folder duplicate answers 200 even when some test cases or subfolders were not copied; the
// statistics tell how many failed. Returns null when everything was duplicated.
export const getDuplicationFailure = (
  response: DuplicateFolderResponse,
): DuplicationFailure | null => {
  const results = [response.testCaseDuplicationStatistic, response.folderDuplicationStatistic]
    .filter(Boolean)
    .map((statistic) => readBatchResult(statistic));
  const failureCount = results.reduce((sum, result) => sum + result.failureCount, 0);

  if (!failureCount) {
    return null;
  }

  return {
    successCount: results.reduce((sum, result) => sum + result.successCount, 0),
    totalCount: results.reduce((sum, result) => sum + result.totalCount, 0),
    failureCount,
    errors: results
      .flatMap((result) => result.errors.map(({ message }) => message))
      .filter(Boolean)
      .slice(0, MAX_ERRORS_SHOWN)
      .join('; '),
  };
};
