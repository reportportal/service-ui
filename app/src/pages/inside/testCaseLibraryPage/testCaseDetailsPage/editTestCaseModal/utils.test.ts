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

import type { TestCase } from 'types/testCase';

import { getEditNameAndPriorityInitialValues } from './utils';

const baseTestCase: Pick<TestCase, 'name' | 'priority' | 'testFolder'> = {
  name: 'Login works',
  priority: 'high',
  testFolder: { id: 42 },
};

describe('getEditNameAndPriorityInitialValues', () => {
  it('returns name, priority and folder id of the test case', () => {
    expect(getEditNameAndPriorityInitialValues(baseTestCase)).toEqual({
      name: 'Login works',
      priority: 'high',
      testFolderId: 42,
    });
  });

  it('normalizes an upper case priority to lower case', () => {
    const testCase = { ...baseTestCase, priority: 'CRITICAL' as TestCase['priority'] };

    expect(getEditNameAndPriorityInitialValues(testCase).priority).toBe('critical');
  });

  it('falls back to unspecified when the priority is missing', () => {
    const testCase = { ...baseTestCase, priority: undefined };

    expect(getEditNameAndPriorityInitialValues(testCase).priority).toBe('unspecified');
  });

  it('does not fail when the folder is missing', () => {
    const testCase = { ...baseTestCase, testFolder: undefined } as unknown as TestCase;

    expect(getEditNameAndPriorityInitialValues(testCase).testFolderId).toBeUndefined();
  });
});
