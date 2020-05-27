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

import { ANALYICS_INSTANCE_KEY, ANALYTICS_ALL_KEY, OLD_HISTORY_KEY } from './constants';

export const appInfoSelector = (state) => state.appInfo || {};
const apiInfoSelector = (state) => appInfoSelector(state).api || {};
const uatInfoSelector = (state) => appInfoSelector(state).uat || {};
const uiInfoSelector = (state) => appInfoSelector(state).ui || {};

export const uiBuildVersionSelector = (state) => {
  const uiInfo = uiInfoSelector(state);
  return uiInfo.build ? uiInfo.build.version : '';
};
export const apiBuildVersionSelector = (state) => {
  const apiInfo = apiInfoSelector(state);
  return apiInfo.build ? apiInfo.build.version : '';
};

const environmentSelector = (state) => apiInfoSelector(state).environment || {};
const extensionsSelector = (state) => apiInfoSelector(state).extensions || {};
const extensionsConfigSelector = (state) => extensionsSelector(state).result || {};
export const instanceIdSelector = (state) =>
  extensionsConfigSelector(state)[ANALYICS_INSTANCE_KEY] || '';
export const analyticsEnabledSelector = (state) =>
  extensionsConfigSelector(state)[ANALYTICS_ALL_KEY] === 'true';
export const analyzerExtensionsSelector = (state) => extensionsSelector(state).analyzers || [];
export const authExtensionsSelector = (state) => uatInfoSelector(state).authExtensions || {};
export const isOldHistorySelector = (state) =>
  environmentSelector(state)[OLD_HISTORY_KEY] === 'true';
