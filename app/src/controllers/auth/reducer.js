import { combineReducers } from 'redux';
import {
  AUTH_SUCCESS,
  LOGOUT,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_ADMIN_ACCESS,
  RESET_ADMIN_ACCESS,
} from './constants';

export const authorizedReducer = (state = false, { type }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return true;
    case LOGOUT:
      return false;
    default:
      return state;
  }
};

export const tokenReducer = (state = DEFAULT_TOKEN, { type, payload }) => {
  switch (type) {
    case SET_TOKEN:
      return payload || DEFAULT_TOKEN;
    default:
      return state;
  }
};

export const isAdminAccessReducer = (state = false, { type }) => {
  switch (type) {
    case SET_ADMIN_ACCESS:
      return true;
    case RESET_ADMIN_ACCESS:
      return false;
    default:
      return state;
  }
};

export const authReducer = combineReducers({
  authorized: authorizedReducer,
  token: tokenReducer,
  isAdminAccess: isAdminAccessReducer,
});
