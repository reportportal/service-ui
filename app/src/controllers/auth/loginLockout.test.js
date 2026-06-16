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
  getLoginLockoutState,
  isLoginLockoutActive,
  isTransientLoginFailure,
  shouldStartLoginLockout,
} from './loginLockout';

describe('loginLockout', () => {
  test('allows up to 4 failed attempts before lockout', () => {
    expect(shouldStartLoginLockout(4)).toBe(false);
    expect(shouldStartLoginLockout(5)).toBe(true);
  });

  describe('lockout timing', () => {
    const fixedNow = new Date('2024-01-01T12:00:00.000Z');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('returns active lockout within 30 seconds', () => {
      const lastFailedLoginTime = fixedNow.getTime() - 10 * 1000;

      expect(isLoginLockoutActive(lastFailedLoginTime)).toBe(true);
      expect(getLoginLockoutState(lastFailedLoginTime).blockTime).toBe(20);
    });

    test('clears lockout after 30 seconds', () => {
      const lastFailedLoginTime = fixedNow.getTime() - 31 * 1000;

      expect(isLoginLockoutActive(lastFailedLoginTime)).toBe(false);
    });

    test('treats future lockout timestamps as full duration', () => {
      const lastFailedLoginTime = fixedNow.getTime() + 5 * 1000;

      expect(getLoginLockoutState(lastFailedLoginTime).blockTime).toBe(30);
    });
  });

  test('counts API failures but not transient network errors', () => {
    expect(
      isTransientLoginFailure({
        errorCode: 4003,
        message: 'You do not have enough permissions. Bad credentials',
      }),
    ).toBe(false);
    expect(
      isTransientLoginFailure({
        errorCode: 4004,
        message: 'Address is locked due to several incorrect login attempts',
      }),
    ).toBe(false);
    expect(isTransientLoginFailure(new Error('Network Error'))).toBe(true);
  });
});
