/*
 * Copyright 2019 EPAM Systems
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

import { combineReducers } from 'redux';
import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { sanitizeStoredLockoutTime } from './loginLockout';
import {
  AUTH_SUCCESS,
  LOGOUT,
  LOGIN,
  LOGIN_SUCCESS,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_LAST_FAILED_LOGIN_TIME,
  CLEAR_LOGIN_LOCKOUT,
  SET_FAILED_LOGIN_ATTEMPTS,
  SET_BAD_CREDENTIALS,
  SET_LOGIN_LOADING,
} from './constants';

const getStoredSettings = () => getStorageItem(APPLICATION_SETTINGS) || {};

const getFailedLoginAttemptsDefaultState = () => getStoredSettings().failedLoginAttempts || 0;

const getLastFailedLoginDefaultState = () => {
  const storedTimestamp = getStoredSettings().lastFailedLoginTime;
  const activeLockoutTime = sanitizeStoredLockoutTime(storedTimestamp);

  if (storedTimestamp && !activeLockoutTime) {
    updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime: null, failedLoginAttempts: 0 });
  }

  return activeLockoutTime;
};

export const authorizedReducer = (state = false, { type = '' }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return true;
    case LOGOUT:
      return false;
    default:
      return state;
  }
};

export const tokenReducer = (state = DEFAULT_TOKEN, { type = '', payload = {} }) => {
  switch (type) {
    case SET_TOKEN:
      return payload || DEFAULT_TOKEN;
    default:
      return state;
  }
};

const badCredentialsReducer = (state = false, { type }) => {
  switch (type) {
    case SET_BAD_CREDENTIALS:
      return true;
    case LOGIN:
    case LOGIN_SUCCESS:
    case CLEAR_LOGIN_LOCKOUT:
    case SET_LAST_FAILED_LOGIN_TIME:
      return false;
    default:
      return state;
  }
};

export const failedLoginAttemptsReducer = (
  state = getFailedLoginAttemptsDefaultState(),
  { type = '', payload = null },
) => {
  switch (type) {
    case SET_FAILED_LOGIN_ATTEMPTS:
      updateStorageItem(APPLICATION_SETTINGS, { failedLoginAttempts: payload });
      return payload;
    case CLEAR_LOGIN_LOCKOUT:
    case LOGIN_SUCCESS:
      updateStorageItem(APPLICATION_SETTINGS, { failedLoginAttempts: 0 });
      return 0;
    default:
      return state;
  }
};

export const lastFailedLoginTimeReducer = (
  state = getLastFailedLoginDefaultState(),
  { type = '', payload = null },
) => {
  switch (type) {
    case SET_LAST_FAILED_LOGIN_TIME:
      updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime: payload });
      return payload;
    case CLEAR_LOGIN_LOCKOUT:
      updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime: null, failedLoginAttempts: 0 });
      return null;
    default:
      return state;
  }
};

const loginLoadingReducer = (state = false, { type = '', payload = false }) => {
  switch (type) {
    case LOGIN:
      return true;
    case SET_LOGIN_LOADING:
      return payload;
    case AUTH_SUCCESS:
    case LOGOUT:
      return false;
    default:
      return state;
  }
};

export const authReducer = combineReducers({
  authorized: authorizedReducer,
  token: tokenReducer,
  lastFailedLoginTime: lastFailedLoginTimeReducer,
  failedLoginAttempts: failedLoginAttemptsReducer,
  badCredentials: badCredentialsReducer,
  loginLoading: loginLoadingReducer,
});
