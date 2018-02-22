import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { FETCH_USER_SUCCESS, SET_ACTIVE_PROJECT } from './constants';
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
      dispatch(fetchUserSuccessAction(user));
      dispatch(setActiveProjectAction(
         userSettings.activeProject ? userSettings.activeProject : user.default_project,
      ));
    });
