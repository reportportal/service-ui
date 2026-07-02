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
  hasExpiredLoginLockout,
  isLoginAttemptsExceeded,
  isLoginCredentialFailure,
  isLoginLockoutActive,
  isLoginLockoutRedirect,
  isLoginRedirectLockout,
  isServerLoginLockFailure,
  shouldStartLoginLockout,
} from './loginLockout';
import { MAX_FAILED_LOGIN_ATTEMPTS } from './constants';

describe('loginLockout', () => {
  test('allows failures below threshold before lockout', () => {
    expect(isLoginAttemptsExceeded(MAX_FAILED_LOGIN_ATTEMPTS - 1)).toBe(false);
    expect(isLoginAttemptsExceeded(MAX_FAILED_LOGIN_ATTEMPTS)).toBe(true);
    expect(shouldStartLoginLockout(MAX_FAILED_LOGIN_ATTEMPTS)).toBe(false);
    expect(shouldStartLoginLockout(MAX_FAILED_LOGIN_ATTEMPTS + 1)).toBe(true);
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

    test('detects expired client lockout state', () => {
      const lastFailedLoginTime = fixedNow.getTime() - 31 * 1000;

      expect(hasExpiredLoginLockout(lastFailedLoginTime)).toBe(true);
      expect(hasExpiredLoginLockout(null)).toBe(false);
      expect(hasExpiredLoginLockout(fixedNow.getTime())).toBe(false);
    });
  });

  test('counts only bad-credentials API errors toward lockout', () => {
    expect(
      isLoginCredentialFailure({
        errorCode: 4003,
        message: 'You do not have enough permissions. Bad credentials',
      }),
    ).toBe(true);
    expect(
      isLoginCredentialFailure({
        errorCode: 4004,
        message: 'Address is locked due to several incorrect login attempts',
      }),
    ).toBe(false);
    expect(isLoginCredentialFailure(new Error('Network Error'))).toBe(false);
    expect(isLoginCredentialFailure({ errorCode: 500, message: 'Server error' })).toBe(false);
  });

  test('detects server-side login lock responses', () => {
    expect(
      isServerLoginLockFailure({
        errorCode: 4004,
        message: 'Address is locked due to several incorrect login attempts',
      }),
    ).toBe(true);
    expect(
      isServerLoginLockFailure({
        errorCode: 4003,
        message: 'Address is locked due to several incorrect login attempts',
      }),
    ).toBe(true);
    expect(
      isServerLoginLockFailure({
        errorCode: 4003,
        message: 'You do not have enough permissions. Bad credentials',
      }),
    ).toBe(false);
    expect(isServerLoginLockFailure(new Error('Network Error'))).toBe(false);
  });

  test('detects login lockout redirects', () => {
    expect(
      isLoginRedirectLockout({
        status: 302,
        headers: { location: '/ui/#login?errorAuth=Address%20is%20locked%20due%20to%20several%20incorrect%20login%20attempts' },
      }),
    ).toBe(true);
    expect(
      isLoginRedirectLockout({
        status: 400,
        data: { errorCode: 4003, message: 'Bad credentials' },
      }),
    ).toBe(false);
    expect(isLoginLockoutRedirect('/ui/#login?errorAuth=Address is locked due to several incorrect login attempts')).toBe(
      true,
    );
  });
});
