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

import {
  AUTH_ERROR,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_LAST_FAILED_LOGIN_TIME,
  CLEAR_LOGIN_LOCKOUT,
  SET_FAILED_LOGIN_ATTEMPTS,
  LOGIN_SUCCESS,
  SET_BAD_CREDENTIALS,
  SET_LOGIN_LOADING,
} from './constants';

export const authSuccessAction = () => ({ type: AUTH_SUCCESS });

export const authErrorAction = () => ({ type: AUTH_ERROR });

export const loginAction = ({ login, password }) => ({
  type: LOGIN,
  payload: { login, password },
});

export const loginSuccessAction = (token) => ({
  type: LOGIN_SUCCESS,
  payload: token,
});

export const logoutAction = (redirectedPage) => ({ type: LOGOUT, payload: redirectedPage });

export const setTokenAction = (token) => ({
  type: SET_TOKEN,
  payload: token,
});

export const resetTokenAction = () => setTokenAction(DEFAULT_TOKEN);

export const setLastFailedLoginTimeAction = (time) => ({
  type: SET_LAST_FAILED_LOGIN_TIME,
  payload: time,
});

export const setFailedLoginAttemptsAction = (attempts) => ({
  type: SET_FAILED_LOGIN_ATTEMPTS,
  payload: attempts,
});

export const clearLoginLockoutAction = () => ({
  type: CLEAR_LOGIN_LOCKOUT,
});

export const setBadCredentialsAction = () => ({
  type: SET_BAD_CREDENTIALS,
});

export const setLoginLoadingAction = (isLoading) => ({
  type: SET_LOGIN_LOADING,
  payload: isLoading,
});
