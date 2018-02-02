import { CHANGE_LANG_ACTION } from './constants';

export const langReducer = (state = { lang: 'be' }, { type, payload }) => {
  switch (type) {
    case CHANGE_LANG_ACTION:
      return Object.assign({}, payload);
    default:
      return state;
  }
};
