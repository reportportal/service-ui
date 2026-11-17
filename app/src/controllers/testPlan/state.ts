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

import type { TestPlanDto, TestPlanFoldersDto, TestPlanTestCaseDto } from './types';

export interface TestPlanState {
  data: {
    content: TestPlanDto[] | null;
    page: Page | null;
  };
  isLoading?: boolean;
  activeTestPlan?: TestPlanDto | null;
  testPlanFolders?: TestPlanFoldersDto | null;
  testPlanTestCases?: TestPlanTestCaseDto | null;
  isLoadingActive?: boolean;
  isLoadingTestPlanTestCases?: boolean;
  expandedFolderIds?: number[];
}
