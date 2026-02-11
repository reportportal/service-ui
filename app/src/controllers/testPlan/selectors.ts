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
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';

import { EMPTY_FOLDERS } from '../testCase';
import { transformFoldersToDisplay } from 'common/utils/folderUtils';
import { TestPlanDto, TestPlanFoldersDto, TestPlanTestCaseDto } from './constants';

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

interface RootState {
  testPlan?: TestPlanState;
}

export const testPlanSelector = (state: RootState): TestPlanState =>
  state.testPlan || { data: { content: null, page: null } };

export const isLoadingSelector = (state: RootState) => Boolean(testPlanSelector(state).isLoading);

export const testPlansSelector = (state: RootState) => testPlanSelector(state).data?.content;

export const testPlansPageSelector = (state: RootState) => testPlanSelector(state).data?.page;

export const activeTestPlanSelector = (state: RootState) =>
  testPlanSelector(state).activeTestPlan || null;

export const isLoadingActiveSelector = (state: RootState) =>
  Boolean(testPlanSelector(state).isLoadingActive);

export const testPlanFoldersSelector = (state: RootState) =>
  testPlanSelector(state).testPlanFolders?.content || EMPTY_FOLDERS;

export const EMPTY_TEST_CASES: ExtendedTestCase[] = [];

export const testPlanTestCasesSelector = (state: RootState) =>
  testPlanSelector(state).testPlanTestCases?.content || EMPTY_TEST_CASES;

export const testPlanTestCasesPageSelector = (state: RootState) =>
  testPlanSelector(state).testPlanTestCases?.page;

export const testPlanTransformedFoldersSelector = (state: RootState) =>
  transformFoldersToDisplay(testPlanFoldersSelector(state));

export const testPlanExpandedFolderIdsSelector = (state: RootState): number[] =>
  testPlanSelector(state).expandedFolderIds || [];

export const testPlanByIdSelector = (testPlanId: string | number) => (state: RootState) => {
  const activeTestPlan = activeTestPlanSelector(state);

  if (activeTestPlan && activeTestPlan.id === Number(testPlanId)) {
    return activeTestPlan;
  }
};
