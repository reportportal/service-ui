import { fetchAPI } from 'common/utils';
import { URLS } from 'common/urls';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import { tokenSelector } from 'controllers/auth';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
  UPDATE_AUTO_ANALYSIS_CONFIGURATION,
  UPDATE_EMAIL_CONFIG_SUCCESS,
} from './constants';
import { projectPreferencesSelector, projectEmailConfigurationSelector } from './selectors';

const fetchProjectSuccessAction = (project) => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

const fetchProjectPreferencesSuccessAction = (projectId) => ({
  type: FETCH_PROJECT_PREFERENCES_SUCCESS,
  payload: projectId,
});

export const updateAutoAnalysisConfigurationAction = (project) => ({
  type: UPDATE_AUTO_ANALYSIS_CONFIGURATION,
  payload: project.configuration.attributes,
});

const updateProjectPreferencesAction = (settings) => (dispatch, getState) =>
  fetchAPI(
    URLS.projectPreferences(activeProjectSelector(getState()), userIdSelector(getState())),
    tokenSelector(getState()),
    {
      method: 'PUT',
      data: settings,
    },
  );
export const updateProjectEmailConfig = (emailConfig) => (dispatch, getState) => {
  const currentConfig = projectEmailConfigurationSelector(getState());
  const newConfig = { ...currentConfig, ...emailConfig };
  fetchAPI(
    URLS.projectPreferencesEmailConfiguration(activeProjectSelector(getState())),
    tokenSelector(getState()),
    {
      method: 'PUT',
      data: newConfig,
    },
  ).then(() => {
    dispatch({
      type: UPDATE_EMAIL_CONFIG_SUCCESS,
      payload: newConfig,
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
  fetchAPI(
    URLS.projectPreferences(projectId, userIdSelector(getState())),
    tokenSelector(getState()),
  ).then((project) => {
    dispatch(fetchProjectPreferencesSuccessAction(project));
  });

export const fetchProjectAction = (projectId) => (dispatch, getState) =>
  fetchAPI(URLS.project(projectId), tokenSelector(getState())).then((project) => {
    dispatch(fetchProjectSuccessAction(project));
    dispatch(fetchProjectPreferencesAction(projectId));
  });

export const fetchAutoAnalysisConfigurationAction = (projectId) => (dispatch, getState) => {
  fetchAPI(URLS.project(projectId), tokenSelector(getState())).then((project) => {
    dispatch(updateAutoAnalysisConfigurationAction(project));
  });
};
