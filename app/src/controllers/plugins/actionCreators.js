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

import {
  FETCH_PLUGINS,
  FETCH_PUBLIC_PLUGINS,
  REMOVE_PLUGIN,
  UPDATE_PLUGIN_SUCCESS,
  REMOVE_PLUGIN_SUCCESS,
  UPDATE_INTEGRATION,
  REMOVE_INTEGRATION,
  ADD_INTEGRATION,
  SET_PROJECT_INTEGRATIONS,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE,
  REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE_SUCCESS,
  ADD_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_PROJECT_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATION_SUCCESS,
  ADD_ORGANIZATION_INTEGRATION_SUCCESS,
  UPDATE_ORGANIZATION_INTEGRATION_SUCCESS,
  REMOVE_ORGANIZATION_INTEGRATION_SUCCESS,
  ADD_GLOBAL_INTEGRATION_SUCCESS,
  UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  FETCH_GLOBAL_INTEGRATIONS,
  FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
  REMOVE_GLOBAL_INTEGRATIONS_BY_TYPE_SUCCESS,
  SET_ORGANIZATION_INTEGRATIONS,
  FETCH_MARKETPLACE_CATALOGUE,
  FETCH_MARKETPLACE_CATALOGUE_START,
  FETCH_MARKETPLACE_CATALOGUE_SUCCESS,
  FETCH_MARKETPLACE_CATALOGUE_ERROR,
  INSTALL_MARKETPLACE_PLUGIN,
  INSTALL_MARKETPLACE_PLUGIN_START,
  INSTALL_MARKETPLACE_PLUGIN_SUCCESS,
  INSTALL_MARKETPLACE_PLUGIN_ERROR,
  CLEAR_JUST_INSTALLED_MARKETPLACE_PLUGIN,
  FETCH_MARKETPLACE_PLUGIN_DETAIL,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_START,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_ERROR,
  FETCH_MARKETPLACE_LICENCE,
  FETCH_MARKETPLACE_LICENCE_SUCCESS,
  SET_MARKETPLACE_LICENCE,
  DELETE_MARKETPLACE_LICENCE,
  MARKETPLACE_LICENCE_START,
  MARKETPLACE_LICENCE_ERROR,
} from './constants';

export const fetchPluginsAction = () => ({
  type: FETCH_PLUGINS,
});

export const fetchPublicPluginsAction = () => ({
  type: FETCH_PUBLIC_PLUGINS,
});

export const removePluginAction = (id, callback, pluginName) => ({
  type: REMOVE_PLUGIN,
  payload: { id, callback, pluginName },
});

export const removePluginSuccessAction = (id) => ({
  type: REMOVE_PLUGIN_SUCCESS,
  payload: id,
});

export const updatePluginSuccessAction = (plugin) => ({
  type: UPDATE_PLUGIN_SUCCESS,
  payload: plugin,
});

export const fetchGlobalIntegrationsAction = () => ({
  type: FETCH_GLOBAL_INTEGRATIONS,
});

export const fetchGlobalIntegrationsSuccessAction = (globalIntegrations) => ({
  type: FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
  payload: globalIntegrations,
});

export const setProjectIntegrationsAction = (projectIntegrations) => ({
  type: SET_PROJECT_INTEGRATIONS,
  payload: projectIntegrations,
});

export const updateIntegrationAction = (
  data,
  isGlobal,
  id,
  pluginName,
  callback,
  metaData,
  isOrganizational = false,
) => ({
  type: UPDATE_INTEGRATION,
  payload: { data, isGlobal, isOrganizational, id, pluginName, callback },
  meta: metaData,
});

export const addIntegrationAction = (
  data,
  isGlobal,
  pluginName,
  callback,
  metaData,
  isOrganizational = false,
) => ({
  type: ADD_INTEGRATION,
  payload: { data, isGlobal, isOrganizational, pluginName, callback },
  meta: metaData,
});

export const updateGlobalIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const addGlobalIntegrationSuccessAction = (integration) => ({
  type: ADD_GLOBAL_INTEGRATION_SUCCESS,
  payload: integration,
});

export const removeGlobalIntegrationSuccessAction = (id) => ({
  type: REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  payload: id,
});

export const updateProjectIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_PROJECT_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const addProjectIntegrationSuccessAction = (integration) => ({
  type: ADD_PROJECT_INTEGRATION_SUCCESS,
  payload: integration,
});

export const addOrganizationIntegrationSuccessAction = (integration) => ({
  type: ADD_ORGANIZATION_INTEGRATION_SUCCESS,
  payload: integration,
});

export const updateOrganizationIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_ORGANIZATION_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const removeOrganizationIntegrationSuccessAction = (id) => ({
  type: REMOVE_ORGANIZATION_INTEGRATION_SUCCESS,
  payload: id,
});

