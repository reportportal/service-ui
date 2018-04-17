import { HIDE_NOTIFICATION, SHOW_NOTIFICATION } from './constants';

/**
 *
 * @param state {Array}
 * @param type
 * @param payload
 * @returns Array
 */
export const notificationReducer = (state = [], { type, payload }) => {
  switch (type) {
    case SHOW_NOTIFICATION:
      return [...state, payload];
    case HIDE_NOTIFICATION:
      return state.filter((n) => n.uid !== payload);
    default:
      return state;
  }
};
