import { FETCH_USER_SUCCESS, INITIAL_STATE } from './constants';

export const userReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, { info: payload });
    default:
      return state;
  }
};
