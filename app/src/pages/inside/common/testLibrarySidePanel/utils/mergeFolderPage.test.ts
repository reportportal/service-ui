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

import { TestCase } from 'types/testCase';

import { mergeFolderPage } from './mergeFolderPage';

const testCase = (id: number) => ({ id }) as TestCase;
const page = (number: number, totalPages: number) => ({
  number,
  size: 50,
  totalElements: totalPages * 50,
  totalPages,
});

describe('mergeFolderPage', () => {
  test('keeps a complete entry cached by a batch fetch while the page was in flight', () => {
    const complete = {
      testCases: [testCase(1), testCase(2)],
      page: page(1, 1),
      isLoading: false,
    };

    expect(
      mergeFolderPage(complete, { content: [testCase(1)], page: page(1, 3) }, true, null),
    ).toEqual({});
  });

  test('appends a page to a partial entry', () => {
    const partial = { testCases: [testCase(1)], page: page(1, 2), isLoading: false };

    expect(
      mergeFolderPage(partial, { content: [testCase(2)], page: page(2, 2) }, false, null),
    ).toEqual({ testCases: [testCase(1), testCase(2)], page: page(2, 2) });
  });

  test('skips a page that a concurrent request for the same offset has already merged', () => {
    const merged = { testCases: [testCase(1), testCase(2)], page: page(2, 3), isLoading: false };

    expect(
      mergeFolderPage(merged, { content: [testCase(2)], page: page(2, 3) }, false, null),
    ).toEqual({});
  });
});
