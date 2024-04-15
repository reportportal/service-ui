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

import { HelpPanel } from '../helpPanel';
import styles from './footer.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const NotificationsFooter = () => {
  const { formatMessage } = useIntl();

  const footerItems = [
    {
      title: formatMessage(messages.discoverPlugins),
      mainIcon: discoverPluginsIcon,
      link: 'https://reportportal.io/docs/category/plugins',
      description: formatMessage(messages.discoverPluginsDescription),
      openIcon: openInNewTabIcon,
    },
    {
      title: formatMessage(messages.integrationSettings),
      mainIcon: settingsIcon,
      link: 'settings/integrations?subPage=email', // changes needed
      description: formatMessage(messages.integrationSettingsDescription),
      openIcon: arrowRightIcon,
    },
  ];

  return (
    <div className={cx('footer')}>
      <HelpPanel items={footerItems} />
    </div>
  );
};
