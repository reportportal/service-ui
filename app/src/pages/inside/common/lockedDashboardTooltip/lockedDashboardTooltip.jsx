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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Tooltip } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { useCanLockDashboard } from 'common/hooks/useCanLockDashboard';
import { messages } from './messages';
import styles from './lockedDashboardTooltip.scss';

const cx = classNames.bind(styles);

export const LockedDashboardTooltip = ({ children, locked, variant }) => {
  const { formatMessage } = useIntl();
  const canLock = useCanLockDashboard();

  if (!locked || canLock) return children;

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('tooltip-root') : null;
  const message = variant === 'widget' ? messages.lockedWidget : messages.lockedDashboard;

  return (
    <Tooltip
      content={formatMessage(message)}
      wrapperClassName={cx('locked-tooltip-wrapper')}
      tooltipClassName={cx('locked-tooltip')}
      contentClassName={cx('locked-tooltip-content')}
      portalRoot={portalRoot}
    >
      {children}
    </Tooltip>
  );
};

LockedDashboardTooltip.propTypes = {
  children: PropTypes.node,
  locked: PropTypes.bool,
  variant: PropTypes.oneOf(['dashboard', 'widget']),
};

LockedDashboardTooltip.defaultProps = {
  children: null,
  locked: false,
  variant: 'dashboard',
};
