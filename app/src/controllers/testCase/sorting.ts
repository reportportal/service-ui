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

import { getStorageItem, updateStorageItem } from 'common/utils';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting/constants';
import type { SortingDirection } from 'controllers/sorting/types';

// The values are sort criteria of GET /tms/test-case: priorityRank sorts by importance, not by name;
// position is the custom order of a folder, shared by the project
export const TEST_CASE_SORTING_FIELDS = {
  CREATED_AT: 'createdAt',
  NAME: 'name',
  PRIORITY: 'priorityRank',
  LAST_EXECUTION: 'lastExecutionAt',
  CUSTOM_ORDER: 'position',
} as const;

export type TestCaseSortingField =
  (typeof TEST_CASE_SORTING_FIELDS)[keyof typeof TEST_CASE_SORTING_FIELDS];

export interface TestCaseSorting {
  field: TestCaseSortingField;
  direction: SortingDirection;
}

export const TEST_CASE_SORTING_DEFAULT_DIRECTIONS: Record<TestCaseSortingField, SortingDirection> =
  {
    [TEST_CASE_SORTING_FIELDS.CREATED_AT]: SORTING_DESC,
    [TEST_CASE_SORTING_FIELDS.NAME]: SORTING_ASC,
    [TEST_CASE_SORTING_FIELDS.PRIORITY]: SORTING_DESC,
    [TEST_CASE_SORTING_FIELDS.LAST_EXECUTION]: SORTING_DESC,
    [TEST_CASE_SORTING_FIELDS.CUSTOM_ORDER]: SORTING_ASC,
  };

// Default in "All test cases"
export const DEFAULT_TEST_CASE_SORTING: TestCaseSorting = {
  field: TEST_CASE_SORTING_FIELDS.CREATED_AT,
  direction: SORTING_DESC,
};

// Default inside a folder. Custom order has one direction only.
export const DEFAULT_FOLDER_TEST_CASE_SORTING: TestCaseSorting = {
  field: TEST_CASE_SORTING_FIELDS.CUSTOM_ORDER,
  direction: SORTING_ASC,
};

const TEST_CASE_SORTING_STORAGE_KEY = 'testCaseListSorting';

const getUserSettingsKey = (userId: string | number) => `${userId}_settings`;

const isSortingField = (value: unknown): value is TestCaseSortingField =>
  Object.values(TEST_CASE_SORTING_FIELDS).includes(value as TestCaseSortingField);

const isSortingDirection = (value: unknown): value is SortingDirection =>
  value === SORTING_ASC || value === SORTING_DESC;

export const getSavedTestCaseSorting = (
  userId?: string | number | null,
): TestCaseSorting | null => {
  if (!userId) {
    return null;
  }

  const settings = getStorageItem(getUserSettingsKey(userId)) as Record<string, unknown> | null;
  const saved = settings?.[TEST_CASE_SORTING_STORAGE_KEY] as Partial<TestCaseSorting> | undefined;

  if (!isSortingField(saved?.field) || !isSortingDirection(saved?.direction)) {
    return null;
  }

  return { field: saved.field, direction: saved.direction };
};

/**
 * The sorting the list uses. One saved value for the whole library: inside a folder nothing saved
 * means Custom order; "All test cases" does not offer Custom order and uses Creation date then,
 * without changing the saved value.
 */
export const resolveTestCaseSorting = (
  saved: TestCaseSorting | null,
  isFolder: boolean,
): TestCaseSorting => {
  const isCustomOrder = saved?.field === TEST_CASE_SORTING_FIELDS.CUSTOM_ORDER;

  if (!isFolder) {
    return !saved || isCustomOrder ? DEFAULT_TEST_CASE_SORTING : saved;
  }

  return !saved || isCustomOrder ? DEFAULT_FOLDER_TEST_CASE_SORTING : saved;
};

export const getTestCaseSorting = (
  userId?: string | number | null,
  isFolder = false,
): TestCaseSorting => resolveTestCaseSorting(getSavedTestCaseSorting(userId), isFolder);

export const isCustomOrderSorting = ({ field }: TestCaseSorting): boolean =>
  field === TEST_CASE_SORTING_FIELDS.CUSTOM_ORDER;

export const saveTestCaseSorting = (userId: string | number, sorting: TestCaseSorting): void => {
  updateStorageItem(getUserSettingsKey(userId), { [TEST_CASE_SORTING_STORAGE_KEY]: sorting });
};

export const getTestCaseSortParam = ({ field, direction }: TestCaseSorting): string =>
  `${field},${direction}`;
