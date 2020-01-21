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

export { TOKEN_KEY, DEFAULT_TOKEN, SET_TOKEN, LOGOUT } from './constants';
export {
  loginAction,
  logoutAction,
  authSuccessAction,
  setTokenAction,
  resetTokenAction,
} from './actionCreators';
export { authReducer } from './reducer';
export {
  isAuthorizedSelector,
  tokenSelector,
  lastFailedLoginTimeSelector,
  badCredentialsSelector,
} from './selectors';
export { ANONYMOUS_REDIRECT_PATH_STORAGE_KEY } from './constants';
