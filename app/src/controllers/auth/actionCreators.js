import { fetch } from 'common/utils';
import { fetchUserAction } from 'controllers/user';
import { AUTH_SUCCESS, TOKEN_KEY } from './constants';

export const authSuccessAction = () => ({
  type: AUTH_SUCCESS,
});

export const loginAction = ({ login, password }) => dispatch =>
  fetch('/uat/sso/oauth/token', {
    params: {
      grant_type: 'password',
      username: login,
      password,
    },
    method: 'POST',
  }).then((result) => {
    localStorage.setItem(TOKEN_KEY, `${result.token_type} ${result.access_token}`);
    dispatch(fetchUserAction()).then(() => dispatch(authSuccessAction()));
  });
