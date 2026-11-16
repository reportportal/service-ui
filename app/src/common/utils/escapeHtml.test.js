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

import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  test('escapes the HTML special characters', () => {
    expect(escapeHtml(`<img src="x" onerror='a&b'>`)).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#39;a&amp;b&#39;&gt;',
    );
  });

  test('keeps plain text and stringifies numbers', () => {
    expect(escapeHtml('build 5.9')).toBe('build 5.9');
    expect(escapeHtml(42)).toBe('42');
  });

  test('returns an empty string for null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
