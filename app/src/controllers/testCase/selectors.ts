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

import { createSelector } from 'reselect';

import { transformFoldersToDisplay } from 'common/utils/folderUtils';
import { transformFoldersWithFullPath } from 'controllers/testCase/utils';
import { ExtendedTestCase, TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';
import { Folder } from './types';
import { InitialStateType } from './reducer';

export interface TestCaseState {
  folders?: {
    data?: Folder[];
    isCreatingFolder?: boolean;
    isLoadingFolder?: boolean;
    activeFolderId?: number | null;
    expandedFolderIds?: number[];
    loading?: boolean;
    areFoldersFetched?: boolean;
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

interface RootState {
  testCase?: TestCaseState & InitialStateType;
}

export const testCaseSelector = (state: RootState): TestCaseState => state.testCase || {};

export const areFoldersLoadingSelector = (state: RootState): boolean =>
  testCaseSelector(state).folders?.loading || false;

export const EMPTY_FOLDERS: Folder[] = [];

export const foldersSelector = (state: RootState): Folder[] =>
  testCaseSelector(state).folders?.data || EMPTY_FOLDERS;

export const isCreatingFolderSelector = (state: RootState): boolean =>
  testCaseSelector(state).folders?.isCreatingFolder || false;

export const isLoadingFolderSelector = (state: RootState): boolean =>
  testCaseSelector(state).folders?.isLoadingFolder || false;

export const expandedFolderIdsSelector = (state: RootState): number[] =>
  testCaseSelector(state).folders?.expandedFolderIds || [];

export const isLoadingTestCasesSelector = (state: RootState) =>
  state.testCase?.testCases?.isLoading || false;

export const testCasesSelector = (state: RootState): TestCase[] =>
  state.testCase?.testCases?.list || [];

export const testCasesPageSelector = (state: RootState): Page | null =>
  state.testCase?.testCases?.page || null;

export const testCaseDetailsSelector = (state: RootState) => state.testCase?.details?.data;

export const isLoadingTestCaseDetailsSelector = (state: RootState) => state.testCase?.details?.loading || false;

export const transformedFoldersSelector = createSelector(
  foldersSelector,
  transformFoldersToDisplay,
);

export const transformedFoldersWithFullPathSelector = createSelector(
  foldersSelector,
  transformFoldersWithFullPath,
);

export const areFoldersFetchedSelector = (state: RootState): boolean =>
  testCaseSelector(state).folders?.areFoldersFetched || false;
