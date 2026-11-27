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

import { TEST_CASE_TIME_CONDITION } from 'analyticsEvents/testCaseLibraryPageEvents';

import { CreateTestCaseFormData } from '../types';
import { getTestCaseTimeCondition } from './getTestCaseAnalyticsParams';
import {
  getExecutionEstimationTimePayload,
  normalizeExecutionEstimationTime,
} from './executionEstimationTimeFieldUtils';

describe('normalizeExecutionEstimationTime', () => {
  it.each([[''], [null], [undefined], [0], ['0']])('treats %p as an empty value', (value) => {
    expect(normalizeExecutionEstimationTime(value)).toBe('');
  });

  it('keeps a positive number', () => {
    expect(normalizeExecutionEstimationTime('15')).toBe(15);
  });
});

describe('getExecutionEstimationTimePayload', () => {
  it.each([[''], [null], [undefined], [0]])('sends null for %p', (value) => {
    expect(getExecutionEstimationTimePayload(value)).toBeNull();
  });

  it('sends the entered number', () => {
    expect(getExecutionEstimationTimePayload(5)).toBe(5);
  });
});

describe('getTestCaseTimeCondition', () => {
  const formData = (executionEstimationTime?: number | string) =>
    ({ executionEstimationTime }) as unknown as CreateTestCaseFormData;

  it('reports no customization for an empty execution time', () => {
    expect(getTestCaseTimeCondition(formData())).toBe(TEST_CASE_TIME_CONDITION.NO_CUSTOMIZE);
    expect(getTestCaseTimeCondition(formData(''))).toBe(TEST_CASE_TIME_CONDITION.NO_CUSTOMIZE);
  });

  it('reports customization for any entered execution time', () => {
    expect(getTestCaseTimeCondition(formData(5))).toBe(TEST_CASE_TIME_CONDITION.CUSTOMIZE);
  });
});
