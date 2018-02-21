import { fetch, getStorageDataByKey } from 'common/utils';
import { FETCH_USER_SUCCESS, SET_ACTIVE_PROJECT } from './constants';
import { userInfoSelector } from './selectors';

const fetchUserSuccessAction = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const setActiveProjectAction = project => (dispatch, getState) => {
  const user = userInfoSelector(getState());
  const currentUserSettings = getStorageDataByKey(`${user.userId}_settings`) || {};
  if (~Object.keys(user.assigned_projects).indexOf(project)) {
    localStorage.setItem(
      `${user.userId}_settings`,
      JSON.stringify({ ...currentUserSettings, activeProject: project }),
    );

    dispatch({
      type: SET_ACTIVE_PROJECT,
      payload: project,
    });
  }
};
export const fetchUserAction = () => dispatch =>
  fetch('/api/v1/user')
    .then((user) => {
      const userSettings = getStorageDataByKey(`${user.userId}_settings`) || {};
      dispatch(fetchUserSuccessAction(user));
      dispatch(setActiveProjectAction(
         userSettings.activeProject ? userSettings.activeProject : user.default_project,
      ));
    });
