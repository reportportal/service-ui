import { createSelector } from 'reselect';
import { OWNER } from 'common/constants/permissions';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { BTS_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import {
  JIRA,
  RALLY,
  EMAIL,
  SAUCE_LABS,
  INTEGRATION_NAMES_BY_GROUP_TYPES_MAP,
} from 'common/constants/integrationNames';
import {
  sortItemsByGroupType,
  groupItems,
  filterIntegrationsByGroupType,
  createNamedIntegrationsSelector,
  globalBtsIntegrationsSelector,
  namedGlobalIntegrationsSelectorsMap,
} from 'controllers/plugins';
import {
  ANALYZER_ATTRIBUTE_PREFIX,
  JOB_ATTRIBUTE_PREFIX,
  PROJECT_ATTRIBUTES_DELIMITER,
} from './constants';

const projectSelector = (state) => state.project || {};

const projectInfoSelector = (state) => projectSelector(state).info || {};

export const projectConfigSelector = (state) => projectInfoSelector(state).configuration || {};

export const projectMembersSelector = (state) => projectInfoSelector(state).users || [];

export const projectCreationDateSelector = (state) => projectInfoSelector(state).creationDate || 0;

export const projectIntegrationsSelector = (state) => projectInfoSelector(state).integrations || [];

export const projectPreferencesSelector = (state) => projectSelector(state).preferences || {};

export const userFiltersSelector = (state) => projectPreferencesSelector(state).filters || [];

export const subTypesSelector = (state) => projectConfigSelector(state).subTypes || [];

export const defectTypesSelector = createSelector(subTypesSelector, (subTypes) =>
  DEFECT_TYPES_SEQUENCE.reduce(
    (types, type) => (subTypes[type] ? { ...types, [type]: subTypes[type] } : types),
    {},
  ),
);

const attributesSelector = (state) => projectConfigSelector(state).attributes || {};

const createPrefixedAttributesSelector = (prefix) =>
  createSelector(attributesSelector, (attributes) =>
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

export const projectNotificationsCasesSelector = createSelector(
  projectNotificationsConfigurationSelector,
  ({ cases = [] }) =>
    cases.map((notificationCase) => ({
      ...notificationCase,
      informOwner: notificationCase.recipients.includes(OWNER),
      recipients: notificationCase.recipients.filter((item) => item !== OWNER),
    })),
);

export const projectNotificationsEnabledSelector = (state) =>
  projectNotificationsConfigurationSelector(state).enabled || false;

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

/* INTEGRATIONS */

const btsIntegrationsSelector = createSelector(projectIntegrationsSelector, (integrations) =>
  filterIntegrationsByGroupType(integrations, BTS_GROUP_TYPE),
);

export const projectIntegrationsSortedSelector = createSelector(
  projectIntegrationsSelector,
  sortItemsByGroupType,
);

export const groupedIntegrationsSelector = createSelector(
  projectIntegrationsSortedSelector,
  groupItems,
);

export const namedIntegrationsSelectorsMap = {
  [SAUCE_LABS]: createNamedIntegrationsSelector(SAUCE_LABS, projectIntegrationsSelector),
  [JIRA]: createNamedIntegrationsSelector(JIRA, projectIntegrationsSelector),
  [RALLY]: createNamedIntegrationsSelector(RALLY, projectIntegrationsSelector),
  [EMAIL]: createNamedIntegrationsSelector(EMAIL, projectIntegrationsSelector),
};

export const availableBtsIntegrationsSelector = (state) => {
  const projectBtsIntegrations = btsIntegrationsSelector(state);
  return projectBtsIntegrations.length
    ? projectBtsIntegrations
    : globalBtsIntegrationsSelector(state);
};

const namedAvailableIntegrationsByGroupTypeSelector = (groupType) => (state) => {
  const availablePluginNames = INTEGRATION_NAMES_BY_GROUP_TYPES_MAP[groupType];

  return availablePluginNames.reduce((acc, pluginName) => {
    let availableIntegrations = namedIntegrationsSelectorsMap[pluginName](state);
    if (!availableIntegrations.length) {
      availableIntegrations = namedGlobalIntegrationsSelectorsMap[pluginName](state);
    }
    return { ...acc, [pluginName]: availableIntegrations };
  }, {});
};

export const namedAvailableBtsIntegrationsSelector = namedAvailableIntegrationsByGroupTypeSelector(
  BTS_GROUP_TYPE,
);
