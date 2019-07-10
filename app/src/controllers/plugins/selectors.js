import { createSelector } from 'reselect';
import { BTS_GROUP_TYPE, NOTIFICATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import {
  JIRA,
  RALLY,
  EMAIL,
  SAUCE_LABS,
  INTEGRATION_NAMES_BY_GROUP_TYPES_MAP,
} from 'common/constants/integrationNames';
import {
  filterAvailablePlugins,
  sortItemsByGroupType,
  groupItems,
  filterIntegrationsByGroupType,
  filterIntegrationsByName,
} from './utils';

const domainSelector = (state) => state.plugins || {};

export const pluginsSelector = (state) => domainSelector(state).plugins;
export const globalIntegrationsSelector = (state) =>
  domainSelector(state).integrations.globalIntegrations || [];
export const projectIntegrationsSelector = (state) =>
  domainSelector(state).integrations.projectIntegrations || [];

export const availableGroupedPluginsSelector = createSelector(pluginsSelector, (plugins) => {
  let availableGroupedPlugins = filterAvailablePlugins(plugins);
  availableGroupedPlugins = sortItemsByGroupType(availableGroupedPlugins);
  availableGroupedPlugins = groupItems(availableGroupedPlugins);

  return availableGroupedPlugins || {};
});

export const globalBtsIntegrationsSelector = createSelector(
  globalIntegrationsSelector,
  (integrations) => filterIntegrationsByGroupType(integrations, BTS_GROUP_TYPE),
);

export const emailPluginSelector = createSelector(
  pluginsSelector,
  (plugins) =>
    plugins.filter((item) => item.groupType === NOTIFICATION_GROUP_TYPE && item.name === EMAIL)[0],
);

export const createNamedIntegrationsSelector = (integrationName, integrationsSelector) =>
  createSelector(integrationsSelector, (integrations) =>
    filterIntegrationsByName(integrations, integrationName),
  );

export const namedGlobalIntegrationsSelectorsMap = {
  [SAUCE_LABS]: createNamedIntegrationsSelector(SAUCE_LABS, globalIntegrationsSelector),
  [JIRA]: createNamedIntegrationsSelector(JIRA, globalIntegrationsSelector),
  [RALLY]: createNamedIntegrationsSelector(RALLY, globalIntegrationsSelector),
  [EMAIL]: createNamedIntegrationsSelector(EMAIL, globalIntegrationsSelector),
};

export const namedProjectIntegrationsSelectorsMap = {
  [SAUCE_LABS]: createNamedIntegrationsSelector(SAUCE_LABS, projectIntegrationsSelector),
  [JIRA]: createNamedIntegrationsSelector(JIRA, projectIntegrationsSelector),
  [RALLY]: createNamedIntegrationsSelector(RALLY, projectIntegrationsSelector),
  [EMAIL]: createNamedIntegrationsSelector(EMAIL, projectIntegrationsSelector),
};

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

export const availableIntegrationsByPluginNameSelector = (state, pluginName) => {
  let availableIntegrations = namedProjectIntegrationsSelectorsMap[pluginName](state);
  if (!availableIntegrations.length) {
    availableIntegrations = namedGlobalIntegrationsSelectorsMap[pluginName](state);
  }
  return availableIntegrations;
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
    const availableIntegrations = availableIntegrationsByPluginNameSelector(state, pluginName);
    return availableIntegrations.length ? { ...acc, [pluginName]: availableIntegrations } : acc;
  }, {});
};

export const namedAvailableBtsIntegrationsSelector = namedAvailableIntegrationsByGroupTypeSelector(
  BTS_GROUP_TYPE,
);
