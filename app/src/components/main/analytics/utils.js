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

export const provideEcGA = ({ eventName, baseEventParameters, additionalParameters }) => {
  const {
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isAnalyzerAvailable,
    isPatternAnalyzerEnabled,
    projectInfoId,
  } = baseEventParameters;

  const eventParameters = {
    instanceID: instanceId,
    version: buildVersion,
    uid: `${userId}|${instanceId}`,
    auto_analysis: getAutoAnalysisEventValue(isAnalyzerAvailable, isAutoAnalyzerEnabled),
    pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled),
    timestamp: Date.now(),
    project_id: projectInfoId ? `${projectInfoId}|${instanceId}` : 'not_set',
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