export const removeIntegrationAction = (id, isGlobal, callback, isOrganizational = false) => ({
  type: REMOVE_INTEGRATION,
  payload: { id, isGlobal, callback, isOrganizational },
});

export const removeProjectIntegrationSuccessAction = (id) => ({
  type: REMOVE_PROJECT_INTEGRATION_SUCCESS,
  payload: id,
});

export const removeProjectIntegrationsByTypeAction = (instanceType) => ({
  type: REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  payload: instanceType,
});

export const removeProjectIntegrationsByTypeSuccessAction = (instanceType) => ({
  type: REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  payload: instanceType,
});

export const removeOrganizationIntegrationsByTypeAction = (instanceType) => ({
  type: REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE,
  payload: instanceType,
});

export const removeOrganizationIntegrationsByTypeSuccessAction = (instanceType) => ({
  type: REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE_SUCCESS,
  payload: instanceType,
});

export const removeGlobalIntegrationsByTypeSuccessAction = (instanceType) => ({
  type: REMOVE_GLOBAL_INTEGRATIONS_BY_TYPE_SUCCESS,
  payload: instanceType,
});

export const setOrganizationIntegrationsAction = (organizationIntegrations) => ({
  type: SET_ORGANIZATION_INTEGRATIONS,
  payload: organizationIntegrations,
});

// `debounced` marks a request the user is still typing into; every other one leaves at once
export const fetchMarketplaceCatalogueAction = ({ q, category, debounced } = {}) => ({
  type: FETCH_MARKETPLACE_CATALOGUE,
  payload: { q, category, debounced },
});

// carries the filter so the store can remember what the catalogue is showing
export const fetchMarketplaceCatalogueStartAction = ({ q, category } = {}) => ({
  type: FETCH_MARKETPLACE_CATALOGUE_START,
  payload: { q, category },
});

export const fetchMarketplaceCatalogueSuccessAction = (catalogue) => ({
  type: FETCH_MARKETPLACE_CATALOGUE_SUCCESS,
  payload: catalogue,
});

export const fetchMarketplaceCatalogueErrorAction = (error) => ({
  type: FETCH_MARKETPLACE_CATALOGUE_ERROR,
  payload: error,
});

// install, update and rollback are the same request: only the version differs, and it is required
export const installMarketplacePluginAction = (registryId, version) => ({
  type: INSTALL_MARKETPLACE_PLUGIN,
  payload: { registryId, version },
});

export const installMarketplacePluginStartAction = (registryId) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_START,
  payload: registryId,
});

export const installMarketplacePluginSuccessAction = (registryId) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_SUCCESS,
  payload: registryId,
});

export const clearJustInstalledMarketplacePluginAction = () => ({
  type: CLEAR_JUST_INSTALLED_MARKETPLACE_PLUGIN,
});

export const installMarketplacePluginErrorAction = (registryId, error) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_ERROR,
  payload: { registryId, error },
});

export const fetchMarketplacePluginDetailAction = (registryId) => ({
  type: FETCH_MARKETPLACE_PLUGIN_DETAIL,
  payload: registryId,
});

export const fetchMarketplacePluginDetailStartAction = (registryId) => ({
  type: FETCH_MARKETPLACE_PLUGIN_DETAIL_START,
  payload: registryId,
});

export const fetchMarketplacePluginDetailSuccessAction = (detail) => ({
  type: FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS,
  payload: detail,
});

export const fetchMarketplacePluginDetailErrorAction = (error) => ({
  type: FETCH_MARKETPLACE_PLUGIN_DETAIL_ERROR,
  payload: error,
});

export const fetchMarketplaceLicenceAction = () => ({
  type: FETCH_MARKETPLACE_LICENCE,
});

// GET answers {configured, customerId} and nothing else, so nothing else is stored
export const fetchMarketplaceLicenceSuccessAction = ({ configured, customerId } = {}) => ({
  type: FETCH_MARKETPLACE_LICENCE_SUCCESS,
  payload: { configured: Boolean(configured), customerId: customerId || null },
});

/**
 * The key travels in the action and no further: the saga hands it to the request and the
 * reducer never sees this action type, so it cannot end up in a state that outlives the call.
 */
export const setMarketplaceLicenceAction = ({ customerId, privateKey }) => ({
  type: SET_MARKETPLACE_LICENCE,
  payload: { customerId, privateKey },
});

export const deleteMarketplaceLicenceAction = () => ({
  type: DELETE_MARKETPLACE_LICENCE,
});

export const marketplaceLicenceStartAction = () => ({
  type: MARKETPLACE_LICENCE_START,
});

export const marketplaceLicenceErrorAction = (error) => ({
  type: MARKETPLACE_LICENCE_ERROR,
  payload: error,
});
