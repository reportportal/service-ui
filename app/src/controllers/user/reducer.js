import { FETCH_USER_SUCCESS } from './constants';

export const userReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, { info: payload, activeProject: 'default_project' });
    default:
      return state;
  }
};
