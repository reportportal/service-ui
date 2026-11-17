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

import { getNextDuplicateName, joinNameWithSuffix } from './getNextDuplicateName';

describe('joinNameWithSuffix', () => {
  it('returns base + suffix when within max length', () => {
    expect(joinNameWithSuffix('My item', ' (1)', 255)).toBe('My item (1)');
  });

  it('truncates base so result fits max length', () => {
    const baseName = 'a'.repeat(255);
    const result = joinNameWithSuffix(baseName, ' (1)', 255);

    expect(result).toHaveLength(255);
    expect(result.endsWith(' (1)')).toBe(true);
  });
});

describe('getNextDuplicateName', () => {
  it('appends (1) for names without a duplicate suffix', () => {
    expect(getNextDuplicateName('My milestone', 255)).toBe('My milestone (1)');
  });

  it('increments an existing duplicate suffix', () => {
    expect(getNextDuplicateName('My milestone (1)', 255)).toBe('My milestone (2)');
  });

  it('truncates base name so suffix fits within max length', () => {
    const name = 'a'.repeat(255);
    const result = getNextDuplicateName(name, 255);

    expect(result).toHaveLength(255);
    expect(result.endsWith(' (1)')).toBe(true);
  });

  it('truncates when incrementing a long duplicated name', () => {
    const base = 'a'.repeat(251);
    const result = getNextDuplicateName(`${base} (9)`, 255);

    expect(result).toHaveLength(255);
    expect(result.endsWith(' (10)')).toBe(true);
  });
});
