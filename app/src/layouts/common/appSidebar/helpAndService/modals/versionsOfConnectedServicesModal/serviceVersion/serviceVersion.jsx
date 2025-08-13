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
import { withTooltip } from 'componentLibrary/tooltip';
import OpenIcon from 'common/img/open-in-new-tab-inline.svg';
import ErrorIcon from 'common/img/newIcons/error-inline.svg';
import VectorIcon from 'common/img/newIcons/vector-inline.svg';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem';
import { messages } from 'layouts/common/appSidebar/messages';
import { useTracking } from 'react-tracking';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import styles from './serviceVersion.scss';

const cx = classNames.bind(styles);

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

const ErrorWithTooltip = withTooltip({
  ContentComponent: ErrorTooltip,
  tooltipWrapperClassName: cx('tooltip-wrapper'),
  side: 'top',
  arrowPosition: 'middle',
  width: 240,
})(ErrorIconShow);

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

const VectorWithTooltip = withTooltip({
  ContentComponent: VectorTooltip,
  tooltipWrapperClassName: cx('tooltip-wrapper'),
  side: 'top',
  arrowPosition: 'middle',
  width: 240,
})(VectorIconShow);

VectorWithTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export const ServiceVersion = ({ service, content }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { name, version, linkTo, isNewVersion } = service;
  const isError = !version;

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
          onClick={() => trackEvent(SIDEBAR_EVENTS.onClickUpdateLink(name))}
        />
      )}
    </div>
  );
};

ServiceVersion.propTypes = {
  service: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
};
