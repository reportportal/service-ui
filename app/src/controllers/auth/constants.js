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

export const TOKEN_KEY = 'token';
export const DEFAULT_TOKEN = {
  type: 'Basic',
  value: 'dWk6dWltYW4=',
};
export const AUTH_SUCCESS = 'authSuccessAction';
export const SET_LAST_FAILED_LOGIN_TIME = 'setLastFailedLoginTime';
export const SET_BAD_CREDENTIALS = 'setBadCredentials';
export const AUTH_ERROR = 'authErrorAction';
export const LOGOUT = 'logoutAction';
export const LOGIN = 'loginAction';
export const LOGIN_SUCCESS = 'loginSuccessAction';
export const SET_TOKEN = 'setToken';
export const GRANT_TYPES = {
  PASSWORD: 'password',
};

export const ANONYMOUS_REDIRECT_PATH_STORAGE_KEY = 'anonymousRedirectPath';
