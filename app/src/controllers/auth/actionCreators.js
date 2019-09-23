import { AUTH_ERROR, AUTH_SUCCESS, LOGIN, LOGOUT, LOGIN_SUCCESS } from './constants';

export const authSuccessAction = () => ({ type: AUTH_SUCCESS });

export const authErrorAction = () => ({ type: AUTH_ERROR });

export const loginAction = ({ login, password }) => ({
  type: LOGIN,
  payload: { login, password },
});

export const loginSuccessAction = (token) => ({
  type: LOGIN_SUCCESS,
  payload: token,
});

export const logoutAction = () => ({ type: LOGOUT });
