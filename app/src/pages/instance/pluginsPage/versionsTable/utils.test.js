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
  compareVersions,
  sortVersionsNewestFirst,
  compareProductVersions,
  parseCompatibilityRange,
  violatedRangeBound,
} from './utils';

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

// the explanation has to turn on the same bound the server's verdict did, so these mirror
// the orderings service-api's PluginVersions documents
describe('compareProductVersions', () => {
  test.each([
    ['26.0', '26.0.0', 0],
    ['26.0', '25.9', 1],
    ['1.4.10', '1.4.9', 1],
    ['2.0.0-rc1', '2.0.0', -1],
    ['2.0.0-rc.10', '2.0.0-rc.2', 1],
    ['2.0.0-1', '2.0.0-alpha', -1],
    ['2.0.0-rc', '2.0.0-rc.1', -1],
    ['2.0.0+build.5', '2.0.0', 0],
    ['007.1', '7.1', 0],
    ['99999999999999999999.0', '99999999999999999998.0', 1],
    ['25.10', '25.9', 1],
    ['1.010', '1.9', 1],
    ['1.0.0-2', '1.0.0-10', -1],
    ['1.0.0-alpha', '1.0.0-alpha.1', -1],
    ['1.0.0-rc.99999999999999999999', '1.0.0-rc.2', 1],
    ['2.0.0+build.5', '2.0.0-rc1', 1],
    // Java's split drops the trailing empty identifier
    ['2.0.0-rc.', '2.0.0-rc', 0],
    ['1.4.', '1.4', 0],
  ])('%s against %s is %i', (left, right, expected) => {
    expect(Math.sign(compareProductVersions(left, right))).toBe(expected);
  });
});

describe('parseCompatibilityRange', () => {
  test('reads every comma-separated constraint, longest operator first', () => {
    expect(parseCompatibilityRange('>=25.0, <26.0')).toEqual([
      { operator: '>=', version: '25.0' },
      { operator: '<', version: '26.0' },
    ]);
    expect(parseCompatibilityRange('==25.5.0')).toEqual([{ operator: '==', version: '25.5.0' }]);
  });

  test('a bare version is an exact pin', () => {
    expect(parseCompatibilityRange('25.5.0')).toEqual([{ operator: '=', version: '25.5.0' }]);
  });

  // Java's split drops trailing empty parts, so the server reads these as `>=25.0`
  test.each(['>=25.0,', '>=25.0,,'])(
    'a trailing separator (%p) is ignored, as on the server',
    (range) => {
      expect(parseCompatibilityRange(range)).toEqual([{ operator: '>=', version: '25.0' }]);
    },
  );

  test.each([
    null,
    '',
    '  ',
    'whenever',
    '>=25.x',
    '>=25.0, <next',
    ',>=25.0',
    '>=25.0,,<26.0',
    ',',
  ])('an unreadable range (%p) is no range at all', (range) => {
    expect(parseCompatibilityRange(range)).toBeNull();
  });
});

describe('violatedRangeBound', () => {
  // the reported case: the lower bound holds, so it must not be the one explained
  test('names the upper bound a release has outgrown, not the lower one it meets', () => {
    expect(violatedRangeBound('>=25.0, <26.0', '26.0')).toEqual({ operator: '<', version: '26.0' });
  });

  test('names the lower bound a release has not reached', () => {
    expect(violatedRangeBound('>=25.0, <26.0', '24.3')).toEqual({
      operator: '>=',
      version: '25.0',
    });
  });

  test.each([
    ['>=26.0', '25.9', '>='],
    ['>26.0', '26.0', '>'],
    ['<=25.2', '25.3', '<='],
    ['<26.0', '26.0', '<'],
    ['=25.5.0', '25.5.1', '='],
    ['==25.5.0', '25.5.1', '=='],
  ])('%s fails on %s through its own operator', (range, productVersion, operator) => {
    expect(violatedRangeBound(range, productVersion).operator).toBe(operator);
  });

  test('nothing to name when every bound holds, the range is unreadable or the release unknown', () => {
    expect(violatedRangeBound('>=25.0, <26.0', '25.4')).toBeNull();
    expect(violatedRangeBound('whenever', '26.0')).toBeNull();
    expect(violatedRangeBound('>=25.0', null)).toBeNull();
  });
});

// service-api's CompatibilityRangeTest, case for case: a bound is reported failed exactly when
// the server's matcher says it does not hold
describe('violatedRangeBound agrees with the server on what matches', () => {
  test.each([
    ['>=25.1', '25.1', true],
    ['>=25.1', '25.0', false],
    ['>25.1', '25.1', false],
    ['>25.1', '25.1.1', true],
    ['<26.0', '25.9', true],
    ['<26.0', '26.0', false],
    ['<=25.1', '25.1', true],
    ['<=25.1', '25.1.1', false],
    ['>=25.1, <26.0', '25.2', true],
    ['>=25.1, <26.0', '27.3', false],
    ['25.5', '25.5.0', true],
    ['25.5.0', '25.6.0', false],
    ['>=25.10', '25.10', true],
  ])('%s on %s matches: %p', (range, productVersion, matches) => {
    expect(violatedRangeBound(range, productVersion) === null).toBe(matches);
  });
});
