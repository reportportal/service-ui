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

import { FolderWithFullPath } from 'controllers/testCase/types';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { Page } from 'types/common';

// Going to be resolved to id by folder name with UI search control
// Currently directly accepts id from name input
export const coerceToNumericId = (value: unknown): number | undefined => {
  if (value == null || value === '') return undefined;
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

export const findFolderById = (
  folders: FolderWithFullPath[],
  folderId?: number,
): FolderWithFullPath | undefined => {
  if (!folderId) {
    return undefined;
  }

  return folders.find((folder) => folder.id === folderId);
};

export const getTestCaseRequestParams = (
  testCasesPageData: Page,
): {
  offset: number;
  limit: number;
} => {
  if (testCasesPageData) {
    return {
      offset: (testCasesPageData?.number - 1) * testCasesPageData?.size,
      limit: testCasesPageData?.size,
    };
  }

  return {
    offset: TestCasePageDefaultValues.offset,
    limit: TestCasePageDefaultValues.limit,
  };
};
