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

import { Lifecycle } from 'types/aiFactory';
import { TestCase } from 'types/testCase';
import { resetMockDb } from './db';
import {
  countReviewQueueCases,
  filterCompleteTestCaseList,
  isReviewQueueCountRequest,
  parseLibraryFilters,
} from './libraryFilters';

const testCase = (displayId: string): TestCase => ({
  id: Number(displayId.replace(/\D/g, '')),
  displayId,
  name: displayId,
  createdAt: 0,
  updatedAt: 0,
  path: [],
  testFolder: { id: 1 },
});

const seededCases = (): TestCase[] =>
  ['TC101', 'TC102', 'TC103', 'TC104', 'TC105', 'TC106', 'TC107', 'TC108'].map(testCase);

const completeList = (content = seededCases()) => ({
  content,
  page: { number: 1, size: 20, totalElements: content.length, totalPages: 1 },
});

const displayIds = (content: TestCase[]) => content.map(({ displayId }) => displayId);

beforeEach(() => resetMockDb());

describe('parseLibraryFilters', () => {
  test('parses C3 params from the Axios params object', () => {
    expect(
      parseLibraryFilters({
        params: {
          'filter.eq.lifecycle': 'DRAFT',
          'filter.eq.ai': true,
          'filter.eq.iterationId': 101,
        },
      }),
    ).toEqual({ lifecycle: Lifecycle.DRAFT, ai: true, iterationId: 101 });
  });

  test('accepts URL-facing AI values and query-string params', () => {
    expect(
      parseLibraryFilters({
        url: '/tms/test-case?filter.eq.lifecycle=READY&filter.eq.ai=NO_AI&filter.eq.iterationId=102',
      }),
    ).toEqual({ lifecycle: Lifecycle.READY, ai: false, iterationId: 102 });
  });

  test('ignores malformed values', () => {
    expect(
      parseLibraryFilters({
        params: {
          'filter.eq.lifecycle': 'APPROVED',
          'filter.eq.ai': 'yes',
          'filter.eq.iterationId': '-1.5',
        },
      }),
    ).toEqual({ lifecycle: undefined, ai: undefined, iterationId: undefined });
  });
});

describe('filterCompleteTestCaseList', () => {
  test.each([
    [Lifecycle.DRAFT, ['TC103', 'TC104', 'TC106', 'TC107', 'TC108']],
    [Lifecycle.READY, ['TC101', 'TC102', 'TC105']],
  ])('filters by %s lifecycle', (lifecycle, expected) => {
    const result = filterCompleteTestCaseList(completeList(), { lifecycle });

    expect(displayIds(result.content)).toEqual(expected);
  });

  test('filters AI and non-AI cases', () => {
    const list = completeList([...seededCases(), testCase('TC999')]);

    expect(filterCompleteTestCaseList(list, { ai: true }).content).toHaveLength(8);
    expect(displayIds(filterCompleteTestCaseList(list, { ai: false }).content)).toEqual(['TC999']);
  });

  test('filters by generation iteration', () => {
    const result = filterCompleteTestCaseList(completeList(), { iterationId: 102 });

    expect(displayIds(result.content)).toEqual(['TC105', 'TC106', 'TC107', 'TC108']);
  });

  test('combines lifecycle, AI and iteration filters with AND', () => {
    const result = filterCompleteTestCaseList(completeList(), {
      lifecycle: Lifecycle.DRAFT,
      ai: true,
      iterationId: 101,
    });

    expect(displayIds(result.content)).toEqual(['TC103', 'TC104']);
    expect(result.page).toEqual({ number: 1, size: 20, totalElements: 2, totalPages: 1 });
  });

  test('keeps an incomplete backend page unchanged to preserve truthful pagination', () => {
    const list = {
      content: [testCase('TC101'), testCase('TC103')],
      page: { number: 0, size: 2, totalElements: 8, totalPages: 4 },
    };

    expect(filterCompleteTestCaseList(list, { lifecycle: Lifecycle.DRAFT })).toBe(list);
  });

  test('recomputes empty-result pagination metadata', () => {
    const result = filterCompleteTestCaseList(completeList(), {
      lifecycle: Lifecycle.READY,
      ai: false,
    });

    expect(result.content).toEqual([]);
    expect(result.page).toEqual({ number: 1, size: 20, totalElements: 0, totalPages: 0 });
  });
});

describe('countReviewQueueCases', () => {
  test('counts Draft AI cases globally and for one iteration', () => {
    expect(countReviewQueueCases(seededCases())).toBe(5);
    expect(countReviewQueueCases(seededCases(), 101)).toBe(2);
    expect(countReviewQueueCases(seededCases(), 102)).toBe(3);
  });
});

describe('isReviewQueueCountRequest', () => {
  const filters = { lifecycle: Lifecycle.DRAFT, ai: true };

  test('recognizes only the dedicated unscoped count request', () => {
    const config = {
      method: 'get',
      url: '/tms/test-case?limit=1&offset=0&filter.eq.lifecycle=DRAFT&filter.eq.ai=true',
    };

    expect(isReviewQueueCountRequest(config, filters)).toBe(true);
  });

  test.each([
    ['a folder scope', { 'filter.eq.testFolderId': 42 }],
    ['a name filter', { 'filter.cnt.name': 'login' }],
    ['a different page size', { limit: 20 }],
  ])('rejects a request with %s', (_description, extraParams) => {
    const config = {
      method: 'get',
      url: '/tms/test-case',
      params: {
        limit: 1,
        offset: 0,
        'filter.eq.lifecycle': 'DRAFT',
        'filter.eq.ai': true,
        ...extraParams,
      },
    };

    expect(isReviewQueueCountRequest(config, filters)).toBe(false);
  });

  test('rejects an iteration-scoped review request', () => {
    expect(
      isReviewQueueCountRequest(
        {
          method: 'get',
          url: '/tms/test-case',
          params: {
            limit: 1,
            'filter.eq.lifecycle': 'DRAFT',
            'filter.eq.ai': true,
            'filter.eq.iterationId': 101,
          },
        },
        { ...filters, iterationId: 101 },
      ),
    ).toBe(false);
  });
});
