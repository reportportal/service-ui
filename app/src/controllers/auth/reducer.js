import { combineReducers } from 'redux';
import { getStorageItem } from 'common/utils/storageUtils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import {
  AUTH_SUCCESS,
  LOGOUT,
  SET_TOKEN,
  DEFAULT_TOKEN,
  SET_LAST_FAILED_LOGIN_TIME,
  SET_BAD_CREDENTIALS,
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

const badCredentialsReducer = (state, { type }) => {
  switch (type) {
    case SET_BAD_CREDENTIALS:
      return true;
    default:
      return false;
  }
};

const getLastFailedLoginDefaultState = () =>
  (getStorageItem(APPLICATION_SETTINGS) &&
    getStorageItem(APPLICATION_SETTINGS).lastFailedLoginTime) ||
  null;

export const lastFailedLoginTimeReducer = (
  state = getLastFailedLoginDefaultState(),
  { type, payload },
) => {
  switch (type) {
    case SET_LAST_FAILED_LOGIN_TIME:
      return payload;
    default:
      return state;
  }
};

export const authReducer = combineReducers({
  authorized: authorizedReducer,
  token: tokenReducer,
  lastFailedLoginTime: lastFailedLoginTimeReducer,
  badCredentials: badCredentialsReducer,
});
