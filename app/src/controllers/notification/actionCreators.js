/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  HIDE_NOTIFICATION,
  SHOW_NOTIFICATION,
  SHOW_DEFAULT_ERROR_NOTIFICATION,
  NOTIFICATION_TYPES,
} from './constants';

/**
 *
 * @param message? {string}
 * @param type {('error' | 'info' | 'success')}
 * @param messageId? {string}
 * @param values? {object}
 * @returns {{type: string, payload: {message: string, type: (string), uid: number}}}
 */
export const showNotification = ({ message, type, messageId, values }) => ({
  type: SHOW_NOTIFICATION,
  payload: {
    message,
    messageId,
    type,
    values,
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

export const showDefaultErrorNotification = ({ message }) => ({
  type: SHOW_DEFAULT_ERROR_NOTIFICATION,
  payload: {
    error: message,
  },
});

export const showSuccessNotification = ({ message, messageId, values }) =>
  showNotification({ message, messageId, values, type: NOTIFICATION_TYPES.SUCCESS });
export const showErrorNotification = ({ message, messageId, values }) =>
  showNotification({ message, messageId, values, type: NOTIFICATION_TYPES.ERROR });
