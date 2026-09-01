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

import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { queueReducers } from 'common/utils/queueReducers';
import { loadingReducer } from 'controllers/loading';
import { uiExtensionsReducer } from './uiExtensions';
import {
  NAMESPACE,
  SET_PROJECT_INTEGRATIONS,
  FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
  UPDATE_PLUGIN_SUCCESS,
  REMOVE_PLUGIN_SUCCESS,
  GLOBAL_INTEGRATIONS,
  PROJECT_INTEGRATIONS,
  ADD_GLOBAL_INTEGRATION_SUCCESS,
  UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  ADD_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_PROJECT_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATION_SUCCESS,
  ADD_ORGANIZATION_INTEGRATION_SUCCESS,
  UPDATE_ORGANIZATION_INTEGRATION_SUCCESS,
  REMOVE_ORGANIZATION_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE_SUCCESS,
  REMOVE_GLOBAL_INTEGRATIONS_BY_TYPE_SUCCESS,
  PUBLIC_PLUGINS,
  SET_ORGANIZATION_INTEGRATIONS,
  ORGANIZATION_INTEGRATIONS,
  FETCH_MARKETPLACE_CATALOGUE_START,
  FETCH_MARKETPLACE_CATALOGUE_SUCCESS,
  FETCH_MARKETPLACE_CATALOGUE_ERROR,
  INSTALL_MARKETPLACE_PLUGIN_START,
  INSTALL_MARKETPLACE_PLUGIN_SUCCESS,
  INSTALL_MARKETPLACE_PLUGIN_ERROR,
  CLEAR_JUST_INSTALLED_MARKETPLACE_PLUGIN,
  MARKETPLACE_CATALOGUE_STATE,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_START,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_ERROR,
  FETCH_MARKETPLACE_LICENCE_SUCCESS,
  MARKETPLACE_LICENCE_START,
  MARKETPLACE_LICENCE_ERROR,
  REGISTRY_STATUS,
} from './constants';

const addIntegration = (state, type, payload) => ({
  ...state,
  [type]: [payload, ...state[type]],
});

const updateIntegration = (state, type, payload) => ({
  ...state,
  [type]: state[type].map((integration) => {
    if (payload.id === integration.id) {
      return {
        ...integration,
        ...payload.data,
        integrationParameters: {
          ...integration.integrationParameters,
          ...payload.data.integrationParameters,
        },
      };
    }
    return integration;
  }),
});

const removeIntegration = (state, type, payload) => ({
  ...state,
  [type]: state[type].filter((item) => item.id !== payload),
});

const removeIntegrationByType = (state, type, payload) => ({
  ...state,
  [type]: state[type].filter((item) => item.integrationType.name !== payload),
});

export const updatePluginLocallyReducer = (state, { type, payload }) => {
  switch (type) {
    case UPDATE_PLUGIN_SUCCESS:
      return state.map((item) => {
        if (item.type === payload.type) {
          return payload;
        }
        return item;
      });
    case REMOVE_PLUGIN_SUCCESS:
      return state.filter((item) => item.type !== payload);
    default:
      return state;
  }
};

