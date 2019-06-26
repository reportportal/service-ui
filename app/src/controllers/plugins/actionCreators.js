import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import {
  NAMESPACE,
  SET_PROJECT_INTEGRATIONS,
  UPDATE_PLUGIN_LOCALLY,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  ADD_PROJECT_INTEGRATION,
  ADD_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_PROJECT_INTEGRATION,
  UPDATE_PROJECT_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_GLOBAL_INTEGRATION,
  UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  ADD_GLOBAL_INTEGRATION,
  ADD_GLOBAL_INTEGRATION_SUCCESS,
  REMOVE_GLOBAL_INTEGRATION,
  REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
} from './constants';

export const fetchPluginsAction = () => fetchDataAction(NAMESPACE)(URLS.plugin());

export const fetchGlobalIntegrationsSuccessAction = (globalIntegrations) => ({
  type: FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
  payload: globalIntegrations,
});

export const fetchGlobalIntegrationsAction = () => (dispatch) =>
  fetch(URLS.globalIntegrationsByPluginName()).then((globalIntegrations) =>
    dispatch(fetchGlobalIntegrationsSuccessAction(globalIntegrations)),
  );

export const setProjectIntegrationsAction = (projectIntegrations) => ({
  type: SET_PROJECT_INTEGRATIONS,
  payload: projectIntegrations,
});

export const updatePluginLocallyAction = (plugin) => ({
  type: UPDATE_PLUGIN_LOCALLY,
  payload: plugin,
});

export const updateGlobalIntegrationAction = (data, isPluginPage, id, callback) => ({
  type: UPDATE_GLOBAL_INTEGRATION,
  payload: { data, isPluginPage, id, callback },
});

export const updateGlobalIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_GLOBAL_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const addGlobalIntegrationAction = (data, isPluginPage, pluginName, callback) => ({
  type: ADD_GLOBAL_INTEGRATION,
  payload: { data, isPluginPage, pluginName, callback },
});

export const addGlobalIntegrationSuccessAction = (integration) => ({
  type: ADD_GLOBAL_INTEGRATION_SUCCESS,
  payload: integration,
});

export const removeGlobalIntegrationAction = (id, isPluginPage, callback) => ({
  type: REMOVE_GLOBAL_INTEGRATION,
  payload: { id, isPluginPage, callback },
});

export const removeGlobalIntegrationSuccessAction = (id) => ({
  type: REMOVE_GLOBAL_INTEGRATION_SUCCESS,
  payload: id,
});

export const updateProjectIntegrationAction = (data, isPluginPage, id, callback) => ({
  type: UPDATE_PROJECT_INTEGRATION,
  payload: { data, isPluginPage, id, callback },
});

export const updateProjectIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_PROJECT_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const addProjectIntegrationAction = (data, isPluginPage, pluginName, callback) => ({
  type: ADD_PROJECT_INTEGRATION,
  payload: { data, isPluginPage, pluginName, callback },
});

export const addProjectIntegrationSuccessAction = (integration) => ({
  type: ADD_PROJECT_INTEGRATION_SUCCESS,
  payload: integration,
});

export const removeProjectIntegrationAction = (id, isPluginPage, callback) => ({
  type: REMOVE_PROJECT_INTEGRATION,
  payload: { id, isPluginPage, callback },
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
