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
import { BTS_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import {
  JIRA,
  RALLY,
  EMAIL,
  SAUCE_LABS,
  SAML,
  LDAP,
  AD,
  PLUGIN_NAMES_BY_GROUP_TYPES_MAP,
} from 'common/constants/pluginNames';
import {
  filterAvailablePlugins,
  sortItemsByGroupType,
  groupItems,
  filterIntegrationsByName,
  filterEnabledPlugins,
} from './utils';

export const domainSelector = (state) => state.plugins || {};

export const pluginsSelector = (state) => domainSelector(state).plugins;
export const pluginByNameSelector = (state, name) =>
  pluginsSelector(state).find((plugin) => plugin.name === name);

export const globalIntegrationsSelector = (state) =>
  domainSelector(state).integrations.globalIntegrations || [];
const projectIntegrationsSelector = (state) =>
  domainSelector(state).integrations.projectIntegrations || [];

export const availablePluginsSelector = createSelector(pluginsSelector, filterAvailablePlugins);
export const enabledPluginNamesSelector = createSelector(pluginsSelector, (plugins) =>
  filterEnabledPlugins(plugins).map((plugin) => plugin.name),
);

export const availableGroupedPluginsSelector = createSelector(
  availablePluginsSelector,
  (availablePlugins) => {
    let availableGroupedPlugins = availablePlugins;
    availableGroupedPlugins = sortItemsByGroupType(availableGroupedPlugins);
    availableGroupedPlugins = groupItems(availableGroupedPlugins);

    return availableGroupedPlugins || {};
  },
);

export const isBtsPluginsExistSelector = createSelector(pluginsSelector, (plugins) =>
  plugins.some((item) => item.groupType === BTS_GROUP_TYPE),
);

export const enabledBtsPluginsSelector = createSelector(pluginsSelector, (plugins) =>
  plugins.filter((item) => item.groupType === BTS_GROUP_TYPE && item.enabled),
);

export const createNamedIntegrationsSelector = (integrationName, integrationsSelector) =>
  createSelector(integrationsSelector, (integrations) =>
    filterIntegrationsByName(integrations, integrationName),
  );

export const createGlobalNamedIntegrationsSelector = (name) =>
  createNamedIntegrationsSelector(name, globalIntegrationsSelector);

export const namedGlobalIntegrationsSelectorsMap = {
  [SAUCE_LABS]: createNamedIntegrationsSelector(SAUCE_LABS, globalIntegrationsSelector),
  [JIRA]: createNamedIntegrationsSelector(JIRA, globalIntegrationsSelector),
  [RALLY]: createNamedIntegrationsSelector(RALLY, globalIntegrationsSelector),
  [EMAIL]: createNamedIntegrationsSelector(EMAIL, globalIntegrationsSelector),
  [SAML]: createNamedIntegrationsSelector(SAML, globalIntegrationsSelector),
  [LDAP]: createNamedIntegrationsSelector(LDAP, globalIntegrationsSelector),
  [AD]: createNamedIntegrationsSelector(AD, globalIntegrationsSelector),
};

export const namedProjectIntegrationsSelectorsMap = {
  [SAUCE_LABS]: createNamedIntegrationsSelector(SAUCE_LABS, projectIntegrationsSelector),
  [JIRA]: createNamedIntegrationsSelector(JIRA, projectIntegrationsSelector),
  [RALLY]: createNamedIntegrationsSelector(RALLY, projectIntegrationsSelector),
  [EMAIL]: createNamedIntegrationsSelector(EMAIL, projectIntegrationsSelector),
  [SAML]: createNamedIntegrationsSelector(SAML, projectIntegrationsSelector),
  [LDAP]: createNamedIntegrationsSelector(LDAP, projectIntegrationsSelector),
  [AD]: createNamedIntegrationsSelector(AD, projectIntegrationsSelector),
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
  const availablePluginNames = PLUGIN_NAMES_BY_GROUP_TYPES_MAP[groupType];

  return availablePluginNames.reduce((acc, pluginName) => {
    const availableIntegrations = availableIntegrationsByPluginNameSelector(state, pluginName);
    return availableIntegrations.length ? { ...acc, [pluginName]: availableIntegrations } : acc;
  }, {});
};

export const isEmailIntegrationAvailableSelector = (state) => {
  const availableIntegrations = availableIntegrationsByPluginNameSelector(state, EMAIL);

  return !!availableIntegrations.length;
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
