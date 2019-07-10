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
  filterIntegrationsByName,
} from './utils';

const domainSelector = (state) => state.plugins || {};

export const pluginsSelector = (state) => domainSelector(state).plugins;
const globalIntegrationsSelector = (state) =>
  domainSelector(state).integrations.globalIntegrations || [];
const projectIntegrationsSelector = (state) =>
  domainSelector(state).integrations.projectIntegrations || [];

export const availablePluginsSelector = createSelector(pluginsSelector, filterAvailablePlugins);

export const availableGroupedPluginsSelector = createSelector(
  availablePluginsSelector,
  (availablePlugins) => {
    let availableGroupedPlugins = availablePlugins;
    availableGroupedPlugins = sortItemsByGroupType(availableGroupedPlugins);
    availableGroupedPlugins = groupItems(availableGroupedPlugins);

    return availableGroupedPlugins || {};
  },
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

export const availableIntegrationsByPluginNameSelector = (state, pluginName) => {
  const availablePlugins = availablePluginsSelector(state);
  const selectedPlugin = availablePlugins.find((item) => item.name === pluginName);
  if (!selectedPlugin) {
    return [];
  }
  let availableIntegrations = namedProjectIntegrationsSelectorsMap[pluginName](state);
  if (!availableIntegrations.length) {
    availableIntegrations = namedGlobalIntegrationsSelectorsMap[pluginName](state);
  }
  return availableIntegrations.filter((item) => item.enabled);
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

export const availableBtsIntegrationsSelector = (state) => {
  const namedAvailableBtsIntegrations = namedAvailableBtsIntegrationsSelector(state);

  return Object.keys(namedAvailableBtsIntegrations).reduce(
    (acc, pluginName) =>
      namedAvailableBtsIntegrations[pluginName]
        ? acc.concat(namedAvailableBtsIntegrations[pluginName])
        : acc,
    [],
  );
};
