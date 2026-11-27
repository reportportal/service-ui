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

import { getTestPlanChange, TestPlanChange } from './utils';

describe('getTestPlanChange', () => {
  const planA = { id: 1, name: 'Plan A' };
  const planB = { id: 2, name: 'Plan B' };

  test('returns null when the Test Plan is the same', () => {
    expect(getTestPlanChange(planA, { ...planA })).toBeNull();
    expect(getTestPlanChange(null, null)).toBeNull();
    expect(getTestPlanChange(undefined, '')).toBeNull();
  });

  test('returns CHANGED when another Test Plan is selected', () => {
    expect(getTestPlanChange(planA, planB)).toBe(TestPlanChange.CHANGED);
  });

  test('returns null when a Test Plan is selected for a launch without one', () => {
    expect(getTestPlanChange(null, planB)).toBeNull();
    expect(getTestPlanChange(undefined, planB)).toBeNull();
  });

  test('returns REMOVED when the Test Plan is cleared', () => {
    expect(getTestPlanChange(planA, null)).toBe(TestPlanChange.REMOVED);
    expect(getTestPlanChange(planA, '')).toBe(TestPlanChange.REMOVED);
  });
});
