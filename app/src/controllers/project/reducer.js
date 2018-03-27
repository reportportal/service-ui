import { INITIAL_STATE, FETCH_PROJECT_SUCCESS } from './constants';

export const projectReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_PROJECT_SUCCESS:
      return { ...state, ...payload };
    default:
      return state;
  }
};
