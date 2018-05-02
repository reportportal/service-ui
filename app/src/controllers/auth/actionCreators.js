import { fetch } from 'common/utils';
import { fetchUserAction, activeProjectSelector } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { AUTH_SUCCESS, TOKEN_KEY, DEFAULT_TOKEN, LOGOUT } from './constants';

export const authSuccessAction = () => ({
  type: AUTH_SUCCESS,
});

export const loginAction = ({ login, password }) => (dispatch, getState) =>
  fetch('/uat/sso/oauth/token', {
    params: {
      grant_type: 'password',
      username: login,
      password,
    },
    method: 'POST',
  }).then((result) => {
    localStorage.setItem(TOKEN_KEY, `${result.token_type} ${result.access_token}`);
    dispatch(fetchUserAction())
      .then(() => dispatch(fetchProjectAction(activeProjectSelector(getState())))
        .then(() => dispatch(authSuccessAction()),
      ),
    );
  });

export const logoutAction = () => (dispatch) => {
  localStorage.setItem(TOKEN_KEY, DEFAULT_TOKEN);
  dispatch({
    type: LOGOUT,
  });
};

