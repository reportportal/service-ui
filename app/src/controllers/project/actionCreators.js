import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import {
  fetchUserFiltersSuccessAction,
  removeFilterAction,
  addFilterAction,
} from 'controllers/filter';
import { projectIdSelector } from 'controllers/pages';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
} from './constants';
import { projectNotificationsConfigurationSelector } from './selectors';

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
export const updateProjectNotificationsConfig = (notificationsConfig) => (dispatch, getState) => {
  const currentConfig = projectNotificationsConfigurationSelector(getState());
  const newConfig = { ...currentConfig, ...notificationsConfig };
  fetch(URLS.projectNotificationConfiguration(projectIdSelector(getState())), {
    method: 'PUT',
    data: newConfig,
  }).then(() => {
    dispatch({
      type: UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
      payload: newConfig,
    });
  });
};

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
