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

import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { Toggle, MeatballMenuIcon, RefreshIcon } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { getRelativeUnits } from 'common/utils/timeDateUtils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import { STATE_RENDERING } from 'components/widgets/common/constants';
import { MATERIALIZED_VIEW_WIDGETS } from 'components/widgets';
import { ActionMenu } from 'components/actionMenu';
import { useCanLockDashboard } from 'common/hooks';
import styles from './widgetHeader.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  lastRefresh: {
    id: 'WidgetHeader.lastRefresh',
    defaultMessage: 'Updated',
  },
  refresh: {
    id: 'WidgetHeader.refresh',
    defaultMessage: 'Refresh',
  },
  moreActions: {
    id: 'WidgetHeader.moreActions',
    defaultMessage: 'More actions',
  },
  displayLaunches: {
    id: 'WidgetHeader.displayLaunches',
    defaultMessage: 'Display launches',
  },
});

export const WidgetHeader = ({
  data,
  onRefresh,
  onDelete,
  onEdit,
  onForceUpdate,
  canEdit,
  isPrintMode,
  isRefreshing,
  isDisplayedLaunches,
  onDisplayLaunchesToggle,
}) => {
  const { formatMessage, formatRelativeTime } = useIntl();
  const dashboard = useSelector(activeDashboardItemSelector);
  const canLock = useCanLockDashboard();
  const isDeleteDisabled = dashboard?.locked && !canLock;
  const isForceUpdateAvailable = MATERIALIZED_VIEW_WIDGETS.includes(data.type);
  const isEditHidden = isForceUpdateAvailable && data.state === STATE_RENDERING;
  const { value: startTime, unit } = getRelativeUnits(data.lastRefresh);
  // the short style gives "1 min. ago"; the design shows "1 min ago"
  const lastRefreshText = formatRelativeTime(startTime, unit, {
    numeric: 'auto',
    style: 'short',
  }).replace('min.', 'min');

  const menuActions = [
    {
      label: formatMessage(COMMON_LOCALE_KEYS.EDIT),
      onClick: onEdit,
      hasPermission: canEdit && !isEditHidden,
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      onClick: onDelete,
      hasPermission: canEdit,
      disabled: isDeleteDisabled,
      danger: true,
    },
  ];
  const hasMenuActions = menuActions.some(({ hasPermission }) => hasPermission);

  return (
    <div className={cx('widget-header')}>
      <div className={cx('info-block')}>
        <div className={cx('title-row')}>
          <span className={cx('widget-name')} title={data.name}>
            {data.name}
          </span>
          {data.type && (
            <span className={cx('type-label')}>
              {widgetTypesMessages[data.type]
                ? formatMessage(widgetTypesMessages[data.type])
                : data.type}
            </span>
          )}
        </div>
        {data.description && (
          <div className={cx('widget-description')} title={data.description}>
            {data.description}
          </div>
        )}
      </div>
      {!isPrintMode && (
        <div className={cx('controls-block')}>
          {onDisplayLaunchesToggle && (
            <Toggle
              value={isDisplayedLaunches}
              onChange={onDisplayLaunchesToggle}
              className={cx('display-launches')}
            >
              <span className={cx('display-launches-title')}>
                {formatMessage(messages.displayLaunches)}
              </span>
            </Toggle>
          )}
          {isForceUpdateAvailable && data.lastRefresh && (
            <span className={cx('last-refresh')}>
              {formatMessage(messages.lastRefresh)} {lastRefreshText}
            </span>
          )}
          {data.type && (
            <button
              type="button"
              className={cx('control', { pressed: isRefreshing })}
              aria-label={formatMessage(messages.refresh)}
              aria-pressed={isRefreshing}
              onClick={isForceUpdateAvailable ? onForceUpdate : onRefresh}
            >
              <RefreshIcon />
            </button>
          )}
          {data.type && hasMenuActions && (
            <div className={cx('menu')}>
              <ActionMenu
                actions={menuActions}
                trigger={
                  <button
                    type="button"
                    className={cx('control')}
                    aria-label={formatMessage(messages.moreActions)}
                  >
                    <MeatballMenuIcon />
                  </button>
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

WidgetHeader.propTypes = {
  data: PropTypes.object,
  onRefresh: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onForceUpdate: PropTypes.func,
  canEdit: PropTypes.bool,
  isPrintMode: PropTypes.bool,
  isRefreshing: PropTypes.bool,
  isDisplayedLaunches: PropTypes.bool,
  onDisplayLaunchesToggle: PropTypes.func,
};

WidgetHeader.defaultProps = {
  data: {},
  onRefresh: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onForceUpdate: () => {},
  canEdit: false,
  isPrintMode: false,
  isRefreshing: false,
  isDisplayedLaunches: false,
};
