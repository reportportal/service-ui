import { INITIAL_STATE, FETCH_USER_SUCCESS, SET_ACTIVE_PROJECT } from './constants';

export const userReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, { info: payload });
    case SET_ACTIVE_PROJECT:
      return Object.assign({}, state, { activeProject: payload });
    default:
      return state;
  }
};
