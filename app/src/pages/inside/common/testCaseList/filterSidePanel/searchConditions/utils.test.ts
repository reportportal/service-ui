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
  addSearchValue,
  buildFolderSearchParams,
  buildTestCaseSearchParams,
  normalizeSearchConditions,
  parseSearchConditionsFromQuery,
  serializeSearchConditions,
} from './utils';

describe('search condition utils', () => {
  test('normalizeSearchConditions trims values, drops empty ones and keeps each field once', () => {
    expect(
      normalizeSearchConditions([
        { field: 'instructions', value: '  Open the page ' },
        { field: 'name', value: '   ' },
        { field: 'instructions', value: 'second' },
        { field: 'expectedResult', value: 'Saved' },
      ]),
    ).toEqual([
      { field: 'instructions', value: 'Open the page' },
      { field: 'expectedResult', value: 'Saved' },
    ]);
  });

  test('conditions survive the URL query in their order, commas and line breaks included', () => {
    const serialized = serializeSearchConditions([
      { field: 'expectedResult', value: 'Saved, shown\nin the list' },
      { field: 'name', value: 'Login' },
      { field: 'precondition', value: '' },
    ]);

    expect(parseSearchConditionsFromQuery(serialized)).toEqual([
      { field: 'expectedResult', value: 'Saved, shown\nin the list' },
      { field: 'name', value: 'Login' },
    ]);
    expect(serializeSearchConditions([{ field: 'name', value: ' ' }])).toBeUndefined();
  });

  test('a broken or unknown query value is ignored', () => {
    expect(parseSearchConditionsFromQuery(undefined)).toEqual([]);
    expect(parseSearchConditionsFromQuery('not json')).toEqual([]);
    expect(parseSearchConditionsFromQuery('["name"]')).toEqual([]);
    expect(parseSearchConditionsFromQuery('{"unknown":"x","name":1,"description":"ok"}')).toEqual([
      { field: 'description', value: 'ok' },
    ]);
  });

  test('test case and folder requests use their own "contains" parameters', () => {
    const query = serializeSearchConditions([
      { field: 'name', value: 'Login' },
      { field: 'description', value: 'SSO' },
      { field: 'precondition', value: 'authorized' },
      { field: 'instructions', value: 'Open the payment page' },
      { field: 'expectedResult', value: 'Paid' },
    ]);

    expect(buildTestCaseSearchParams(query)).toEqual({
      'filter.cnt.name': 'Login',
      'filter.cnt.description': 'SSO',
      'filter.cnt.precondition': 'authorized',
      'filter.cnt.instructions': 'Open the payment page',
      'filter.cnt.expectedResult': 'Paid',
    });
    expect(buildFolderSearchParams(query)).toEqual({
      'filter.cnt.testCaseName': 'Login',
      'filter.cnt.testCaseDescription': 'SSO',
      'filter.cnt.testCasePrecondition': 'authorized',
      'filter.cnt.testCaseInstructions': 'Open the payment page',
      'filter.cnt.testCaseExpectedResult': 'Paid',
    });
    expect(buildTestCaseSearchParams(undefined)).toEqual({});
  });

  test('the page search and the Name condition are both sent', () => {
    expect(addSearchValue({ limit: 50 }, 'filter.cnt.name', 'login')).toEqual({
      limit: 50,
      'filter.cnt.name': 'login',
    });
    expect(addSearchValue({ 'filter.cnt.name': 'Login' }, 'filter.cnt.name', 'admin')).toEqual({
      'filter.cnt.name': ['Login', 'admin'],
    });
    expect(addSearchValue({ 'filter.cnt.name': 'Login' }, 'filter.cnt.name', 'Login')).toEqual({
      'filter.cnt.name': 'Login',
    });
    expect(addSearchValue({ a: 1 }, 'filter.cnt.name', '')).toEqual({ a: 1 });
  });
});
