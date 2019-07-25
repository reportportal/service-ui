import { SET_INITIAL_DATA_READY } from './constants';

export const initialDataReadyReducer = (state = false, { type }) => {
  switch (type) {
    case SET_INITIAL_DATA_READY:
      return true;
    default:
      return state;
  }
};
