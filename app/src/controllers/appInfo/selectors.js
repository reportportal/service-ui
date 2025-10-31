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

import { createSelector } from 'reselect';
import { idSelector, isAdminSelector } from 'controllers/user/selectors';
import {
  autoAnalysisEnabledSelector,
  enabledPattersSelector,
  patternAnalysisEnabledSelector,
  projectInfoIdSelector,
} from 'controllers/project/selectors';
import { PASSWORD_MIN_ALLOWED_LENGTH } from 'common/constants/validation';
import {
  ANALYTICS_INSTANCE_KEY,
  ANALYTICS_ALL_KEY,
  OLD_HISTORY_KEY,
  GA_MEASUREMENT_ID,
  INSTANCE_TYPE,
  NOT_PROVIDED,
  ALLOW_DELETE_ACCOUNT,
  USER_SUGGESTIONS,
  SSO_USERS_ONLY_KEY,
  SERVER_SESSION_EXPIRATION_KEY,
  SERVER_FOOTER_LINKS_KEY,
  IMPORTANT_LAUNCHES_FEATURE_KEY,
  PASSWORD_MIN_LENGTH_KEY,
} from './constants';

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
const apiJobsSelector = (state) => apiInfoSelector(state).jobs || {};
const extensionsSelector = (state) => apiInfoSelector(state).extensions || {};
const extensionsConfigSelector = (state) => extensionsSelector(state).result || {};
export const instanceIdSelector = (state) =>
  extensionsConfigSelector(state)[ANALYTICS_INSTANCE_KEY] || '';
export const analyticsEnabledSelector = (state) =>
  extensionsConfigSelector(state)[ANALYTICS_ALL_KEY] === 'true';
export const analyzerExtensionsSelector = (state) => extensionsSelector(state).analyzers || [];
export const authExtensionsSelector = (state) => uatInfoSelector(state).authExtensions || {};
export const ssoUsersOnlySelector = (state) =>
  extensionsConfigSelector(state)[SSO_USERS_ONLY_KEY] === 'true';
export const importantLaunchesEnabledSelector = (state) =>
  extensionsConfigSelector(state)[IMPORTANT_LAUNCHES_FEATURE_KEY] === 'true';
export const sessionExpirationTimeSelector = (state) =>
  Number(extensionsConfigSelector(state)[SERVER_SESSION_EXPIRATION_KEY]) || Infinity;
export const passwordMinLengthSelector = (state) =>
  Number(extensionsConfigSelector(state)[PASSWORD_MIN_LENGTH_KEY]) || PASSWORD_MIN_ALLOWED_LENGTH;
export const serverFooterLinksSelector = createSelector(
  extensionsConfigSelector,
  (extensionsConfig) => JSON.parse(extensionsConfig?.[SERVER_FOOTER_LINKS_KEY] || `[]`),
);
export const isOldHistorySelector = (state) =>
  environmentSelector(state)[OLD_HISTORY_KEY] === 'true';
export const isDemoInstanceSelector = (state) => !!apiJobsSelector(state).flushingDataTrigger;
export const flushDataInSelector = (state) =>
  apiJobsSelector(state).flushingDataTrigger?.triggersIn || null;
export const gaMeasurementIdSelector = (state) => environmentSelector(state)[GA_MEASUREMENT_ID];
export const instanceTypeSelector = (state) =>
  environmentSelector(state)[INSTANCE_TYPE] || NOT_PROVIDED;
export const allowDeleteAccountSelector = (state) =>
  environmentSelector(state)[ALLOW_DELETE_ACCOUNT] === 'true';
export const areUserSuggestionsAllowedSelector = (state) =>
  (environmentSelector(state)[USER_SUGGESTIONS] || 'true') === 'true';
export const baseEventParametersSelector = createSelector(
  instanceIdSelector,
  apiBuildVersionSelector,
  idSelector,
  autoAnalysisEnabledSelector,
  patternAnalysisEnabledSelector,
  projectInfoIdSelector,
  isAdminSelector,
  analyzerExtensionsSelector,
  enabledPattersSelector,
  (
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isPatternAnalyzerEnabled,
    projectInfoId,
    isAdmin,
    analyzerExtensions,
    enabledPatterns,
  ) => ({
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isPatternAnalyzerEnabled:
      !!enabledPatterns.length && String(isPatternAnalyzerEnabled) === 'true',
    projectInfoId,
    isAdmin,
    isAnalyzerAvailable: !!analyzerExtensions.length,
  }),
);
