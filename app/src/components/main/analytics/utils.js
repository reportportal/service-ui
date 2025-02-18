/*
 * Copyright 2021 EPAM Systems
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

import GA4 from 'react-ga4';
import PropTypes from 'prop-types';
import { CONDITION_ANY } from 'components/filterEntities/constants';

export const normalizeDimensionValue = (value) => {
  return value !== undefined ? value.toString() : undefined;
};

export const getAutoAnalysisEventValue = (isAnalyzerAvailable, value) => {
  return isAnalyzerAvailable ? normalizeDimensionValue(value) : 'no_analyzer';
};

export const normalizeEventString = (string = '') =>
  string
    .trim()
    .replace(/\s+|-/g, '_')
    .toLowerCase();

export const getAppVersion = (buildVersion) =>
  buildVersion
    ?.split('.')
    .splice(0, 2)
    .join('.');

export const provideEcGA = ({ eventName, baseEventParameters, additionalParameters }) => {
  const {
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isAnalyzerAvailable,
    isPatternAnalyzerEnabled,
    projectInfoId,
    isAdmin,
    organizationId,
  } = baseEventParameters;

  const eventParameters = {
    instanceID: instanceId,
    version: getAppVersion(buildVersion),
    uid: `${userId}|${instanceId}`,
    organization_id: `${organizationId}|${instanceId}`,
    auto_analysis: getAutoAnalysisEventValue(isAnalyzerAvailable, isAutoAnalyzerEnabled),
    pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled),
    timestamp: Date.now(),
    ...(!isAdmin && { project_id: `${projectInfoId}|${instanceId}` }),
    ...additionalParameters,
  };

  GA4.event(eventName, eventParameters);
};

export const baseEventParametersShape = PropTypes.shape({
  instanceId: PropTypes.string.isRequired,
  buildVersion: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
  isAutoAnalyzerEnabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  isPatternAnalyzerEnabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  projectInfoId: PropTypes.number.isRequired,
  isAdmin: PropTypes.bool.isRequired,
}).isRequired;

export const getApplyFilterEventParams = (fields, initialState, conditionProp) => {
  const type = Object.keys(fields)
    .filter((field) => fields[field].value !== initialState[field])
    .join('#');

  const condition =
    fields[conditionProp].value !== initialState[conditionProp]
      ? fields[conditionProp]?.value || CONDITION_ANY
      : undefined;

  return { type, condition };
};
