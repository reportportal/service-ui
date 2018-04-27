import { CHANGE_LANG_ACTION, INITIAL_STATE } from './constants';

export const langReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case CHANGE_LANG_ACTION:
      return payload;
    default:
      return state;
  }
};
