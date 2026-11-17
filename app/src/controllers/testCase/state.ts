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

import { Page } from 'types/common';
import type { ExtendedTestCase, TestCase } from 'types/testCase';

import { Folder } from './types';

export interface TestCaseState {
  folders?: {
    data?: Folder[];
    isCreatingFolder?: boolean;
    isLoadingFolder?: boolean;
    activeFolderId?: number | null;
    expandedFolderIds?: number[];
    loading?: boolean;
    areFoldersFetched?: boolean;
    filteredFolders?: Folder[];
    isLoadingFilteredFolders?: boolean;
  };
  testCases?: {
    isLoading?: boolean;
    list?: TestCase[];
    page: Page | null;
  };
  details?: {
    data?: ExtendedTestCase;
    loading: boolean;
  };
}
