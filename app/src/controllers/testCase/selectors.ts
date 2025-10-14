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

import {
  transformFoldersToDisplay,
  transformFoldersWithFullPath,
} from 'controllers/testCase/utils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Folder } from './types';
import { InitialStateType } from './reducer';

export interface TestCaseState {
  folders?: {
    data?: Folder[];
    isCreatingFolder?: boolean;
    isLoadingFolder?: boolean;
    loading?: boolean;
  };
  testCases?: {
    isLoading?: boolean;
    list?: unknown[];
  };
  details?: {
    data?: TestCase;
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

export const isLoadingTestCasesSelector = (state: RootState) =>
  state.testCase?.testCases?.isLoading || false;

export const testCasesSelector = (state: RootState) => state.testCase?.testCases?.list || [];

export const testCaseDetailsSelector = (state: RootState) => state.testCase?.details?.data;

export const transformedFoldersSelector = createSelector(
  foldersSelector,
  transformFoldersToDisplay,
);

export const transformedFoldersWithFullPathSelector = createSelector(
  foldersSelector,
  transformFoldersWithFullPath,
);

export const needsToLoadFoldersSelector = createSelector(
  foldersSelector,
  areFoldersLoadingSelector,
  (folders, isLoading): boolean => {
    return folders.length === 0 && !isLoading;
  },
);
