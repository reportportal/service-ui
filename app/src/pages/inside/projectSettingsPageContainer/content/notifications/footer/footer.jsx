/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import settingsIcon from 'common/img/settings-icon-inline.svg';
import arrowRightIcon from 'common/img/arrow-right-inline.svg';

import { PROJECT_SETTINGS_TAB_PAGE } from 'controllers/pages';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { useSelector } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { docsReferences } from 'common/utils';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { messages } from '../messages';
import styles from './footer.scss';
import { HelpPanel } from '../helpPanel';

const cx = classNames.bind(styles);

export const NotificationsFooter = () => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(activeProjectSelector);

  const footerItems = [
    {
      title: formatMessage(messages.discoverPlugins),
      mainIcon: discoverPluginsIcon,
      link: docsReferences.pluginsDocs,
      description: formatMessage(messages.discoverPluginsDescription),
      openIcon: openInNewTabIcon,
      event: PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_DISCOVER_PLUGINS_LINK,
      automationId: 'documentationLink',
    },
    {
      title: formatMessage(messages.integrationSettings),
      mainIcon: settingsIcon,
      link: {
        type: PROJECT_SETTINGS_TAB_PAGE,
        payload: {
          projectId: activeProject,
          settingsTab: INTEGRATIONS,
        },
      },
      description: formatMessage(messages.integrationSettingsDescription),
      openIcon: arrowRightIcon,
      event: PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_INTEGRATION_SETTINGS_LINK,
      automationId: 'integrationSettingsLink',
    },
  ];

  return (
    <div className={cx('footer')}>
      <HelpPanel items={footerItems} />
    </div>
  );
};
