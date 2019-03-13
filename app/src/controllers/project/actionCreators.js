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
  UPDATE_PROJECT_INTEGRATIONS,
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

export const updateProjectIntegrationsAction = (integrations) => ({
  type: UPDATE_PROJECT_INTEGRATIONS,
  payload: integrations,
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
// TODO: rewrite this action with saga and write reducers to update, edit & delete
export const fetchProjectIntegrationsAction = (projectId) => (dispatch) => {
  fetch(URLS.project(projectId)).then(({ integrations }) => {
    dispatch(updateProjectIntegrationsAction(integrations));
  });
};

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
