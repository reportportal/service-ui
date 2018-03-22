import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
} from './constants';
import { userInfoSelector } from './selectors';

const fetchUserSuccessAction = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const setActiveProjectAction = project => (dispatch, getState) => {
  const user = userInfoSelector(getState());
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(
    `${user.userId}_settings`,
    { ...currentUserSettings, activeProject: project },
  );
  dispatch({
    type: SET_ACTIVE_PROJECT,
    payload: project,
  });
};
export const fetchUserAction = () => dispatch =>
  fetch('/api/v1/user')
    .then((user) => {
      const userSettings = getStorageItem(`${user.userId}_settings`) || {};
      const activeProject = userSettings.activeProject;

      dispatch(fetchUserSuccessAction(user));
      dispatch(setActiveProjectAction(
        activeProject && Object.prototype.hasOwnProperty.call(user.assigned_projects, activeProject)
           ? activeProject
           : user.default_project,
      ));
    });

export const setStartTimeFormatAction = format => ({
  type: SET_START_TIME_FORMAT,
  payload: format,
});
