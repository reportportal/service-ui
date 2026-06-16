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
  shouldStartLoginLockout,
} from './loginLockout';

describe('loginLockout', () => {
  test('allows up to 4 failed attempts before lockout', () => {
    expect(shouldStartLoginLockout(4)).toBe(false);
    expect(shouldStartLoginLockout(5)).toBe(true);
  });

  test('returns active lockout within 30 seconds', () => {
    const lastFailedLoginTime = Date.now() - 10 * 1000;
    expect(isLoginLockoutActive(lastFailedLoginTime)).toBe(true);
    expect(getLoginLockoutState(lastFailedLoginTime).blockTime).toBe(20);
  });

  test('clears lockout after 30 seconds', () => {
    const lastFailedLoginTime = Date.now() - 31 * 1000;
    expect(isLoginLockoutActive(lastFailedLoginTime)).toBe(false);
  });
});
