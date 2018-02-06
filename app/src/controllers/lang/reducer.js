import { CHANGE_LANG_ACTION } from './constants';

export const langReducer = (state = 'be', { type, payload }) => {
  switch (type) {
    case CHANGE_LANG_ACTION:
      return payload;
    default:
      return state;
  }
};
