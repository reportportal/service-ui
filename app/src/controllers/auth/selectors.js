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

const authSelector = (state) => state.auth || {};

export const isAuthorizedSelector = (state) => !!authSelector(state).authorized;

const userTokenSelector = (state) => authSelector(state).token;
export const tokenTypeSelector = (state) => userTokenSelector(state).type;
export const tokenValueSelector = (state) => userTokenSelector(state).value;
const tokenStringSelector = (state) => `${tokenTypeSelector(state)} ${tokenValueSelector(state)}`;

export const tokenSelector = (state) => tokenStringSelector(state);

export const lastFailedLoginTimeSelector = (state) => authSelector(state).lastFailedLoginTime;

export const badCredentialsSelector = (state) => authSelector(state).badCredentials;
