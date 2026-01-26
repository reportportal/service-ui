/*
 * Copyright 2026 EPAM Systems
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

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import {
  showSuccessNotification as dispatchSuccessNotification,
  showErrorNotification as dispatchErrorNotification,
} from 'controllers/notification';
import { notificationMessages } from 'components/main/notification/notificationList/notificationList';

export type NotificationMessageKey = keyof typeof notificationMessages;

interface ShowSuccessNotificationParams {
  messageKey: NotificationMessageKey;
  values?: Record<string, unknown>;
}

interface ShowErrorNotificationParams {
  messageKey?: NotificationMessageKey;
  message?: string;
  values?: Record<string, unknown>;
}

const getMessageId = (key: NotificationMessageKey) => notificationMessages[key]?.id;

export const useNotification = () => {
  const dispatch = useDispatch();

  const showSuccessNotification = useCallback(
    ({ messageKey, values }: ShowSuccessNotificationParams) => {
      const messageId = getMessageId(messageKey);

      dispatch(dispatchSuccessNotification({ messageId, values }));
    },
    [dispatch],
  );

  const showErrorNotification = useCallback(
    ({ messageKey, message, values }: ShowErrorNotificationParams) => {
      const messageId = messageKey ? getMessageId(messageKey) : undefined;

      dispatch(dispatchErrorNotification({ messageId, message, values }));
    },
    [dispatch],
  );

  return {
    showSuccessNotification,
    showErrorNotification,
  };
};
