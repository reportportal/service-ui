import { fetch } from 'common/utils';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
} from './constants';
import { projectPreferencesSelector } from './selectors';

const fetchProjectSuccessAction = project => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

const fetchProjectPreferencesSuccessAction = projectId => ({
  type: FETCH_PROJECT_PREFERENCES_SUCCESS,
  payload: projectId,
});

const updateProjectPreferencesAction = settings => (dispatch, getState) =>
  fetch(`/api/v1/project/${activeProjectSelector(getState())}/preference/${userIdSelector(getState())}`, {
    method: 'PUT',
    data: settings,
  });

export const toggleDisplayFilterOnLaunchesAction = filter => (dispatch, getState) => {
  dispatch({
    type: TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
    payload: filter,
  });
  dispatch(updateProjectPreferencesAction(projectPreferencesSelector(getState())));
};

const fetchProjectPreferencesAction = projectId => (dispatch, getState) =>
  fetch(`/api/v1/project/${projectId}/preference/${userIdSelector(getState())}`)
    .then((project) => {
      dispatch(fetchProjectPreferencesSuccessAction(project));
    });

export const fetchProjectAction = projectId => dispatch =>
  fetch(`/api/v1/project/${projectId}`)
    .then((project) => {
      dispatch(fetchProjectSuccessAction(project));
      dispatch(fetchProjectPreferencesAction(projectId));
    });

