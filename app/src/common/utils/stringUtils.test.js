/*
 * Copyright 2025 EPAM Systems
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

import { isString, capitalize } from './stringUtils';

describe('isString', () => {
  test('should return true for string values', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
    expect(isString('123')).toBe(true);
    expect(isString('true')).toBe(true);
  });

  test('should return false for non-string values', () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(() => {})).toBe(false);
  });
});

describe('capitalize', () => {
  test('should capitalize first letter and lowercase the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('a')).toBe('A');
    expect(capitalize('hELLo')).toBe('Hello');
    expect(capitalize('TeSt')).toBe('Test');
    expect(capitalize('MiXeD')).toBe('Mixed');
  });

  test('should return original value for non-string inputs', () => {
    expect(capitalize(123)).toBe(123);
    expect(capitalize(true)).toBe(true);
    expect(capitalize(false)).toBe(false);
    expect(capitalize(null)).toBe(null);
    expect(capitalize(undefined)).toBe(undefined);
    expect(capitalize({})).toEqual({});
    expect(capitalize([])).toEqual([]);
  });
});
