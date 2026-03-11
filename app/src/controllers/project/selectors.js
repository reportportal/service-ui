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
import { capitalize } from 'common/utils/stringUtils';
import { OWNER } from 'common/constants/permissions';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import * as logLevels from 'common/constants/logLevels';
import {
  ANALYZER_ATTRIBUTE_PREFIX,
  JOB_ATTRIBUTE_PREFIX,
  PROJECT_ATTRIBUTES_DELIMITER,
  PA_ATTRIBUTE_ENABLED_KEY,
  AA_ATTRIBUTE_ENABLED_KEY,
  NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY,
  NOTIFICATIONS_PLUGIN_ATTRIBUTE_ENABLED_KEY,
} from './constants';

const projectSelector = (state) => state.project || {};

export const projectInfoSelector = (state) => projectSelector(state).info || {};

export const projectInfoLoadingSelector = (state) => projectSelector(state).infoLoading;

export const projectConfigSelector = (state) => projectInfoSelector(state).configuration || {};

export const projectMembersSelector = (state) => projectInfoSelector(state).users || [];

export const projectCreationDateSelector = (state) => projectInfoSelector(state).creationDate || 0;

export const projectInfoIdSelector = (state) => projectInfoSelector(state).projectId;

export const projectPreferencesSelector = (state) => projectSelector(state).preferences || {};

export const userFiltersSelector = (state) => projectPreferencesSelector(state).filters || [];

export const subTypesSelector = (state) => projectConfigSelector(state).subTypes || [];

export const projectAttributesSelector = (state) => projectConfigSelector(state).attributes || {};

export const autoAnalysisEnabledSelector = (state) =>
  projectAttributesSelector(state)[AA_ATTRIBUTE_ENABLED_KEY];

export const patternAnalysisEnabledSelector = (state) =>
  projectAttributesSelector(state)[PA_ATTRIBUTE_ENABLED_KEY];

export const defectTypesSelector = createSelector(subTypesSelector, (subTypes) =>
  DEFECT_TYPES_SEQUENCE.reduce(
    (types, type) => (subTypes[type] ? { ...types, [type]: subTypes[type] } : types),
    {},
  ),
);

export const orderedDefectFieldsSelector = createSelector(subTypesSelector, (subTypes) => {
  const PREFIX = 'statistics$defects$';
  const result = [];
  DEFECT_TYPES_SEQUENCE.forEach((type) => {
    result.push(`${PREFIX}${type.toLowerCase()}$total`);
    subTypes[type].forEach((item) => {
      result.push(`${PREFIX}${type.toLowerCase()}$${item.locator}`);
    });
  });
  return result;
});

export const orderedContentFieldsSelector = createSelector(
  orderedDefectFieldsSelector,
  (orderedDefectFields) => [
    'statistics$executions$total',
    'statistics$executions$passed',
    'statistics$executions$failed',
    'statistics$executions$skipped',
    ...orderedDefectFields,
  ],
);

const createPrefixedAttributesSelector = (prefix) =>
  createSelector(projectAttributesSelector, (attributes) =>
    Object.keys(attributes).reduce(
      (result, attribute) =>
        attribute.match(`${prefix}${PROJECT_ATTRIBUTES_DELIMITER}`)
          ? {
              ...result,
              [attribute.replace(`${prefix}${PROJECT_ATTRIBUTES_DELIMITER}`, '')]: attributes[
                attribute
              ],
            }
          : result,
      {},
    ),
  );

export const analyzerAttributesSelector = createPrefixedAttributesSelector(
  ANALYZER_ATTRIBUTE_PREFIX,
);

export const jobAttributesSelector = createPrefixedAttributesSelector(JOB_ATTRIBUTE_PREFIX);

export const externalSystemSelector = (state) => projectConfigSelector(state).externalSystem || [];

export const projectNotificationsConfigurationSelector = (state) =>
  projectConfigSelector(state).notificationsConfiguration || {};

export const projectNotificationSelector = (state) => projectSelector(state).notifications || {};

export const projectNotificationsCasesSelector = createSelector(
  projectNotificationsConfigurationSelector,
  ({ cases = [] }) =>
    cases.map((notificationCase) => ({
      ...notificationCase,
      informOwner: notificationCase.recipients.includes(OWNER),
      recipients: notificationCase.recipients.filter((item) => item !== OWNER),
    })),
);

export const projectNotificationsSelector = createSelector(
  projectNotificationSelector,
  ({ notifications = [] }) =>
    notifications.map((notification) => ({
      ...notification,
      informOwner: notification.recipients?.includes(OWNER),
      recipients: notification.recipients?.filter((item) => item !== OWNER),
    })),
);

export const isExistingLaunchNamesSelector = (state) =>
  projectNotificationSelector(state).isExistingLaunchNames ?? {};

export const projectNotificationsEnabledSelector = (state) =>
  projectNotificationsConfigurationSelector(state).enabled || false;

export const projectNotificationsStateSelector = (state) =>
  !!(projectAttributesSelector(state)[NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY].toString() === 'true');

export const projectPluginNotificationsStateSelector = (pluginName) =>
  createSelector(
    projectAttributesSelector,
    (attributes) => attributes[NOTIFICATIONS_PLUGIN_ATTRIBUTE_ENABLED_KEY(pluginName)] === 'true',
  );

export const projectNotificationsLoadingSelector = (state) =>
  projectNotificationSelector(state).loading || false;

export const defectColorsSelector = createSelector(projectConfigSelector, (config) => {
  const colors = {};
  Object.keys(config).length &&
    Object.keys(config.subTypes).forEach((key) => {
      colors[key.toLowerCase()] = config.subTypes[key][0].color;
      const defectGroup = config.subTypes[key];
      defectGroup.forEach((defect) => {
        colors[defect.locator] = defect.color;
      });
    });
  return colors;
});

export const getDefectTypeSelector = createSelector(subTypesSelector, (subTypes) => (issueType) =>
  Object.keys(subTypes).reduce(
    (defectType, subType) =>
      subTypes[subType].find((defectSubType) => defectSubType.locator === issueType) || defectType,
    null,
  ),
);

/* PATTERN-ANALYSIS */

export const patternsSelector = (state) => projectConfigSelector(state).patterns || [];
export const PAStateSelector = (state) =>
  !!(projectAttributesSelector(state)[PA_ATTRIBUTE_ENABLED_KEY].toString() === 'true');
export const enabledPattersSelector = createSelector(patternsSelector, (patterns) =>
  patterns.filter((pattern) => pattern.enabled),
);

export const logTypesSelector = createSelector(
  (state) => projectSelector(state).logTypes || [],
  (logTypes) => [...logTypes].sort((a, b) => b.level - a.level),
);
export const logTypesLoadingSelector = (state) => projectSelector(state).logTypesLoading || false;
export const filterableLogTypesSelector = createSelector(logTypesSelector, (logTypes) => {
  const filterableLogTypes = logTypes
    .filter((logType) => logType.is_filterable)
    .map((logType) => ({
      ...logType,
      label: logType.is_system ? capitalize(logType.name) : logType.name,
    }));

  filterableLogTypes.push({
    id: logLevels.ALL,
    name: logLevels.ALL,
    label: capitalize(logLevels.ALL),
  });

  return filterableLogTypes;
});
