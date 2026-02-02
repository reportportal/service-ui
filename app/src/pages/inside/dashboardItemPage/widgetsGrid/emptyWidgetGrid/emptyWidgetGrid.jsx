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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import AddDashboardIcon from 'common/img/add-widget-inline.svg';
import styles from './emptyWidgetGrid.scss';
import { useCanLockDashboard } from 'common/hooks';
import { useSelector } from 'react-redux';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  dashboardEmptyText: {
    id: 'DashboardItemPage.dashboardEmptyText',
    defaultMessage: 'Add your first widget to analyse statistics',
  },
  notMyDashboardEmptyHeader: {
    id: 'DashboardItemPage.notMyDashboardEmptyHeader',
    defaultMessage: 'There are no widgets on this dashboard',
  },
});

export const EmptyWidgetGrid = ({ action, isDisable }) => {
  const { formatMessage } = useIntl();
  const canLock = useCanLockDashboard();
  const dashboard = useSelector(activeDashboardItemSelector);
  const isButtonDisabled = dashboard?.locked && !canLock;

  return (
    <div className={cx('empty-widget')}>
      <div className={cx('empty-dashboard', { 'add-enabled': !isDisable })} />
      <p className={cx('empty-widget-headline')}>
        {formatMessage(messages.notMyDashboardEmptyHeader)}
      </p>
      {!isDisable && (
        <Fragment>
          <p className={cx('empty-widget-text')}>{formatMessage(messages.dashboardEmptyText)}</p>
          <div className={cx('empty-widget-content')}>
            <LockedDashboardTooltip locked={dashboard?.locked}>
              <GhostButton
                icon={AddDashboardIcon}
                onClick={action}
                disabled={isButtonDisabled}
                appearance="faded"
              >
                {formatMessage(messages.addNewWidget)}
              </GhostButton>
            </LockedDashboardTooltip>
          </div>
        </Fragment>
      )}
    </div>
  );
};

EmptyWidgetGrid.propTypes = {
  action: PropTypes.func,
  isDisable: PropTypes.bool,
};

EmptyWidgetGrid.defaultProps = {
  action: () => {},
  isDisable: false,
};