export const integrationsReducer = (state = {}, { type = '', payload = {} }) => {
  switch (type) {
    case FETCH_GLOBAL_INTEGRATIONS_SUCCESS:
      return {
        ...state,
        globalIntegrations: payload,
      };
    case SET_PROJECT_INTEGRATIONS:
      return {
        ...state,
        projectIntegrations: payload,
      };
    case SET_ORGANIZATION_INTEGRATIONS:
      return {
        ...state,
        organizationIntegrations: payload,
      };
    case ADD_GLOBAL_INTEGRATION_SUCCESS:
      return addIntegration(state, GLOBAL_INTEGRATIONS, payload);
    case UPDATE_GLOBAL_INTEGRATION_SUCCESS:
      return updateIntegration(state, GLOBAL_INTEGRATIONS, payload);
    case REMOVE_GLOBAL_INTEGRATION_SUCCESS:
      return removeIntegration(state, GLOBAL_INTEGRATIONS, payload);
    case ADD_PROJECT_INTEGRATION_SUCCESS:
      return addIntegration(state, PROJECT_INTEGRATIONS, payload);
    case UPDATE_PROJECT_INTEGRATION_SUCCESS:
      return updateIntegration(state, PROJECT_INTEGRATIONS, payload);
    case REMOVE_PROJECT_INTEGRATION_SUCCESS:
      return removeIntegration(state, PROJECT_INTEGRATIONS, payload);
    case ADD_ORGANIZATION_INTEGRATION_SUCCESS:
      return addIntegration(state, ORGANIZATION_INTEGRATIONS, payload);
    case UPDATE_ORGANIZATION_INTEGRATION_SUCCESS:
      return updateIntegration(state, ORGANIZATION_INTEGRATIONS, payload);
    case REMOVE_ORGANIZATION_INTEGRATION_SUCCESS:
      return removeIntegration(state, ORGANIZATION_INTEGRATIONS, payload);
    case REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS:
      return removeIntegrationByType(state, PROJECT_INTEGRATIONS, payload);
    case REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE_SUCCESS:
      return removeIntegrationByType(state, ORGANIZATION_INTEGRATIONS, payload);
    case REMOVE_GLOBAL_INTEGRATIONS_BY_TYPE_SUCCESS:
      return removeIntegrationByType(state, GLOBAL_INTEGRATIONS, payload);
    default:
      return state;
  }
};

const INITIAL_MARKETPLACE_STATE = {
  catalogueState: MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED,
  registry: { status: null, host: null },
  // what the instance itself permits, as opposed to what the registry offers
  instance: { uploadAllowed: true },
  installed: [],
  available: [],
  error: null,
  installing: [],
  installError: null,
  // The plugin the last install moved into the Installed group. The row jumps groups on a
  // refetch, so this is what lets the list say where it went; cleared once it has been seen.
  justInstalled: null,
  query: { q: null, category: null },
};

export const marketplaceReducer = (state = INITIAL_MARKETPLACE_STATE, { type, payload } = {}) => {
  switch (type) {
    case FETCH_MARKETPLACE_CATALOGUE_START: {
      const { q = null, category = null } = payload || {};
      return {
        ...state,
        catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADING,
        error: null,
        // the filter this catalogue is showing, so a refetch can reproduce it
        query: { q: q || null, category: category || null },
      };
    }
    case FETCH_MARKETPLACE_CATALOGUE_SUCCESS: {
      const registry = payload.registry || {};
      const instance = payload.instance || state.instance;
      // offline is a loaded state: the payload is still authoritative about installed plugins.
      // Only an explicit ONLINE is online, so an unknown status degrades to the cautious side.
      const catalogueState =
        registry.status === REGISTRY_STATUS.ONLINE
          ? MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE
          : MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE;

      return {
        ...state,
        catalogueState,
        registry: { status: registry.status || null, host: registry.host || null },
        instance,
        installed: payload.installed || [],
        available: payload.available || [],
        error: null,
      };
    }
    case FETCH_MARKETPLACE_CATALOGUE_ERROR:
      return {
        ...state,
        catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED,
        registry: { status: null, host: null },
        installed: [],
        available: [],
        error: payload,
      };
    case INSTALL_MARKETPLACE_PLUGIN_START:
      return { ...state, installing: [...state.installing, payload], installError: null };
    case INSTALL_MARKETPLACE_PLUGIN_SUCCESS:
      return {
        ...state,
        installing: state.installing.filter((id) => id !== payload),
        justInstalled: payload,
      };
    case CLEAR_JUST_INSTALLED_MARKETPLACE_PLUGIN:
      return { ...state, justInstalled: null };
    case INSTALL_MARKETPLACE_PLUGIN_ERROR:
      return {
        ...state,
        installing: state.installing.filter((id) => id !== payload.registryId),
        installError: payload,
      };
    default:
      return state;
  }
};

