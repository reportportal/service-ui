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

import {
  clearUnsavedTestCaseSorting,
  DEFAULT_FOLDER_TEST_CASE_SORTING,
  DEFAULT_TEST_CASE_SORTING,
  getTestCaseSorting,
  getTestCaseSortParam,
  isCustomOrderSorting,
  resolveTestCaseSorting,
  saveTestCaseSorting,
  TEST_CASE_SORTING_DEFAULT_DIRECTIONS,
} from './sorting';

describe('test case list sorting', () => {
  const userId = 'user-1';
  const settingsKey = `${userId}_settings`;

  beforeEach(() => {
    localStorage.clear();
    clearUnsavedTestCaseSorting();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns Creation date, newest first, when nothing is saved', () => {
    expect(getTestCaseSorting(userId)).toEqual({ field: 'createdAt', direction: 'DESC' });
    expect(getTestCaseSorting(undefined)).toEqual(DEFAULT_TEST_CASE_SORTING);
  });

  it('saves the option next to the other user settings and reads it back', () => {
    localStorage.setItem(settingsKey, JSON.stringify({ testCaseListPageSize: 20 }));

    saveTestCaseSorting(userId, { field: 'name', direction: 'ASC' });

    expect(JSON.parse(localStorage.getItem(settingsKey))).toEqual({
      testCaseListPageSize: 20,
      testCaseListSorting: { field: 'name', direction: 'ASC' },
    });
    expect(getTestCaseSorting(userId)).toEqual({ field: 'name', direction: 'ASC' });
  });

  it('falls back to the default for an option that is not supported', () => {
    localStorage.setItem(
      settingsKey,
      JSON.stringify({ testCaseListSorting: { field: 'customOrder', direction: 'ASC' } }),
    );
    expect(getTestCaseSorting(userId)).toEqual(DEFAULT_TEST_CASE_SORTING);

    localStorage.setItem(
      settingsKey,
      JSON.stringify({ testCaseListSorting: { field: 'name', direction: 'up' } }),
    );
    expect(getTestCaseSorting(userId)).toEqual(DEFAULT_TEST_CASE_SORTING);
  });

  it('keeps the selected option when it cannot be saved', () => {
    saveTestCaseSorting(userId, { field: 'name', direction: 'ASC' });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });

    expect(() =>
      saveTestCaseSorting(userId, { field: 'createdAt', direction: 'ASC' }),
    ).not.toThrow();
    expect(getTestCaseSorting(userId)).toEqual({ field: 'createdAt', direction: 'ASC' });
    expect(getTestCaseSorting('user-2')).toEqual(DEFAULT_TEST_CASE_SORTING);

    jest.restoreAllMocks();
    saveTestCaseSorting(userId, { field: 'name', direction: 'DESC' });
    localStorage.setItem(
      settingsKey,
      JSON.stringify({ testCaseListSorting: { field: 'name', direction: 'ASC' } }),
    );

    expect(getTestCaseSorting(userId)).toEqual({ field: 'name', direction: 'ASC' });
  });

  it('builds the sort parameter of GET /tms/test-case', () => {
    expect(getTestCaseSortParam({ field: 'name', direction: 'DESC' })).toBe('name,DESC');
  });

  it('reads Priority and Last execution date back and sends their API sort criteria', () => {
    saveTestCaseSorting(userId, { field: 'priorityRank', direction: 'DESC' });
    expect(getTestCaseSorting(userId)).toEqual({ field: 'priorityRank', direction: 'DESC' });

    saveTestCaseSorting(userId, { field: 'lastExecutionAt', direction: 'ASC' });
    expect(getTestCaseSortParam(getTestCaseSorting(userId))).toBe('lastExecutionAt,ASC');
  });

  it('starts Priority with the most important and Last execution date with the newest', () => {
    expect(TEST_CASE_SORTING_DEFAULT_DIRECTIONS).toEqual({
      createdAt: 'DESC',
      name: 'ASC',
      priorityRank: 'DESC',
      lastExecutionAt: 'DESC',
      position: 'ASC',
    });
  });

  it('uses Custom order inside a folder when nothing is saved', () => {
    expect(getTestCaseSorting(userId, true)).toEqual({ field: 'position', direction: 'ASC' });
    expect(getTestCaseSorting(undefined, true)).toEqual(DEFAULT_FOLDER_TEST_CASE_SORTING);
    expect(getTestCaseSortParam(getTestCaseSorting(userId, true))).toBe('position,ASC');
  });

  it('keeps a saved Custom order but uses Creation date in All test cases', () => {
    saveTestCaseSorting(userId, { field: 'position', direction: 'ASC' });

    expect(getTestCaseSorting(userId, true)).toEqual({ field: 'position', direction: 'ASC' });
    expect(getTestCaseSorting(userId, false)).toEqual(DEFAULT_TEST_CASE_SORTING);
    expect(JSON.parse(localStorage.getItem(settingsKey))).toEqual({
      testCaseListSorting: { field: 'position', direction: 'ASC' },
    });
  });

  it('uses the saved option in folders and in All test cases alike', () => {
    const name = { field: 'name', direction: 'DESC' } as const;

    expect(resolveTestCaseSorting(name, true)).toEqual(name);
    expect(resolveTestCaseSorting(name, false)).toEqual(name);
  });

  it('always sends Custom order ascending', () => {
    expect(resolveTestCaseSorting({ field: 'position', direction: 'DESC' }, true)).toEqual(
      DEFAULT_FOLDER_TEST_CASE_SORTING,
    );
    expect(isCustomOrderSorting(DEFAULT_FOLDER_TEST_CASE_SORTING)).toBe(true);
    expect(isCustomOrderSorting(DEFAULT_TEST_CASE_SORTING)).toBe(false);
  });
});
