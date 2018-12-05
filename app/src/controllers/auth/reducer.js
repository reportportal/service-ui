import { combineReducers } from 'redux';
import { AUTH_SUCCESS, LOGOUT, SET_TOKEN, DEFAULT_TOKEN } from './constants';

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

export const tokenReducer = (state = null, { type, payload = DEFAULT_TOKEN }) => {
  switch (type) {
    case SET_TOKEN:
      return payload;
    default:
      return state;
  }
};

export const authReducer = combineReducers({
  authorized: authorizedReducer,
  token: tokenReducer,
});
