/*
 * Copyright 2019 EPAM Systems
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

import { isEmptyValue } from './isEmptyValue';

describe('isEmptyValue', () => {
  test('should return true for empty string, null and undefined', () => {
    expect(isEmptyValue()).toBe(true);
    expect(isEmptyValue('')).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
  });

  test('should return false for other values', () => {
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue([])).toBe(false);
    expect(isEmptyValue({})).toBe(false);
    expect(isEmptyValue('abc')).toBe(false);
    expect(isEmptyValue(1)).toBe(false);
  });
});
