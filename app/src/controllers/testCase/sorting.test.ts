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
  DEFAULT_TEST_CASE_SORTING,
  getTestCaseSorting,
  getTestCaseSortParam,
  saveTestCaseSorting,
} from './sorting';

describe('test case list sorting', () => {
  const userId = 'user-1';
  const settingsKey = `${userId}_settings`;

  beforeEach(() => {
    localStorage.clear();
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

  it('builds the sort parameter of GET /tms/test-case', () => {
    expect(getTestCaseSortParam({ field: 'name', direction: 'DESC' })).toBe('name,DESC');
  });
});
