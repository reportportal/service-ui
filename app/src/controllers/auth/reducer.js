import { combineReducers } from 'redux';
import { AUTH_SUCCESS, LOGOUT, SET_TOKEN, TOKEN_KEY, DEFAULT_TOKEN } from './constants';

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

export const tokenReducer = (state, { type, payload = DEFAULT_TOKEN }) => {
  switch (type) {
    case SET_TOKEN:
      localStorage.setItem(TOKEN_KEY, payload);
      return payload;
    default:
      return localStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN;
  }
};

export const authReducer = combineReducers({
  authorized: authorizedReducer,
  token: tokenReducer,
});
