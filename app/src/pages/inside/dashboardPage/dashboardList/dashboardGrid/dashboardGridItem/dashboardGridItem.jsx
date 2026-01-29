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

import React from 'react';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Parser from 'html-react-parser';
import { getDashboardItemPageLinkSelector } from 'controllers/dashboard/selectors';
import { Icon } from 'components/main/icon';
import { NavLink } from 'components/main/navLink';
import IconLocked from 'common/img/locked-inline.svg';
import { LockedDashboardTooltip } from '../../lockedDashboardTooltip';
import { useCanLockDashboard } from '../../hooks';
import styles from './dashboardGridItem.scss';

const cx = classNames.bind(styles);

const calculateGridPreviewBaseOnWidgetId = (id) => id % 14;

export const DashboardGridItem = ({ item, onEdit, onDelete, nameEventInfo }) => {
  const { trackEvent } = useTracking();
  const getDashboardItemPageLink = useSelector(getDashboardItemPageLinkSelector);
  const canLock = useCanLockDashboard();
  const { name, description, owner, id, locked } = item;
  const isDisabled = locked && !canLock;

  const editItem = (e) => {
    e.preventDefault();
    onEdit(item);
  };

  const deleteItem = (e) => {
    e.preventDefault();
    onDelete(item);
  };

  return (
    <div className={cx('grid-view')}>
      <NavLink
        to={getDashboardItemPageLink(id)}
        className={cx('grid-view-inner')}
        onClick={() => trackEvent(nameEventInfo)}
      >
        <div className={cx('grid-cell', 'name')}>
          {locked && (
            <LockedDashboardTooltip locked={locked}>
              <div className={cx('locked-icon')}>{Parser(IconLocked)}</div>
            </LockedDashboardTooltip>
          )}
          <h3 className={cx('dashboard-link')}>{name}</h3>
        </div>
        <div
          className={cx(
            'grid-cell',
            'description',
            'preview',
            `preview-${calculateGridPreviewBaseOnWidgetId(id)}`,
          )}
        >
          <p>{description}</p>
        </div>
        <div className={cx('grid-cell', 'owner')}>{owner}</div>
        <>
          <div className={cx('grid-cell', 'edit')}>
            <LockedDashboardTooltip locked={locked}>
              <Icon type="icon-pencil" onClick={editItem} disabled={isDisabled} />
            </LockedDashboardTooltip>
          </div>
          <div className={cx('grid-cell', 'delete')}>
            <LockedDashboardTooltip locked={locked}>
              <Icon type="icon-close" onClick={deleteItem} disabled={isDisabled} />
            </LockedDashboardTooltip>
          </div>
        </>
      </NavLink>
    </div>
  );
};

DashboardGridItem.propTypes = {
  item: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  nameEventInfo: PropTypes.object,
};

DashboardGridItem.defaultProps = {
  item: {},
  onEdit: () => {},
  onDelete: () => {},
  nameEventInfo: {},
};
