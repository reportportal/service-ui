import { createSelector } from 'reselect';
import { BTS_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { JIRA, RALLY, EMAIL, SAUCE_LABS } from 'common/constants/integrationNames';
import {
  filterAvailablePlugins,
  sortItemsByGroupType,
  groupItems,
  filterIntegrationsByGroupType,
  filterIntegrationsByName,
} from './utils';

const domainSelector = (state) => state.plugins || {};

export const pluginsSelector = (state) => domainSelector(state).plugins;
export const globalIntegrationsSelector = (state) => domainSelector(state).globalIntegrations;

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
