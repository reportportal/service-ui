import { SHOW_SCREEN_LOCK, HIDE_SCREEN_LOCK } from './constants';

export const showScreenLockAction = () => ({
  type: SHOW_SCREEN_LOCK,
  payload: {
    visible: true,
  },
});
export const hideScreenLockAction = () => ({
  type: HIDE_SCREEN_LOCK,
  payload: {
    visible: false,
  },
});
