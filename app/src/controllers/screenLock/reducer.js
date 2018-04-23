import { SHOW_SCREEN_LOCK, HIDE_SCREEN_LOCK } from './constants';

export const screenLockReducer = (state = { visible: false }, { type, payload }) => {
  switch (type) {
    case SHOW_SCREEN_LOCK:
      return payload;
    case HIDE_SCREEN_LOCK:
      return payload;
    default:
      return state;
  }
};
