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

import { isOutdatedVersion } from './isOutdatedVersion';

describe('isOutdatedVersion', () => {
  test('should return true when current version is lower than latest', () => {
    expect(isOutdatedVersion('5.15.5', '5.15.6')).toBe(true);
    expect(isOutdatedVersion('5.15.6', '6.0.0')).toBe(true);
  });

  test('should return false when current version is equal to latest', () => {
    expect(isOutdatedVersion('6.0.0', '6.0.0')).toBe(false);
  });

  test('should return false when current version is higher than latest', () => {
    expect(isOutdatedVersion('6.0.0', '5.15.6')).toBe(false);
  });

  test('should return false when versions differ only in build metadata', () => {
    expect(isOutdatedVersion('0.1.0', '0.1.0+foo')).toBe(false);
  });

  test('should return false when latest version is not provided', () => {
    expect(isOutdatedVersion('6.0.0', undefined)).toBe(false);
    expect(isOutdatedVersion('6.0.0', null)).toBe(false);
  });

  test('should return false when current version is not provided', () => {
    expect(isOutdatedVersion(undefined, '6.0.0')).toBe(false);
  });

  test('should return false when version is not a valid semver', () => {
    expect(isOutdatedVersion('6.0.0', 'not-a-version')).toBe(false);
  });
});
