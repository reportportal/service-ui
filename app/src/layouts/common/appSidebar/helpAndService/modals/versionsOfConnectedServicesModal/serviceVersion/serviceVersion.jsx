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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import { Tooltip } from '@reportportal/ui-kit';
import OpenIcon from 'common/img/open-in-new-tab-inline.svg';
import ErrorIcon from 'common/img/newIcons/error-inline.svg';
import VectorIcon from 'common/img/newIcons/vector-inline.svg';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem';
import { messages } from 'layouts/common/appSidebar/messages';
import { useTracking } from 'react-tracking';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import styles from './serviceVersion.scss';

const cx = classNames.bind(styles);
const tooltipRoot = document.getElementById('tooltip-root');
const ErrorTooltip = ({ formatMessage }) => (
  <>
    <div className={cx('tooltip-title')}>{formatMessage(messages.serviceIsUnavailable)}</div>
    <div className={cx('tooltip-description')}>
      {formatMessage(messages.serviceIsUnavailableDescription)}
    </div>
  </>
);

ErrorTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const ErrorIconShow = () => {
  return <i>{Parser(ErrorIcon)}</i>;
};

const ErrorWithTooltip = ({ formatMessage }) => (
  <Tooltip
    content={<ErrorTooltip formatMessage={formatMessage} />}
    wrapperClassName={cx('tooltip-wrapper')}
    placement="top"
    width={240}
    wrapperTabIndex={-1}
    portalRoot={tooltipRoot}
  >
    <ErrorIconShow />
  </Tooltip>
);

ErrorWithTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const VectorTooltip = ({ formatMessage }) => (
  <>
    <div className={cx('tooltip-title')}>{formatMessage(messages.serviceIsOutdated)}</div>
    <div className={cx('tooltip-description')}>
      {formatMessage(messages.serviceIsOutdatedDescription)}
    </div>
  </>
);

VectorTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const VectorIconShow = () => {
  return <i>{Parser(VectorIcon)}</i>;
};

const VectorWithTooltip = ({ formatMessage }) => (
  <Tooltip
    content={<VectorTooltip formatMessage={formatMessage} />}
    wrapperClassName={cx('tooltip-wrapper')}
    placement="top"
    width={240}
    wrapperTabIndex={-1}
    portalRoot={tooltipRoot}
  >
    <VectorIconShow />
  </Tooltip>
);

VectorWithTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export const ServiceVersion = ({ service, content, analyticsCategory }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { name, version, linkTo, isNewVersion, isUnavailable } = service;
  const isError = !version || isUnavailable;

  const handleUpdateClick = () => {
    trackEvent(LOGIN_PAGE_EVENTS.clickOnServiceUpdateLink(analyticsCategory, name));
  };

  return (
    <div className={cx('service-version')}>
      <div className={cx('name', { update: isNewVersion, error: isError })}>
        {name}
        {isError ? <ErrorWithTooltip formatMessage={formatMessage} /> : null}
        {isNewVersion && !isError ? <VectorWithTooltip formatMessage={formatMessage} /> : null}
      </div>
      {version && <div className={cx('version', { update: isNewVersion })}>{version}</div>}
      {linkTo && version && isNewVersion && (
        <LinkItem
          link={linkTo}
          content={content}
          className={cx('link')}
          icon={OpenIcon}
          onClick={handleUpdateClick}
        />
      )}
    </div>
  );
};

ServiceVersion.propTypes = {
  service: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
  analyticsCategory: PropTypes.string.isRequired,
};
