import { AUTH_ERROR, AUTH_SUCCESS, LOGIN, LOGOUT } from './constants';

export const authSuccessAction = () => ({ type: AUTH_SUCCESS });

export const authErrorAction = () => ({ type: AUTH_ERROR });

export const loginAction = ({ login, password }) => ({
  type: LOGIN,
  payload: { login, password },
});

export const logoutAction = () => ({ type: LOGOUT });
