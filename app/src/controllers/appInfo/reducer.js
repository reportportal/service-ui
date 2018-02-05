import { FETCH_INFO_SUCCESS } from './constants';

export const appInfoReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case FETCH_INFO_SUCCESS:
      return Object.assign({}, payload);
    default:
      return state;
  }
};
