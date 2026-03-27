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

import type { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Link from 'redux-first-router-link';
import { NOTIFICATIONS } from 'common/constants/settingsTabs';
import { createClassnames } from 'common/utils/createClassnames';
import type { ProjectActivityActor, ProjectActivityLinkContext } from './activityShape';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = createClassnames(styles as Record<string, string>);

const messages = defineMessages({
  updatedLegacyNotifications: {
    id: 'Notifications.updatedLegacyNotifications',
    defaultMessage: '<user>{actor}</user> updated <link>E-mail notifications</link>.',
  },
});

interface LegacyNotificationActivityProps {
  activity: ProjectActivityActor & Required<ProjectActivityLinkContext>;
}

export const LegacyNotificationActivity = ({ activity }: LegacyNotificationActivityProps) => {
  const { formatMessage } = useIntl();
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

  return formatMessage(messages.updatedLegacyNotifications, {
    actor: activity.user,
    user: renderUser,
    link: renderLink,
  });
};