const INITIAL_PLUGIN_DETAIL_STATE = {
  detailState: MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED,
  registryId: null,
  registry: { status: null, host: null },
  plugin: null,
  versions: [],
  changelog: null,
  screenshots: [],
  advisory: null,
  blocked: null,
  removed: null,
  error: null,
};

/**
 * The plugin page's registry half. It carries the same four-way state as the catalogue and on
 * purpose: offline is a loaded response whose registry-sourced parts are simply absent, while a
 * failure means nothing was learned at all. Anything registry-derived is dropped in both cases,
 * so a stale advisory from a previous plugin can never be shown against this one.
 */
export const marketplacePluginDetailReducer = (
  state = INITIAL_PLUGIN_DETAIL_STATE,
  { type, payload } = {},
) => {
  switch (type) {
    case FETCH_MARKETPLACE_PLUGIN_DETAIL_START:
      return {
        ...INITIAL_PLUGIN_DETAIL_STATE,
        detailState: MARKETPLACE_CATALOGUE_STATE.LOADING,
        registryId: payload || null,
      };
    case FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS: {
      const registry = payload.registry || {};
      const online = registry.status === REGISTRY_STATUS.ONLINE;

      return {
        ...INITIAL_PLUGIN_DETAIL_STATE,
        detailState: online
          ? MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE
          : MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE,
        registryId: payload.plugin?.id || state.registryId,
        registry: { status: registry.status || null, host: registry.host || null },
        // an offline answer has no registry half to keep, so none of it is kept
        plugin: online ? payload.plugin || null : null,
        versions: online ? payload.versions || [] : [],
        changelog: online ? payload.changelog || null : null,
        screenshots: online ? payload.screenshots || [] : [],
        advisory: online ? payload.advisory || null : null,
        blocked: online ? payload.blocked || null : null,
        removed: online ? payload.removed || null : null,
      };
    }
    case FETCH_MARKETPLACE_PLUGIN_DETAIL_ERROR:
      return {
        ...INITIAL_PLUGIN_DETAIL_STATE,
        detailState: MARKETPLACE_CATALOGUE_STATE.FAILED,
        registryId: state.registryId,
        error: payload,
      };
    default:
      return state;
  }
};

const INITIAL_LICENCE_STATE = {
  configured: false,
  customerId: null,
  loading: false,
  error: null,
};

/**
 * Whether this instance holds marketplace credentials, and who it signs as. There is no case
 * that stores a key: the endpoint never returns one and the form's action never reaches here.
 */
export const marketplaceLicenceReducer = (
  state = INITIAL_LICENCE_STATE,
  { type, payload } = {},
) => {
  switch (type) {
    case MARKETPLACE_LICENCE_START:
      return { ...state, loading: true, error: null };
    case FETCH_MARKETPLACE_LICENCE_SUCCESS:
      return {
        configured: payload.configured,
        customerId: payload.customerId,
        loading: false,
        error: null,
      };
    case MARKETPLACE_LICENCE_ERROR:
      return { ...state, loading: false, error: payload };
    default:
      return state;
  }
};

// TODO: store remote plugins separately
export const pluginsReducer = combineReducers({
  plugins: queueReducers(fetchReducer(NAMESPACE), updatePluginLocallyReducer),
  publicPlugins: queueReducers(fetchReducer(PUBLIC_PLUGINS), updatePluginLocallyReducer),
  integrations: integrationsReducer,
  uiExtensions: uiExtensionsReducer,
  pluginsLoading: loadingReducer(NAMESPACE),
  marketplace: marketplaceReducer,
  marketplacePluginDetail: marketplacePluginDetailReducer,
  marketplaceLicence: marketplaceLicenceReducer,
});
