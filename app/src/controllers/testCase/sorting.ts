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

// TODO: add Custom order (EPMRPP-115683) when the backend supports it
// The values are sort criteria of GET /tms/test-case: priorityRank sorts by importance, not by name
export const TEST_CASE_SORTING_FIELDS = {
  CREATED_AT: 'createdAt',
  NAME: 'name',
  PRIORITY: 'priorityRank',
  LAST_EXECUTION: 'lastExecutionAt',
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
  };

export const DEFAULT_TEST_CASE_SORTING: TestCaseSorting = {
  field: TEST_CASE_SORTING_FIELDS.CREATED_AT,
  direction: SORTING_DESC,
};

const TEST_CASE_SORTING_STORAGE_KEY = 'testCaseListSorting';

export const getUserSettingsKey = (userId: string | number) => `${userId}_settings`;

// The last option that could not be saved (e.g. the storage quota is full). It is used until the next
// successful save or a change made in another tab, so the list and the control keep the selected option.
let unsavedSorting: { userId: string; sorting: TestCaseSorting } | null = null;

export const clearUnsavedTestCaseSorting = (): void => {
  unsavedSorting = null;
};

const isSortingField = (value: unknown): value is TestCaseSortingField =>
  Object.values(TEST_CASE_SORTING_FIELDS).includes(value as TestCaseSortingField);

const isSortingDirection = (value: unknown): value is SortingDirection =>
  value === SORTING_ASC || value === SORTING_DESC;

export const getTestCaseSorting = (userId?: string | number | null): TestCaseSorting => {
  if (!userId) {
    return DEFAULT_TEST_CASE_SORTING;
  }

  if (unsavedSorting?.userId === String(userId)) {
    return unsavedSorting.sorting;
  }

  const settings = getStorageItem(getUserSettingsKey(userId)) as Record<string, unknown> | null;
  const saved = settings?.[TEST_CASE_SORTING_STORAGE_KEY] as Partial<TestCaseSorting> | undefined;

  if (!isSortingField(saved?.field) || !isSortingDirection(saved?.direction)) {
    return DEFAULT_TEST_CASE_SORTING;
  }

  return { field: saved.field, direction: saved.direction };
};

export const saveTestCaseSorting = (userId: string | number, sorting: TestCaseSorting): void => {
  try {
    updateStorageItem(getUserSettingsKey(userId), { [TEST_CASE_SORTING_STORAGE_KEY]: sorting });
    unsavedSorting = null;
  } catch {
    unsavedSorting = { userId: String(userId), sorting };
  }
};

export const getTestCaseSortParam = ({ field, direction }: TestCaseSorting): string =>
  `${field},${direction}`;
