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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import { referenceDictionary } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { LinkComponent } from 'pages/inside/common/LinkComponent';
import styles from './serviceUnavailableScreen.scss';

const cx = classNames.bind(styles);
const INSTALLATION_GUIDES_LINK = `${referenceDictionary.rpDoc}/installation-steps`;

const renderInstallationGuidesLink = (chunks) => (
  <LinkComponent to={INSTALLATION_GUIDES_LINK} className={cx('link')} target="_blank">
    {chunks}
  </LinkComponent>
);

const renderSlackChannelLink = (chunks) => (
  <LinkComponent to={referenceDictionary.rpSlack} className={cx('link')} target="_blank">
    {chunks}
  </LinkComponent>
);

const messages = defineMessages({
  title: {
    id: 'ServiceUnavailableScreen.title',
    defaultMessage: 'Services unavailable',
  },
  descriptionApi: {
    id: 'ServiceUnavailableScreen.descriptionApi',
    defaultMessage:
      'It seems that the Service API may currently be unavailable. Refresh the page after a while or reach out to your system admin for assistance.',
  },
  refreshPage: {
    id: 'ServiceUnavailableScreen.refreshPage',
    defaultMessage: 'Refresh page',
  },
  footer: {
    id: 'ServiceUnavailableScreen.footer',
    defaultMessage:
      'You can also refer to our <installationGuides>Installation guides</installationGuides> to check the deployment correctness or our <slackChannel>Slack channel</slackChannel> for community advice.',
  },
});

const ServiceUnavailableContent = ({ onRefresh }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className={cx('content')}>
        <EmptyStatePage
          title={formatMessage(messages.title)}
          description={formatMessage(messages.descriptionApi)}
          containerClassName={cx('empty-state-container')}
          imageType="error"
          buttons={[
            {
              name: formatMessage(messages.refreshPage),
              icon: RefreshIcon,
              dataAutomationId: 'refreshUnavailableServicesButton',
              isCompact: true,
              handleButton: onRefresh,
            },
          ]}
        />
      </div>

      <div className={cx('footer')}>
        {formatMessage(messages.footer, {
          installationGuides: renderInstallationGuidesLink,
          slackChannel: renderSlackChannelLink,
        })}
      </div>
    </>
  );
};

ServiceUnavailableContent.propTypes = {
  onRefresh: PropTypes.func.isRequired,
};

export const ServiceUnavailableScreen = ({ onRefresh }) => {
  return (
    <div className={cx('screen')}>
      <div className={cx('logo-wrapper')}>
        <a
          className={cx('logo-link')}
          href={referenceDictionary.rpLanding}
          target="_blank"
          rel="noreferrer"
          aria-label="ReportPortal"
        >
          <div className={cx('logo')} />
        </a>
      </div>

      <ServiceUnavailableContent onRefresh={onRefresh} />
    </div>
  );
};

ServiceUnavailableScreen.propTypes = {
  onRefresh: PropTypes.func.isRequired,
};
