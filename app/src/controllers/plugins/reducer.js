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
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
} from './constants';

const addIntegration = (state, type, payload) => ({
  ...state,
  [type]: [...state[type], payload],
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

export const integrationsReducer = (state = {}, { type, payload }) => {
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
    case REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS:
      return removeIntegrationByType(state, PROJECT_INTEGRATIONS, payload);
    default:
      return state;
  }
};

export const pluginsReducer = combineReducers({
  plugins: queueReducers(fetchReducer(NAMESPACE), updatePluginLocallyReducer),
  integrations: integrationsReducer,
  uiExtensions: uiExtensionsReducer,
});
