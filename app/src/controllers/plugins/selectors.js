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
import {
  BTS_GROUP_TYPE,
  IMPORT_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { EMAIL, EPAM, ORGANIZATION } from 'common/constants/pluginNames';
import { APP_LEVEL, pageLevelSelector } from 'controllers/pages';
import {
  filterAvailablePlugins,
  sortItemsByGroupType,
  groupItems,
  filterIntegrationsByName,
  filterEnabledExternalPlugins,
} from './utils';
import { MARKETPLACE_CATALOGUE_STATE } from './constants';

export const domainSelector = (state) => state.plugins || {};

export const pluginsSelector = (state) => {
  return domainSelector(state).plugins || [];
};
export const publicPluginsSelector = (state) => {
  return domainSelector(state).publicPlugins;
};
export const pluginByNameSelector = (state, name) =>
  pluginsSelector(state).find((plugin) => plugin.name === name);

export const enabledPluginSelector = (state, name) =>
  pluginByNameSelector(state, name)?.enabled || false;

export const isEpamPluginEnabledSelector = (state) => enabledPluginSelector(state, EPAM);

export const organizationPluginSelector = (state) => pluginByNameSelector(state, ORGANIZATION);

export const notificationPluginsSelector = createSelector(pluginsSelector, (plugins) => {
  return plugins.filter((item) => item.groupType === NOTIFICATION_GROUP_TYPE);
});

export const globalIntegrationsSelector = (state) =>
  domainSelector(state).integrations?.globalIntegrations || [];
const projectIntegrationsSelector = (state) =>
  domainSelector(state).integrations.projectIntegrations || [];
const organizationIntegrationsSelector = (state) =>
  domainSelector(state).integrations.organizationIntegrations || [];

export const availablePluginsSelector = createSelector(pluginsSelector, filterAvailablePlugins);

export const enabledExternalPluginsSelector = createSelector(pluginsSelector, (plugins) =>
  filterEnabledExternalPlugins(plugins),
);
export const enabledExternalPublicPluginsSelector = createSelector(
  publicPluginsSelector,
  (plugins) => filterEnabledExternalPlugins(plugins),
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

export const enabledImportPluginsSelector = createSelector(pluginsSelector, (plugins) =>
  plugins.filter((plugin) => plugin.groupType === IMPORT_GROUP_TYPE && plugin.enabled),
);

export const isImportPluginsAvailableSelector = createSelector(
  enabledImportPluginsSelector,
  (plugins) => plugins?.length > 0,
);

export const createNamedIntegrationsSelector = (integrationName, integrationsSelector) =>
  createSelector(integrationsSelector, (integrations) =>
    filterIntegrationsByName(integrations, integrationName),
  );

export const createGlobalNamedIntegrationsSelector = (name) =>
  createNamedIntegrationsSelector(name, globalIntegrationsSelector);

export const pluginsLoadingSelector = (state) => domainSelector(state).pluginsLoading;

export const createIntegrationsMapSelector = (integrationsSelector) => {
  return createSelector(integrationsSelector, (integrations) => {
    const integrationNames = integrations.map((item) => item.integrationType.name);
    const integrationNamesSet = new Set(integrationNames);

    return [...integrationNamesSet].reduce(
      (acc, name) => ({
        ...acc,
        [name]: filterIntegrationsByName(integrations, name).filter(
          // TODO: make it more reliable
          (item) => item.creator !== 'SYSTEM',
        ),
      }),
      {},
    );
  });
};

export const namedGlobalIntegrationsSelector = createIntegrationsMapSelector(
  globalIntegrationsSelector,
);
export const namedProjectIntegrationsSelector = createIntegrationsMapSelector(
  projectIntegrationsSelector,
);
export const namedOrganizationIntegrationsSelector = createIntegrationsMapSelector(
  organizationIntegrationsSelector,
);

export const availableIntegrationsByPluginNameSelector = (state, pluginName) => {
  const availablePlugins = availablePluginsSelector(state);
  const selectedPlugin = availablePlugins.find((item) => item.name === pluginName);
  if (!selectedPlugin) {
    return [];
  }

  const pageLevel = pageLevelSelector(state);
  const projectIntegrations = namedProjectIntegrationsSelector(state)[pluginName] || [];
  const organizationIntegrations = namedOrganizationIntegrationsSelector(state)[pluginName] || [];
  const globalIntegrations = namedGlobalIntegrationsSelector(state)[pluginName] || [];

  let availableIntegrations = globalIntegrations;

  if (pageLevel === APP_LEVEL.ORGANIZATION) {
    availableIntegrations = organizationIntegrations.length
      ? organizationIntegrations
      : globalIntegrations;
  }

  if (pageLevel === APP_LEVEL.PROJECT) {
    if (projectIntegrations.length) {
      availableIntegrations = projectIntegrations;
    } else if (organizationIntegrations.length) {
      availableIntegrations = organizationIntegrations;
    } else {
      availableIntegrations = globalIntegrations;
    }
  }

  return availableIntegrations.filter((item) => item.enabled);
};

const namedAvailableIntegrationsByGroupTypeSelector = (groupType) => (state) => {
  const availablePlugins = (availablePluginsSelector(state) || []).filter(
    (plugin) => plugin.groupType === groupType,
  );

  return availablePlugins.reduce((acc, plugin) => {
    const availableIntegrations = availableIntegrationsByPluginNameSelector(state, plugin.name);
    return availableIntegrations.length ? { ...acc, [plugin.name]: availableIntegrations } : acc;
  }, {});
};

export const isEmailIntegrationAvailableSelector = (state) => {
  const availableIntegrations = availableIntegrationsByPluginNameSelector(state, EMAIL);

  return !!availableIntegrations.length;
};

export const namedAvailableBtsIntegrationsSelector =
  namedAvailableIntegrationsByGroupTypeSelector(BTS_GROUP_TYPE);

const marketplaceSelector = (state) => domainSelector(state).marketplace || {};

export const marketplaceCatalogueStateSelector = (state) =>
  marketplaceSelector(state).catalogueState || MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED;

export const marketplaceInstalledPluginsSelector = (state) =>
  marketplaceSelector(state).installed || [];

export const marketplaceAvailablePluginsSelector = (state) =>
  marketplaceSelector(state).available || [];

export const marketplaceRegistrySelector = (state) =>
  marketplaceSelector(state).registry || { status: null, host: null };

export const marketplaceRegistryHostSelector = (state) => marketplaceRegistrySelector(state).host;

export const marketplaceCatalogueLoadingSelector = (state) =>
  marketplaceCatalogueStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.LOADING;

export const isMarketplaceRegistryOfflineSelector = (state) =>
  marketplaceCatalogueStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE;

// not the same thing as offline: offline the installed list is still authoritative, here the
// request produced nothing and even the installed list cannot be claimed to be current
export const hasMarketplaceCatalogueFailedSelector = (state) =>
  marketplaceCatalogueStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.FAILED;

export const marketplaceCatalogueErrorSelector = (state) =>
  marketplaceSelector(state).error || null;

// null while offline: the registry block is absent, so no update can be claimed
export const marketplacePluginUpdateVersionSelector = (state, pluginName) =>
  marketplaceInstalledPluginsSelector(state).find((plugin) => plugin.name === pluginName)
    ?.marketplace?.updateAvailable?.version || null;

export const hasMarketplacePluginUpdateSelector = (state, pluginName) =>
  marketplacePluginUpdateVersionSelector(state, pluginName) !== null;

// the filter the catalogue is showing, so a refetch does not silently drop it
/**
 * Whether this instance permits a hand-uploaded jar. Defaults to true when the field is absent,
 * so an older service-api keeps the control rather than losing it to a missing key.
 */
export const isPluginUploadAllowedSelector = (state) =>
  marketplaceSelector(state).instance?.uploadAllowed !== false;

/** The plugin the last install moved into the Installed group, or null. */
export const justInstalledMarketplacePluginSelector = (state) =>
  marketplaceSelector(state).justInstalled || null;

export const marketplaceCatalogueQuerySelector = (state) =>
  marketplaceSelector(state).query || { q: null, category: null };

export const isMarketplacePluginInstallingSelector = (state, registryId) =>
  (marketplaceSelector(state).installing || []).includes(registryId);

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

const marketplacePluginDetailSelector = (state) =>
  domainSelector(state).marketplacePluginDetail || {};

export const marketplacePluginDetailStateSelector = (state) =>
  marketplacePluginDetailSelector(state).detailState || MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED;

export const marketplacePluginDetailLoadingSelector = (state) =>
  marketplacePluginDetailStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.LOADING;

export const isMarketplacePluginDetailOfflineSelector = (state) =>
  marketplacePluginDetailStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE;

export const hasMarketplacePluginDetailFailedSelector = (state) =>
  marketplacePluginDetailStateSelector(state) === MARKETPLACE_CATALOGUE_STATE.FAILED;

export const marketplacePluginDetailRegistryHostSelector = (state) =>
  (marketplacePluginDetailSelector(state).registry || {}).host || null;

/** The registry half of the plugin page, already emptied by the reducer when unverifiable. */
export const marketplacePluginDetailDataSelector = (state) => {
  const detail = marketplacePluginDetailSelector(state);

  return {
    plugin: detail.plugin || null,
    versions: detail.versions || [],
    changelog: detail.changelog || null,
    screenshots: detail.screenshots || [],
    advisory: detail.advisory || null,
    blocked: detail.blocked || null,
    removed: detail.removed || null,
  };
};

const marketplaceLicenceSelector = (state) => domainSelector(state).marketplaceLicence || {};

export const isMarketplaceLicenceConfiguredSelector = (state) =>
  Boolean(marketplaceLicenceSelector(state).configured);

export const marketplaceLicenceCustomerIdSelector = (state) =>
  marketplaceLicenceSelector(state).customerId || null;

export const marketplaceLicenceLoadingSelector = (state) =>
  Boolean(marketplaceLicenceSelector(state).loading);
