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

import type { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Link from 'redux-first-router-link';
import { UPDATE_NOTIFICATION_SETTINGS } from 'common/constants/actionTypes';
import { NOTIFICATIONS } from 'common/constants/settingsTabs';
import { createClassnames } from 'common/utils/createClassnames';
import { NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY } from 'controllers/project/constants';
import type { ProjectActivityHistoryItem, ProjectActivityItemBase } from './activityShape';
import { getActivityHistory } from './activityShape';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = createClassnames(styles);

type BooleanString = 'true' | 'false';

type NotificationSettingsHistoryField =
  | typeof NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY
  | 'notifications.email.enabled'
  | 'notifications.telegram.enabled'
  | 'notifications.slack.enabled';

type NotificationSettingsActivityAction = typeof UPDATE_NOTIFICATION_SETTINGS;

type NotificationSettingsHistoryItem = ProjectActivityHistoryItem<
  NotificationSettingsHistoryField,
  BooleanString
>;

type NotificationSettingsActivityItem = ProjectActivityItemBase<
  NotificationSettingsActivityAction,
  NotificationSettingsHistoryItem
>;

const messages = defineMessages({
  updatedNotificationSettings: {
    id: 'ProjectActivityNotification.updatedNotificationSettingsWithChanges',
    defaultMessage:
      '<user>{actor}</user> updated <link>Notification properties</link>: {name} from {oldValue} to {newValue}.',
  },
  on: {
    id: 'ProjectActivityNotification.on',
    defaultMessage: 'ON',
  },
  off: {
    id: 'ProjectActivityNotification.off',
    defaultMessage: 'OFF',
  },
  allNotifications: {
    id: 'ProjectActivityNotification.allNotifications',
    defaultMessage: 'All notifications',
  },
  emailNotifications: {
    id: 'ProjectActivityNotification.emailNotifications',
    defaultMessage: 'Email notifications',
  },
  telegramNotifications: {
    id: 'ProjectActivityNotification.telegramNotifications',
    defaultMessage: 'Telegram notifications',
  },
  slackNotifications: {
    id: 'ProjectActivityNotification.slackNotifications',
    defaultMessage: 'Slack notifications',
  },
});

const SETTINGS_FIELD_MESSAGES = {
  [NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY]: messages.allNotifications,
  'notifications.email.enabled': messages.emailNotifications,
  'notifications.telegram.enabled': messages.telegramNotifications,
  'notifications.slack.enabled': messages.slackNotifications,
};

const SETTINGS_VALUE_MESSAGES = {
  true: messages.on,
  false: messages.off,
};

interface NotificationSettingsActivityProps {
  activity: NotificationSettingsActivityItem;
}

export const NotificationSettingsActivity = ({ activity }: NotificationSettingsActivityProps) => {
  const { formatMessage } = useIntl();
  const updatedSetting = getActivityHistory(activity).at(0);
  if (!updatedSetting) {
    return null;
  }

  const renderUser = (chunks: ReactNode) => <span className={cx('user-name')}>{chunks}</span>;
  const renderLink = (chunks: ReactNode) => (
    <Link
      to={getProjectSettingTabPageLink(
        activity.organizationSlug,
        activity.projectSlug,
        NOTIFICATIONS,
      )}
      className={cx('link')}
      target="_blank"
    >
      {chunks}
    </Link>
  );

  return formatMessage(messages.updatedNotificationSettings, {
    actor: activity.user,
    name: formatMessage(SETTINGS_FIELD_MESSAGES[updatedSetting.field]),
    oldValue: formatMessage(SETTINGS_VALUE_MESSAGES[updatedSetting.oldValue]),
    newValue: formatMessage(SETTINGS_VALUE_MESSAGES[updatedSetting.newValue]),
    user: renderUser,
    link: renderLink,
  });
};
