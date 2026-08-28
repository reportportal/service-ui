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

export const fetchMarketplaceCatalogueAction = ({ q, category } = {}) => ({
  type: FETCH_MARKETPLACE_CATALOGUE,
  payload: { q, category },
});

export const fetchMarketplaceCatalogueStartAction = () => ({
  type: FETCH_MARKETPLACE_CATALOGUE_START,
});

export const fetchMarketplaceCatalogueSuccessAction = (catalogue) => ({
  type: FETCH_MARKETPLACE_CATALOGUE_SUCCESS,
  payload: catalogue,
});

export const fetchMarketplaceCatalogueErrorAction = (error) => ({
  type: FETCH_MARKETPLACE_CATALOGUE_ERROR,
  payload: error,
});

export const installMarketplacePluginAction = (registryId) => ({
  type: INSTALL_MARKETPLACE_PLUGIN,
  payload: { registryId },
});

export const installMarketplacePluginStartAction = (registryId) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_START,
  payload: registryId,
});

export const installMarketplacePluginSuccessAction = (registryId) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_SUCCESS,
  payload: registryId,
});

export const installMarketplacePluginErrorAction = (registryId, error) => ({
  type: INSTALL_MARKETPLACE_PLUGIN_ERROR,
  payload: { registryId, error },
});
