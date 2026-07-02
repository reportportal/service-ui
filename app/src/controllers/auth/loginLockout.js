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
import { ERROR_CODE_LOGIN_BAD_CREDENTIALS, ERROR_CODE_LOGIN_MAX_LIMIT } from 'common/constants/apiErrorCodes';

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

export const hasExpiredLoginLockout = (lastFailedLoginTime) =>
  Boolean(lastFailedLoginTime && !isLoginLockoutActive(lastFailedLoginTime));

export const isLoginAttemptsExceeded = (failedAttempts) =>
  failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

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

export const isLoginCredentialFailure = (rawError) =>
  rawError?.errorCode === ERROR_CODE_LOGIN_BAD_CREDENTIALS;

const ADDRESS_LOCKED_MESSAGE_PATTERN = /address is locked/i;

export const isLoginLockoutErrorAuthMessage = (message) =>
  ADDRESS_LOCKED_MESSAGE_PATTERN.test(String(message || ''));

const getRedirectErrorAuth = (location = '') => {
  if (!location) {
    return '';
  }

  try {
    const url = new URL(location, window.location.origin);
    const queryErrorAuth = url.searchParams.get('errorAuth');

    if (queryErrorAuth) {
      return queryErrorAuth;
    }

    const hashQuery = url.hash.includes('?') ? url.hash.split('?')[1] : '';
    return new URLSearchParams(hashQuery).get('errorAuth') || '';
  } catch {
    return '';
  }
};

export const isLoginLockoutRedirect = (location = '') =>
  isLoginLockoutErrorAuthMessage(getRedirectErrorAuth(location));

export const isLoginRedirectLockout = (response) => {
  if (!response) {
    return false;
  }

  const { status, headers = {} } = response;

  if (status >= 300 && status < 400) {
    const location = headers.location || headers.Location;

    return isLoginLockoutRedirect(location) || Boolean(location);
  }

  return false;
};

export const isValidLoginTokenResponse = (data) =>
  Boolean(data && typeof data === 'object' && typeof data.access_token === 'string');

export const isServerLoginLockFailure = (rawError) => {
  if (!rawError || typeof rawError !== 'object' || rawError instanceof Error) {
    return false;
  }

  if (rawError.errorCode === ERROR_CODE_LOGIN_MAX_LIMIT) {
    return true;
  }

  return ADDRESS_LOCKED_MESSAGE_PATTERN.test(String(rawError.message || ''));
};
