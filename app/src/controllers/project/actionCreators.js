import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
} from './constants';
import { projectPreferencesSelector, notificationIntegrationNameSelector } from './selectors';

const fetchProjectSuccessAction = (project) => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

const fetchProjectPreferencesSuccessAction = (projectId) => ({
  type: FETCH_PROJECT_PREFERENCES_SUCCESS,
  payload: projectId,
});

export const updateConfigurationAttributesAction = (project) => ({
  type: UPDATE_CONFIGURATION_ATTRIBUTES,
  payload: project.configuration.attributes,
});

const updateProjectPreferencesAction = (settings) => (dispatch, getState) =>
  fetch(URLS.projectPreferences(activeProjectSelector(getState()), userIdSelector(getState())), {
    method: 'PUT',
    data: settings,
  });
export const updateProjectNotificationsIntegrationAction = ({ enabled, rules }) => (
  dispatch,
  getState,
) => {
  const integrationName = notificationIntegrationNameSelector(getState());
  const newConfig = {
    integrationName,
    enabled,
    integrationParameters: {
      rules,
    },
  };
  fetch(URLS.projectIntegration(activeProjectSelector(getState())), {
    method: 'PUT',
    data: newConfig,
  }).then(() => {
    dispatch({
      type: UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
      payload: { enabled, rules },
    });
  });
};

export const toggleDisplayFilterOnLaunchesAction = (filter) => (dispatch, getState) => {
  dispatch({
    type: TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
    payload: filter,
  });
  dispatch(updateProjectPreferencesAction(projectPreferencesSelector(getState())));
};

const fetchProjectPreferencesAction = (projectId) => (dispatch, getState) =>
  fetch(URLS.projectPreferences(projectId, userIdSelector(getState()))).then((project) => {
    dispatch(fetchProjectPreferencesSuccessAction(project));
  });

export const fetchProjectAction = (projectId) => (dispatch) =>
  fetch(URLS.project(projectId)).then((project) => {
    dispatch(fetchProjectSuccessAction(project));
    dispatch(fetchProjectPreferencesAction(projectId));
  });

export const fetchConfigurationAttributesAction = (projectId) => (dispatch) => {
  fetch(URLS.project(projectId)).then((project) => {
    dispatch(updateConfigurationAttributesAction(project));
  });
};
