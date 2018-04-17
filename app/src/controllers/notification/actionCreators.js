import { HIDE_NOTIFICATION, SHOW_NOTIFICATION } from './constants';

/**
 *
 * @param message {string}
 * @param type {('error' | 'info' | 'success')}
 * @returns {{type: string, payload: {message: string, type: (string), uid: number}}}
 */
export const showNotification = (message, type) => ({
  type: SHOW_NOTIFICATION,
  payload: {
    message,
    type,
    uid: new Date().valueOf(),
  },
});

/**
 *
 * @param uid {number}
 * @returns {{type: string, payload: number}}
 */
export const hideNotification = (uid) => ({
  type: HIDE_NOTIFICATION,
  payload: uid,
});
