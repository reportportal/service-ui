import { AUTH_SUCCESS, LOGOUT, INITIAL_STATE } from './constants';

export const authReducer = (state = INITIAL_STATE, { type }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return Object.assign({}, state, { authorized: true });
    case LOGOUT:
      return Object.assign({}, state, { authorized: false });
    default:
      return state;
  }
};
