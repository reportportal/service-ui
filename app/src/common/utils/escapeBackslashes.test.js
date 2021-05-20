/*
 * Copyright 2021 EPAM Systems
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

import { escapeBackslashes } from './escapeBackslashes';

describe('escapeBackslashes', () => {
  test('should return empty string in case of empty argument', () => {
    expect(escapeBackslashes()).toBe('');
  });

  test('should not change the string if it does not contain any backslashes', () => {
    expect(escapeBackslashes("String.raw.split('a').join('b') A &gt; B")).toBe(
      "String.raw.split('a').join('b') A &gt; B",
    );
  });

  test('should cast argument to string', () => {
    expect(escapeBackslashes(123)).toBe('123');
    expect(escapeBackslashes(null)).toBe('null');
    expect(escapeBackslashes({ name: 'John' })).toBe('[object Object]');
  });

  test('should escape backslashes in the provided string', () => {
    expect(escapeBackslashes("String.raw.split('\\').join('\\\\') A &gt; B")).toBe(
      "String.raw.split('\\\\').join('\\\\\\\\') A &gt; B",
    );
    expect(escapeBackslashes("\\String.raw.split('\\\\').join('\\\\\\') A &gt; B")).toBe(
      "\\\\String.raw.split('\\\\\\\\').join('\\\\\\\\\\\\') A &gt; B",
    );
  });
});
