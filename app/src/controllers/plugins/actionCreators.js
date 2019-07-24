import {
  SET_PROJECT_INTEGRATIONS,
  UPDATE_PLUGIN_LOCALLY,
  UPDATE_INTEGRATION,
  REMOVE_INTEGRATION,
  ADD_INTEGRATION,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  ADD_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_PROJECT_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATION_SUCCESS,
  ADD_GLOBAL_INTEGRATION_SUCCESS,
  UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  FETCH_PLUGINS,
  FETCH_GLOBAL_INTEGRATIONS,
  FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
} from './constants';

export const fetchPluginsAction = () => ({
  type: FETCH_PLUGINS,
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

export const updatePluginLocallyAction = (plugin) => ({
  type: UPDATE_PLUGIN_LOCALLY,
  payload: plugin,
});

export const updateIntegrationAction = (data, isGlobal, id, callback) => ({
  type: UPDATE_INTEGRATION,
  payload: { data, isGlobal, id, callback },
});

export const addIntegrationAction = (data, isGlobal, pluginName, callback) => ({
  type: ADD_INTEGRATION,
  payload: { data, isGlobal, pluginName, callback },
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

export const removeIntegrationAction = (id, isGlobal, callback) => ({
  type: REMOVE_INTEGRATION,
  payload: { id, isGlobal, callback },
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
