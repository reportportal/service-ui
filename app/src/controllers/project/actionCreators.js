import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import {
  fetchUserFiltersSuccessAction,
  removeFilterAction,
  addFilterAction,
} from 'controllers/filter';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  UPDATE_DEFECT_SUBTYPE,
  UPDATE_DEFECT_SUBTYPE_SUCCESS,
  ADD_DEFECT_SUBTYPE,
  ADD_DEFECT_SUBTYPE_SUCCESS,
  DELETE_DEFECT_SUBTYPE,
  DELETE_DEFECT_SUBTYPE_SUCCESS,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE_SUCCESS,
  ADD_PROJECT_INTEGRATION,
  ADD_PROJECT_INTEGRATION_SUCCESS,
  UPDATE_PROJECT_INTEGRATION,
  UPDATE_PROJECT_INTEGRATION_SUCCESS,
  REMOVE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATION_SUCCESS,
} from './constants';

const fetchProjectSuccessAction = (project) => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

const fetchProjectPreferencesSuccessAction = (preferences) => ({
  type: FETCH_PROJECT_PREFERENCES_SUCCESS,
  payload: preferences,
});

export const updateConfigurationAttributesAction = (project) => ({
  type: UPDATE_CONFIGURATION_ATTRIBUTES,
  payload: project.configuration.attributes,
});

export const updateProjectNotificationsConfigAction = (config) => ({
  type: UPDATE_NOTIFICATIONS_CONFIG,
  payload: config,
});

export const updateProjectNotificationsConfigSuccessAction = (config) => ({
  type: UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  payload: config,
});

export const updateProjectFilterPreferencesAction = (filterId, method) => (dispatch, getState) =>
  fetch(
    URLS.projectPreferences(
      activeProjectSelector(getState()),
      userIdSelector(getState()),
      filterId,
    ),
    {
      method,
    },
  );

export const showFilterOnLaunchesAction = (filter) => (dispatch) => {
  dispatch(addFilterAction(filter));
  dispatch(updateProjectFilterPreferencesAction(filter.id, 'PUT'));
};

export const hideFilterOnLaunchesAction = (filter) => (dispatch) => {
  dispatch(removeFilterAction(filter.id));
  dispatch(updateProjectFilterPreferencesAction(filter.id, 'DELETE'));
};

const fetchProjectPreferencesAction = (projectId) => (dispatch, getState) =>
  fetch(URLS.projectPreferences(projectId, userIdSelector(getState()))).then((preferences) => {
    dispatch(fetchProjectPreferencesSuccessAction(preferences));
    dispatch(fetchUserFiltersSuccessAction(preferences.filters));
  });

export const fetchProjectAction = (projectId, isAdminAccess) => (dispatch) =>
  fetch(URLS.project(projectId)).then((project) => {
    dispatch(fetchProjectSuccessAction(project));
    !isAdminAccess && dispatch(fetchProjectPreferencesAction(projectId));
  });

export const fetchConfigurationAttributesAction = (projectId) => (dispatch) => {
  fetch(URLS.project(projectId)).then((project) => {
    dispatch(updateConfigurationAttributesAction(project));
  });
};

export const updateProjectIntegrationAction = (data, id, callback) => ({
  type: UPDATE_PROJECT_INTEGRATION,
  payload: { data, id, callback },
});

export const updateProjectIntegrationSuccessAction = (data, id) => ({
  type: UPDATE_PROJECT_INTEGRATION_SUCCESS,
  payload: { data, id },
});

export const addProjectIntegrationAction = (data, callback) => ({
  type: ADD_PROJECT_INTEGRATION,
  payload: { data, callback },
});

export const addProjectIntegrationSuccessAction = (integration) => ({
  type: ADD_PROJECT_INTEGRATION_SUCCESS,
  payload: integration,
});

export const removeProjectIntegrationAction = (id, callback) => ({
  type: REMOVE_PROJECT_INTEGRATION,
  payload: { id, callback },
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

export const updateDefectSubTypeAction = (subType) => ({
  type: UPDATE_DEFECT_SUBTYPE,
  payload: subType,
});

export const updateDefectSubTypeSuccessAction = (subType) => ({
  type: UPDATE_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
});

export const addDefectSubTypeAction = (subType) => ({
  type: ADD_DEFECT_SUBTYPE,
  payload: subType,
});

export const addDefectSubTypeSuccessAction = (subType) => ({
  type: ADD_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
});

export const deleteDefectSubTypeAction = (subType) => ({
  type: DELETE_DEFECT_SUBTYPE,
  payload: subType,
});

export const deleteDefectSubTypeSuccessAction = (subType) => ({
  type: DELETE_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
});
