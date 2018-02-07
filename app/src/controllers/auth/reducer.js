import { AUTH_SUCCESS, FETCH_USER_SUCCESS } from './constants';

export const authReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return Object.assign({}, state, { authorized: true });
    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, { user: payload });
    default:
      return state;
  }
};
