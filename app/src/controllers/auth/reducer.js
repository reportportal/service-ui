import { CHANGE_TOKEN, AUTH_SUCCESS, FETCH_USER_SUCCESS } from './actions';

export const authReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case CHANGE_TOKEN:
      return Object.assign({}, state, { token: payload });
    case AUTH_SUCCESS:
      return Object.assign({}, state, { authorized: true });
    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, { user: payload });
    default:
      return state;
  }
};
