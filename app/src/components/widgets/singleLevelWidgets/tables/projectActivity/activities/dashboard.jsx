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

import React, { Fragment } from 'react';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import {
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  UPDATE_DASHBOARD_STATE,
  DELETE_DASHBOARD,
} from 'common/constants/actionTypes';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'DashboardChanges.createDashboard',
    defaultMessage: 'created dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'DashboardChanges.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [UPDATE_DASHBOARD_STATE]: {
    id: 'DashboardChanges.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'DashboardChanges.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  [`${UPDATE_DASHBOARD_STATE}Changed`]: {
    id: 'DashboardChanges.dashboardStateChanged',
    defaultMessage:
      'Dashboard state changed from <span>{oldValue}</span> to <span>{newValue}</span>.',
  },
  locked: {
    id: 'DashboardChanges.locked',
    defaultMessage: 'locked',
  },
  unlocked: {
    id: 'DashboardChanges.unlocked',
    defaultMessage: 'unlocked',
  },
});

const SpanBold = (chunks) => <span className={cx('activity-name')}>{chunks}</span>;

export const Dashboard = ({ activity }) => {
  const { formatMessage } = useIntl();

  const getActivityHistory = () => {
    if (activity.actionType === UPDATE_DASHBOARD_STATE) {
      const history = activity.details?.history || [];
      const formatStateLabel = (value) =>
        formatMessage(value === 'true' || value === true ? messages.locked : messages.unlocked);

      const historyItems = history.map((item) => {
        const { field, oldValue, newValue } = item;

        return {
          key: `${field}-${oldValue}-${newValue}`,
          content: formatMessage(messages[`${activity.actionType}Changed`], {
            oldValue: formatStateLabel(item.oldValue),
            newValue: formatStateLabel(item.newValue),
            span: SpanBold,
          }),
        };
      });

      return (
        <>
          {historyItems.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 && ' '}
              {item.content}
            </Fragment>
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <>
      <span className={cx('user-name')}>{activity.user}</span>
      {formatMessage(messages[activity.actionType])}
      <span className={cx('activity-name')}> {activity.objectName}. </span>
      {getActivityHistory()}
    </>
  );
};

Dashboard.propTypes = activityItemPropTypes;
Dashboard.defaultProps = activityItemDefaultProps;
