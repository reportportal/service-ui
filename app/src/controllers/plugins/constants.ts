/*
 * Copyright 2026 EPAM Systems
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

export const NAMESPACE = 'plugins';
export const SET_PROJECT_INTEGRATIONS = 'setProjectIntegrations';
export const FETCH_GLOBAL_INTEGRATIONS = 'fetchGlobalIntegrations';
export const FETCH_GLOBAL_INTEGRATIONS_SUCCESS = 'fetchGlobalIntegrationsSuccess';
export const SET_ORGANIZATION_INTEGRATIONS = 'setOrganizationIntegrations';

export const FETCH_PLUGINS = 'fetchPlugins';
export const FETCH_PUBLIC_PLUGINS = 'fetchPublicPlugins';
export const REMOVE_PLUGIN = 'removePlugin';
export const UPDATE_PLUGIN_SUCCESS = 'updatePluginSuccess';
export const REMOVE_PLUGIN_SUCCESS = 'removePluginSuccess';

export const UPDATE_INTEGRATION = 'updateIntegration';
export const REMOVE_INTEGRATION = 'removeIntegration';
export const ADD_INTEGRATION = 'addIntegration';

export const UPDATE_GLOBAL_INTEGRATION_SUCCESS = 'updateGlobalIntegrationSuccess';
export const ADD_GLOBAL_INTEGRATION_SUCCESS = 'addGlobalIntegrationSuccess';
export const REMOVE_GLOBAL_INTEGRATION_SUCCESS = 'removeGlobalIntegrationSuccess';

export const REMOVE_PROJECT_INTEGRATIONS_BY_TYPE = 'removeProjectIntegrationsByType';
export const REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS = 'removeProjectIntegrationsByTypeSuccess';
export const REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE = 'removeOrganizationIntegrationsByType';
export const REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE_SUCCESS =
  'removeOrganizationIntegrationsByTypeSuccess';
export const REMOVE_GLOBAL_INTEGRATIONS_BY_TYPE_SUCCESS = 'removeGlobalIntegrationsByTypeSuccess';
export const ADD_PROJECT_INTEGRATION_SUCCESS = 'addProjectIntegrationSuccess';
export const UPDATE_PROJECT_INTEGRATION_SUCCESS = 'updateProjectIntegrationSuccess';
export const REMOVE_PROJECT_INTEGRATION_SUCCESS = 'removeProjectIntegrationSuccess';

export const ADD_ORGANIZATION_INTEGRATION_SUCCESS = 'addOrganizationIntegrationSuccess';
export const UPDATE_ORGANIZATION_INTEGRATION_SUCCESS = 'updateOrganizationIntegrationSuccess';
export const REMOVE_ORGANIZATION_INTEGRATION_SUCCESS = 'removeOrganizationIntegrationSuccess';

export const GLOBAL_INTEGRATIONS = 'globalIntegrations';
export const PROJECT_INTEGRATIONS = 'projectIntegrations';
export const ORGANIZATION_INTEGRATIONS = 'organizationIntegrations';
export const PUBLIC_PLUGINS = 'publicPlugins';

export const SECRET_FIELDS_KEY = 'rp_secretFieldsToClear';

export const MARKETPLACE = 'marketplace';

export const FETCH_MARKETPLACE_CATALOGUE = 'fetchMarketplaceCatalogue';
export const FETCH_MARKETPLACE_CATALOGUE_START = 'fetchMarketplaceCatalogueStart';
export const FETCH_MARKETPLACE_CATALOGUE_SUCCESS = 'fetchMarketplaceCatalogueSuccess';
export const FETCH_MARKETPLACE_CATALOGUE_ERROR = 'fetchMarketplaceCatalogueError';

/** How long a search waits before it becomes a request, so a keystroke does not become one. */
export const MARKETPLACE_SEARCH_DEBOUNCE = 300;

export const INSTALL_MARKETPLACE_PLUGIN = 'installMarketplacePlugin';
export const INSTALL_MARKETPLACE_PLUGIN_START = 'installMarketplacePluginStart';
export const INSTALL_MARKETPLACE_PLUGIN_SUCCESS = 'installMarketplacePluginSuccess';
export const INSTALL_MARKETPLACE_PLUGIN_ERROR = 'installMarketplacePluginError';
export const CLEAR_JUST_INSTALLED_MARKETPLACE_PLUGIN = 'clearJustInstalledMarketplacePlugin';

/** Registry reachability as reported by service-api. */
export const REGISTRY_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
} as const;

/**
 * Offline is a loaded state, not a failure: the response is authoritative about installed
 * plugins, only the registry-sourced parts are missing.
 */
export const MARKETPLACE_CATALOGUE_STATE = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  LOADING: 'LOADING',
  LOADED_ONLINE: 'LOADED_ONLINE',
  LOADED_OFFLINE: 'LOADED_OFFLINE',
  FAILED: 'FAILED',
} as const;

export const FETCH_MARKETPLACE_PLUGIN_DETAIL = 'fetchMarketplacePluginDetail';
export const FETCH_MARKETPLACE_PLUGIN_DETAIL_START = 'fetchMarketplacePluginDetailStart';
export const FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS = 'fetchMarketplacePluginDetailSuccess';
export const FETCH_MARKETPLACE_PLUGIN_DETAIL_ERROR = 'fetchMarketplacePluginDetailError';

export const FETCH_MARKETPLACE_LICENCE = 'fetchMarketplaceLicence';
export const FETCH_MARKETPLACE_LICENCE_SUCCESS = 'fetchMarketplaceLicenceSuccess';
export const SET_MARKETPLACE_LICENCE = 'setMarketplaceLicence';
export const DELETE_MARKETPLACE_LICENCE = 'deleteMarketplaceLicence';
export const MARKETPLACE_LICENCE_START = 'marketplaceLicenceStart';
export const MARKETPLACE_LICENCE_ERROR = 'marketplaceLicenceError';

/**
 * The bounds PUT /v1/plugins/licence declares. They are stated here because the UI has to
 * decide before it sends; that they are still the service's bounds is asserted against
 * __fixtures__/request-constraints.json, which service-api generates from its own validator.
 */
export const MARKETPLACE_LICENCE_MAX_LENGTHS = {
  customerId: 255,
  privateKey: 512,
} as const;
