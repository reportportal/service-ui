import {
  AUTH_ERROR,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_ADMIN_ACCESS,
  RESET_ADMIN_ACCESS,
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

export const setAdminAccessAction = () => ({
  type: SET_ADMIN_ACCESS,
});

export const resetAdminAccessAction = () => ({
  type: RESET_ADMIN_ACCESS,
});
