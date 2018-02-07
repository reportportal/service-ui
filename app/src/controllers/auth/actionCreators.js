import { fetch } from 'common/utils';
import { FETCH_USER_SUCCESS, AUTH_SUCCESS, TOKEN_KEY } from './constants';

export const authSuccessAction = () => ({
  type: AUTH_SUCCESS,
});

const fetchUserSuccessAction = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const fetchUserAction = () => dispatch =>
  fetch('/api/v1/user')
    .then(user => dispatch(fetchUserSuccessAction(user)));

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
