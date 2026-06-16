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
  LOGIN_LOCKOUT_BLOCK_DURATION_SEC,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from './constants';

export const getLoginLockoutState = (lastFailedLoginTime) => {
  if (!lastFailedLoginTime) {
    return { blockTime: null, isLoginLimitExceeded: false };
  }

  const elapsedSec = Math.max(0, Math.floor((Date.now() - lastFailedLoginTime) / 1000));
  const remainingSec = LOGIN_LOCKOUT_BLOCK_DURATION_SEC - elapsedSec;
  const isLoginLimitExceeded = remainingSec > 0;

  return {
    blockTime: isLoginLimitExceeded ? remainingSec : null,
    isLoginLimitExceeded,
  };
};

export const isLoginLockoutActive = (lastFailedLoginTime) =>
  getLoginLockoutState(lastFailedLoginTime).isLoginLimitExceeded;

export const shouldStartLoginLockout = (failedAttempts) =>
  failedAttempts > MAX_FAILED_LOGIN_ATTEMPTS;

export const sanitizeStoredLockoutTime = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  if (isLoginLockoutActive(timestamp)) {
    return timestamp;
  }

  return null;
};

export const isTransientLoginFailure = (rawError) => rawError instanceof Error;
