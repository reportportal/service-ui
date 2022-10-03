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

import { NEXT, PREVIOUS } from 'controllers/log';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { PAGINATION_OFFSET } from 'controllers/log/nestedSteps/constants';
import {
  getDirectedPagination,
  isLoadCurrentStepButtonVisible,
  isLoadMoreButtonVisible,
  isLoadPreviousButtonVisible,
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
    test('isLoadCurrentStepButtonVisible return true if called without arguments', () => {
      expect(isLoadCurrentStepButtonVisible()).toBe(true);
    });
    test('isLoadCurrentStepButtonVisible return true if passed argument is empty object', () => {
      expect(isLoadCurrentStepButtonVisible({})).toBe(true);
    });
    test('isLoadCurrentStepButtonVisible return true if not all elements are loaded', () => {
      expect(isLoadCurrentStepButtonVisible({ size: 1, totalElements: 5 })).toBe(true);
    });
    test('isLoadCurrentStepButtonVisible return false if all elements are loaded', () => {
      expect(isLoadCurrentStepButtonVisible({ size: 2, totalElements: 2 })).toBe(false);
    });
  });

  describe('getDirectedPagination', () => {
    test('getDirectedPagination return correct obj to load PREVIOUS items', () => {
      const page = { number: 2, size: 2 };
      const expectedPage = { [PAGE_KEY]: 1, [SIZE_KEY]: 2 + PAGINATION_OFFSET };
      expect(getDirectedPagination(page, PREVIOUS)).toEqual(expectedPage);
    });
    test('getDirectedPagination return correct obj to load NEXT items, current size less than totalElements', () => {
      const page = { number: 1, size: 2, totalElements: 3 };
      const expectedPage = { [PAGE_KEY]: 1, [SIZE_KEY]: 3 };
      expect(getDirectedPagination(page, NEXT)).toEqual(expectedPage);
    });
    test('getDirectedPagination return correct obj to load NEXT items, with provided next page', () => {
      const page = { number: 1, size: 2, totalElements: 5 };
      const expectedPage = { [PAGE_KEY]: 2, [SIZE_KEY]: PAGINATION_OFFSET };
      expect(getDirectedPagination(page, NEXT, 2)).toEqual(expectedPage);
    });
    test('getDirectedPagination return correct obj to load ALL items', () => {
      const page = { number: 1, size: 2, totalElements: 5 };
      const expectedPage = { [PAGE_KEY]: 1, [SIZE_KEY]: 5 };
      expect(getDirectedPagination(page)).toEqual(expectedPage);
    });
  });
});
