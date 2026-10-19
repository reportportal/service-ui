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

import { compareVersions, sortVersionsNewestFirst } from './utils';

const order = (versions) =>
  sortVersionsNewestFirst(versions.map((version) => ({ version }))).map((e) => e.version);

describe('compareVersions', () => {
  test('ranks by segment, numerically', () => {
    expect(compareVersions('5.8.0', '5.7.0')).toBeGreaterThan(0);
    expect(compareVersions('5.7.0', '5.8.0')).toBeLessThan(0);
    expect(compareVersions('5.8.0', '5.8.0')).toBe(0);
  });

  // "5.10" after "5.9" is the whole reason this is not a string comparison
  test('ten is above nine, not below one', () => {
    expect(compareVersions('5.10.0', '5.9.0')).toBeGreaterThan(0);
  });

  test('a missing segment is a zero, so 5.7 and 5.7.0 are the same version', () => {
    expect(compareVersions('5.7', '5.7.0')).toBe(0);
    expect(compareVersions('5.7.1', '5.7')).toBeGreaterThan(0);
  });

  // plugins are not disciplined about the third segment, and a version the registry accepted has
  // to sort rather than throw
  test('a version that is not semver still compares', () => {
    expect(compareVersions('5', '4.9.9')).toBeGreaterThan(0);
    expect(compareVersions('', '1.0.0')).toBeLessThan(0);
    expect(compareVersions(undefined, undefined)).toBe(0);
  });

  test('a release outranks the candidates on the way to it', () => {
    expect(compareVersions('5.8.0', '5.8.0-rc1')).toBeGreaterThan(0);
    expect(compareVersions('5.8.0-rc2', '5.8.0-rc1')).toBeGreaterThan(0);
    expect(compareVersions('5.8.0-rc1', '5.7.9')).toBeGreaterThan(0);
  });
});

describe('sortVersionsNewestFirst', () => {
  test('newest first', () => {
    expect(order(['5.6.0', '5.8.0', '5.6.1', '5.7.0'])).toEqual([
      '5.8.0',
      '5.7.0',
      '5.6.1',
      '5.6.0',
    ]);
  });

  test('does not disturb the list it was handed', () => {
    const versions = [{ version: '5.6.0' }, { version: '5.8.0' }];

    sortVersionsNewestFirst(versions);

    expect(versions.map((e) => e.version)).toEqual(['5.6.0', '5.8.0']);
  });
});
