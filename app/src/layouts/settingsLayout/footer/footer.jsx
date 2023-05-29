/*
 * Copyright 2023 EPAM Systems
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

import React, { Fragment } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { referenceDictionary } from 'common/utils';
import { uiBuildVersionSelector } from 'controllers/appInfo';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import styles from './footer.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  github: {
    id: 'SettingsLayout.footer.github',
    defaultMessage: 'Fork us on GitHub',
  },
  slack: {
    id: 'SettingsLayout.footer.slack',
    defaultMessage: 'Chat with us on Slack',
  },
  contactUs: {
    id: 'SettingsLayout.footer.contactUs',
    defaultMessage: 'Contact us',
  },
  epam: {
    id: 'SettingsLayout.footer.epam',
    defaultMessage: 'EPAM',
  },
  documentation: {
    id: 'SettingsLayout.footer.documentation',
    defaultMessage: 'Documentation',
  },
  privacyPolicy: {
    id: 'SettingsLayout.footer.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
  rights: {
    id: 'SettingsLayout.footer.rights',
    defaultMessage: '© Report Portal {currentYear} All rights reserved',
  },
  build: {
    id: 'SettingsLayout.footer.build',
    defaultMessage: 'Build: {buildVersion}',
  },
});

export const Footer = () => {
  const { formatMessage } = useIntl();
  const buildVersion = useSelector(uiBuildVersionSelector);
  const instanceType = useSelector(instanceTypeSelector);

  const currentYear = new Date().getFullYear();

  const footerLeftItems = [
    formatMessage(messages.build, {
      buildVersion,
    }),
    formatMessage(messages.rights, {
      currentYear,
    }),
  ];

  const footerRightItems = [
    {
      link: referenceDictionary.rpGitHub,
      message: formatMessage(messages.github),
    },
    {
      link: referenceDictionary.rpSlack,
      message: formatMessage(messages.slack),
    },
    {
      link: referenceDictionary.rpEmail,
      message: formatMessage(messages.contactUs),
    },
    {
      link: referenceDictionary.rpEpam,
      message: formatMessage(messages.epam),
    },
    {
      link: referenceDictionary.rpDoc,
      message: formatMessage(messages.documentation),
    },
    (instanceType === EPAM || instanceType === SAAS) && {
      link: referenceDictionary.rpEpamPolicy,
      message: formatMessage(messages.privacyPolicy),
    },
  ];

  return (
    <div className={cx('footer')}>
      <div className={cx('footer-left-items')}>
        {footerLeftItems.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`footer-left-item-${i}`} className={cx('footer-item')}>
            {item}
          </div>
        ))}
      </div>
      <div className={cx('footer-right-items')}>
        {footerRightItems.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={`footer-right-item-${i}`}>
            {item && (
              <div className={cx('footer-item')}>
                <a href={item.link} target="_blank" className={cx('link')}>
                  {item.message}
                </a>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
