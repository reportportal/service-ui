import {
  AUTH_ERROR,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_LAST_FAILED_LOGIN_TIME,
} from './constants';

export const authSuccessAction = () => ({ type: AUTH_SUCCESS });

export const authErrorAction = () => ({ type: AUTH_ERROR });

export const loginAction = ({ login, password }) => ({
  type: LOGIN,
  payload: { login, password },
});

export const logoutAction = () => ({ type: LOGOUT });

export const setTokenAction = (token) => ({
  type: SET_TOKEN,
  payload: token,
});

export const resetTokenAction = () => setTokenAction(DEFAULT_TOKEN);

export const setLastFailedLoginTimeAction = (time) => ({
  type: SET_LAST_FAILED_LOGIN_TIME,
  payload: time,
});
