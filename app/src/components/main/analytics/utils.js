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
import { APP_LEVEL } from 'controllers/pages/constants';
import { parseFormattedDate } from '../dateRange';

export const normalizeDimensionValue = (value) => {
  return value !== undefined ? value.toString() : undefined;
};

export const getAutoAnalysisEventValue = (isAnalyzerAvailable, value) => {
  return isAnalyzerAvailable ? normalizeDimensionValue(value) : 'no_analyzer';
};

export const normalizeEventString = (string = '') =>
  string.trim().replace(/\s+|-/g, '_').toLowerCase();

export const buildEventParameters = (baseEventParameters, additionalParameters) => {
  const {
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isAnalyzerAvailable,
    isPatternAnalyzerEnabled,
    projectInfoId,
    organizationId,
    entryType,
    pageLevel,
  } = baseEventParameters;

  const isProjectLevel = pageLevel === APP_LEVEL.PROJECT;
  const isOrganizationLevel = pageLevel === APP_LEVEL.ORGANIZATION;

  return {
    instanceID: instanceId,
    version: buildVersion,
    timestamp: Date.now(),
    uid: `${userId}|${instanceId}`,
    ...((isOrganizationLevel || isProjectLevel) && {
      kind: entryType || 'not_set',
      organization_id: organizationId ? `${organizationId}|${instanceId}` : 'not_set',
    }),
    ...(isProjectLevel && {
      auto_analysis:
        getAutoAnalysisEventValue(isAnalyzerAvailable, isAutoAnalyzerEnabled) || 'not_set',
      pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled) || 'not_set',
      project_id: projectInfoId ? `${projectInfoId}|${instanceId}` : 'not_set',
    }),
    ...additionalParameters,
  };
};

export const provideEcGA = ({ eventName, baseEventParameters, additionalParameters }) => {
  const eventParameters = buildEventParameters(baseEventParameters, additionalParameters);
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
  organizationId: PropTypes.number,
  entryType: PropTypes.string,
  pageLevel: PropTypes.string,
}).isRequired;

export const getApplyFilterEventParams = (
  fields,
  initialState,
  initialDateState = '',
  conditionProp,
  predefinedLabels = {},
) => {
  const { [conditionProp]: dateField, ...fieldsWithoutDate } = fields;

  let type = Object.keys(fieldsWithoutDate)
    .filter((field) => fields[field].value.toString() !== initialState[field].toString())
    .join('#');

  let conditionValue;

  if (dateField.value !== initialDateState) {
    conditionValue = dateField?.value;
    type = type ? `${type}#${conditionProp}` : conditionProp;
  }

  let condition = 'not_set';

  if (conditionValue !== undefined) {
    if (conditionValue in predefinedLabels) {
      condition = predefinedLabels[conditionValue];
    } else {
      const { startDate, endDate } = parseFormattedDate(conditionValue);
      const timestampStartDate = new Date(startDate);
      const timestampEndDate = new Date(endDate);
      const msInDay = 1000 * 60 * 60 * 24;
      const countDays = Math.round((timestampEndDate - timestampStartDate) / msInDay);
      condition = countDays || 'not_set';
    }
  }

  return { type, condition };
};
