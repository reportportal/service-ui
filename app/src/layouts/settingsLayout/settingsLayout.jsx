/*
 * Copyright 2022 EPAM Systems
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
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { authExtensionsSelector, uiBuildVersionSelector } from 'controllers/appInfo';
import { referenceDictionary } from 'common/utils';
import styles from './settingsLayout.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  github: {
    id: 'SettingsLayout.github',
    defaultMessage: 'Fork us on GitHub',
  },
  slack: {
    id: 'SettingsLayout.slack',
    defaultMessage: 'Chat with us on Slack',
  },
  contactUs: {
    id: 'SettingsLayout.contactUs',
    defaultMessage: 'Contact us',
  },
  epam: {
    id: 'SettingsLayout.epam',
    defaultMessage: 'EPAM',
  },
  documentation: {
    id: 'SettingsLayout.documentation',
    defaultMessage: 'Documentation',
  },
  privacyPolicy: {
    id: 'SettingsLayout.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
  rights: {
    id: 'SettingsLayout.rights',
    defaultMessage: '© Report Portal 2023 All rights reserved',
  },
  build: {
    id: 'SettingsLayout.build',
    defaultMessage: 'Build: {buildVersion}',
  },
});

const SettingsLayoutBase = ({ navigation, children, buildVersion, authExtensions }) => {
  const { formatMessage } = useIntl();

  const footerLeftItems = [
    formatMessage(messages.build, {
      buildVersion,
    }),
    formatMessage(messages.rights),
  ];

  const footerRightItems = [
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx('link')}>
      <span>{formatMessage(messages.github)}</span>
    </a>,
    <a href={referenceDictionary.rpSlack} target="_blank" className={cx('link')}>
      <span>{formatMessage(messages.slack)}</span>
    </a>,
    <a href={referenceDictionary.rpEmail} target="_blank" className={cx('link')}>
      <span>{formatMessage(messages.contactUs)}</span>
    </a>,
    <a href={referenceDictionary.rpEpam} target="_blank" className={cx('link')}>
      <span>{formatMessage(messages.epam)}</span>
    </a>,
    <a href={referenceDictionary.rpDoc} target="_blank" className={cx('link')}>
      <span>{formatMessage(messages.documentation)}</span>
    </a>,
    (authExtensions.epam || authExtensions.saas) && (
      <a href={referenceDictionary.rpEpamPolicy} target="_blank" className={cx('link')}>
        <span>{formatMessage(messages.privacyPolicy)}</span>
      </a>
    ),
  ];

  return (
    <div className={cx('container')}>
      {navigation && <div className={cx('navigation')}>{navigation}</div>}
      <div className={cx('section')}>
        <div className={cx('section-content')}>{children}</div>
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
              <>
                {item && (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={`footer-right-item-${i}`} className={cx('footer-item')}>
                    {item}
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsLayoutBase.propTypes = {
  navigation: PropTypes.node,
  header: PropTypes.node,
  children: PropTypes.node,
  buildVersion: PropTypes.string.isRequired,
  authExtensions: PropTypes.object.isRequired,
};
SettingsLayoutBase.defaultProps = {
  navigation: null,
  header: null,
  children: null,
};
export const SettingsLayout = connect((state) => ({
  buildVersion: uiBuildVersionSelector(state),
  authExtensions: authExtensionsSelector(state),
}))(SettingsLayoutBase);
