/*
 * Copyright 2022 EPAM Systems
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

import { NEXT, PREVIOUS, ALL } from 'controllers/log';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { PAGINATION_OFFSET, MAX_PAGE_SIZE } from 'controllers/log/nestedSteps/constants';
import {
  getDirectedPagination,
  isLoadCurrentStepButtonVisible,
  isLoadMoreButtonVisible,
  isLoadPreviousButtonVisible,
  mergeNestedStepPage,
} from './utils';

describe('nestedSteps/utils', () => {
  describe('isLoadMoreButtonVisible', () => {
    test('isLoadMoreButtonVisible return false if called without arguments', () => {
      expect(isLoadMoreButtonVisible()).toBe(false);
    });
    test('isLoadMoreButtonVisible return false if passed argument is empty object', () => {
      expect(isLoadMoreButtonVisible({})).toBe(false);
    });
    test('isLoadMoreButtonVisible return false if current page is equal to total pages', () => {
      expect(isLoadMoreButtonVisible({ number: 1, totalPages: 1 })).toBe(false);
    });
    test('isLoadMoreButtonVisible return true if current page is not last page', () => {
      expect(isLoadMoreButtonVisible({ number: 1, totalPages: 2 })).toBe(true);
    });
  });

  describe('isLoadPreviousButtonVisible', () => {
    test('isLoadPreviousButtonVisible return false if called without arguments', () => {
      expect(isLoadPreviousButtonVisible()).toBe(false);
    });
    test('isLoadPreviousButtonVisible return false if passed argument is empty object', () => {
      expect(isLoadPreviousButtonVisible({})).toBe(false);
    });
    test('isLoadPreviousButtonVisible return false if current page is first page', () => {
      expect(isLoadPreviousButtonVisible({ number: 1 })).toBe(false);
    });
    test('isLoadPreviousButtonVisible return true if current page is not first page', () => {
      expect(isLoadPreviousButtonVisible({ number: 2 })).toBe(true);
    });
  });

  describe('isLoadCurrentStepButtonVisible', () => {
    const step = { id: '1', hasContent: true };
    const nestedSteps = { 1: { content: [], page: {} } };
    test('isLoadCurrentStepButtonVisible return true if called without arguments', () => {
      expect(isLoadCurrentStepButtonVisible()).toBe(true);
    });
    test('isLoadCurrentStepButtonVisible return true if passed argument is empty object', () => {
      expect(isLoadCurrentStepButtonVisible({})).toBe(true);
    });
    test('isLoadCurrentStepButtonVisible return true if not all elements are loaded', () => {
      expect(isLoadCurrentStepButtonVisible({ size: 1, totalElements: 5 }, step, nestedSteps)).toBe(
        true,
      );
    });
    test('isLoadCurrentStepButtonVisible return false if all elements are loaded', () => {
      expect(isLoadCurrentStepButtonVisible({ size: 2, totalElements: 2 }, step, nestedSteps)).toBe(
        false,
      );
    });
  });

  describe('getDirectedPagination', () => {
    test('getDirectedPagination requests only the page before the first loaded one', () => {
      const page = { number: 4, firstNumber: 2, size: 300 };
      const expectedPage = { [PAGE_KEY]: 1, [SIZE_KEY]: PAGINATION_OFFSET };
      expect(getDirectedPagination(page, PREVIOUS)).toEqual(expectedPage);
    });
    test('getDirectedPagination requests only the next page of 300 items', () => {
      const page = { number: 1, size: 300, totalElements: 5000 };
      const expectedPage = { [PAGE_KEY]: 2, [SIZE_KEY]: PAGINATION_OFFSET };
      expect(getDirectedPagination(page, NEXT)).toEqual(expectedPage);
    });
    test('getDirectedPagination requests the first page of 300 items for a new step', () => {
      expect(getDirectedPagination({}, NEXT)).toEqual({
        [PAGE_KEY]: 1,
        [SIZE_KEY]: PAGINATION_OFFSET,
      });
    });
    test('getDirectedPagination return correct obj to load NEXT items, with provided next page', () => {
      const page = { number: 1, size: 2, totalElements: 5 };
      const expectedPage = { [PAGE_KEY]: 2, [SIZE_KEY]: PAGINATION_OFFSET };
      expect(getDirectedPagination(page, NEXT, 2)).toEqual(expectedPage);
    });
    test('getDirectedPagination loads ALL items in bounded pages', () => {
      const page = { number: 1, size: 2, totalElements: 50000 };
      const expectedPage = { [PAGE_KEY]: 1, [SIZE_KEY]: MAX_PAGE_SIZE };
      expect(getDirectedPagination(page, ALL)).toEqual(expectedPage);
      expect(MAX_PAGE_SIZE).toBeLessThanOrEqual(1000);
    });
  });

  describe('mergeNestedStepPage', () => {
    const current = {
      content: [{ id: 1 }],
      page: { number: 2, firstNumber: 2, size: 300, totalPages: 4, loaded: 1 },
    };

    test('appends the next page and keeps the first loaded page', () => {
      const response = { content: [{ id: 2 }], page: { number: 3, size: 300, totalPages: 4 } };
      expect(mergeNestedStepPage(current, response, NEXT)).toEqual({
        content: [{ id: 1 }, { id: 2 }],
        page: { number: 3, firstNumber: 2, size: 300, totalPages: 4, loaded: 2 },
      });
    });

    test('prepends the previous page and keeps the last loaded page', () => {
      const response = { content: [{ id: 0 }], page: { number: 1, size: 300, totalPages: 4 } };
      const result = mergeNestedStepPage(current, response, PREVIOUS);
      expect(result.content).toEqual([{ id: 0 }, { id: 1 }]);
      expect(result.page.number).toBe(2);
      expect(result.page.firstNumber).toBe(1);
      expect(isLoadPreviousButtonVisible(result.page)).toBe(false);
    });

    test('replaces the content when a specific page is requested', () => {
      const response = { content: [{ id: 9 }], page: { number: 4, size: 300, totalPages: 4 } };
      expect(mergeNestedStepPage(current, response, NEXT, 4)).toEqual({
        content: [{ id: 9 }],
        page: { number: 4, firstNumber: 4, size: 300, totalPages: 4, loaded: 1 },
      });
    });

    test('marks the whole step as loaded after ALL', () => {
      const response = {
        content: [{ id: 1 }, { id: 2 }],
        page: { number: 2, size: 1, totalPages: 2, totalElements: 2 },
      };
      const { page } = mergeNestedStepPage(current, response, ALL);
      expect(isLoadPreviousButtonVisible(page)).toBe(false);
      expect(isLoadMoreButtonVisible(page)).toBe(false);
      expect(isLoadCurrentStepButtonVisible(page, { id: 'x' }, {})).toBe(false);
    });
  });
});
