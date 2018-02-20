import { AUTH_SUCCESS, LOGOUT } from './constants';

export const authReducer = (state = {}, { type }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return Object.assign({}, state, { authorized: true });
    case LOGOUT:
      return Object.assign({}, state, { authorized: false });
    default:
      return state;
  }
};
