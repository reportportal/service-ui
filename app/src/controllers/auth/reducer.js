import { AUTH_SUCCESS } from './constants';

export const authReducer = (state = {}, { type }) => {
  switch (type) {
    case AUTH_SUCCESS:
      return Object.assign({}, state, { authorized: true });
    default:
      return state;
  }
};
