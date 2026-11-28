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
  buildFolderFilterParams,
  buildManualLaunchExecutionFilterParams,
  buildTestCaseFilterParams,
  normalizeRequirements,
  parseRequirementsFromQuery,
  serializeRequirements,
  toRequirementSearchTerms,
} from './utils';

describe('requirement filter utils', () => {
  test('normalizeRequirements trims and drops empty values and case-insensitive duplicates', () => {
    expect(normalizeRequirements([' EPMRPP-1 ', '', '  ', 'epmrpp-1', 'Login, logout'])).toEqual([
      'EPMRPP-1',
      'Login, logout',
    ]);
  });

  test('requirements survive the URL query, commas included', () => {
    const serialized = serializeRequirements(['EPMRPP-1', ' ', 'Login, logout']);

    expect(serialized).toBe('EPMRPP-1\nLogin, logout');
    expect(parseRequirementsFromQuery(serialized)).toEqual(['EPMRPP-1', 'Login, logout']);
    expect(serializeRequirements(['', ' '])).toBeUndefined();
    expect(parseRequirementsFromQuery(undefined)).toEqual([]);
  });

  test('a link is searched without the scheme and www, and by its last part', () => {
    expect(
      toRequirementSearchTerms([
        'https://www.jira.example.com/browse/EPMRPP-116856',
        'http://jira.example.com/browse/EPMRPP-2/',
        'www.jira.example.com/browse/EPMRPP-3?focusedId=7#comment',
        'EPMRPP-116856',
      ]),
    ).toEqual([
      'jira.example.com/browse/EPMRPP-116856',
      'EPMRPP-116856',
      'jira.example.com/browse/EPMRPP-2',
      'EPMRPP-2',
      'jira.example.com/browse/EPMRPP-3?focusedId=7#comment',
      'EPMRPP-3',
    ]);
  });

  test('text that is not a link is searched as it is', () => {
    expect(toRequirementSearchTerms(['Payment / refund flow'])).toEqual(['Payment / refund flow']);
  });

  test('test case and folder requests get one parameter per search term', () => {
    const query = serializeRequirements(['https://jira.example.com/browse/EPMRPP-1', 'Login']);

    expect(buildTestCaseFilterParams('high', undefined, query)).toEqual({
      'filter.in.priority': 'HIGH',
      'filter.cnt.requirement': ['jira.example.com/browse/EPMRPP-1', 'EPMRPP-1', 'Login'],
    });
    expect(buildFolderFilterParams(undefined, 'smoke', query)).toEqual({
      'filter.has.testCaseAttributeKey': 'smoke',
      'filter.cnt.testCaseRequirement': ['jira.example.com/browse/EPMRPP-1', 'EPMRPP-1', 'Login'],
    });
    expect(buildTestCaseFilterParams(undefined, undefined, undefined)).toEqual({});
  });

  test('manual launch execution filters have no requirement parameter', () => {
    expect(buildManualLaunchExecutionFilterParams('high', 'smoke')).toEqual({
      'filter.in.priority': 'HIGH',
      'filter.in.attributeKey': 'smoke',
    });
  });
});
