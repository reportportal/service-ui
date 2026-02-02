/*
 * Copyright 2025 EPAM Systems
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

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import { Icon } from 'components/main/icon';
import { NavLink } from 'components/main/navLink';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { showDefaultErrorNotification, showSuccessNotification } from 'controllers/notification';
import { fetch } from 'common/utils';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import { LockedIcon } from 'pages/inside/common/lockedIcon';
import { useCanLockDashboard } from 'common/hooks/useCanLockDashboard';
import styles from './dashboardTable.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const NameColumn = ({ value, customProps: { getLink }, className }) => {
  const { trackEvent } = useTracking();
  const { id: dashboardId, name, locked } = value;

  return (
    <div className={cx(className, 'name-container')}>
      {locked && (
        <LockedDashboardTooltip locked={locked}>
          <LockedIcon />
        </LockedDashboardTooltip>
      )}
      <NavLink
        className={cx('name')}
        to={getLink(dashboardId)}
        onClick={() => {
          trackEvent(DASHBOARD_EVENTS.clickOnDashboardName(dashboardId));
        }}
      >
        {name}
      </NavLink>
    </div>
  );
};
NameColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
  className: PropTypes.string,
};
NameColumn.defaultProps = {
  value: {},
  customProps: {},
  className: '',
};

export const DescriptionColumn = ({ value, className }) => (
  <div className={cx(className, 'description', { empty: !value })}>{value}</div>
);
DescriptionColumn.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
};
DescriptionColumn.defaultProps = {
  value: '',
  className: '',
};

export const OwnerColumn = ({ value, className }) => (
  <div className={cx(className, 'owner')}>{value}</div>
);
OwnerColumn.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
};
OwnerColumn.defaultProps = {
  value: '',
  className: '',
};

export const DuplicateColumn = ({ value, customProps, className }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const activeProject = useSelector(activeProjectSelector);

  // The promise should be stored in state to prevent losing document focus (causes errors) in Safari when clicking to copy
  const [dashboardConfigPromise, setDashboardConfigPromise] = useState(null);

  const fetchDashboardConfig = async () => {
    const url = URLS.dashboardConfig(activeProject, value.id);
    return fetch(url);
  };

  useEffect(() => {
    if (opened) {
      setDashboardConfigPromise(fetchDashboardConfig());
      const handleOutsideClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setOpened(false);
        }
      };

      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
    return () => {};
  }, [opened]);

  const handleClick = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('duplicate', value.id));
    setOpened(!opened);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    trackEvent(DASHBOARD_EVENTS.clickOnDuplicateMenuOption('duplicate'));
    customProps.onDuplicate(value);
    setOpened(false);
  };

  const handleCopyConfig = async (e) => {
    e.stopPropagation();
    trackEvent(DASHBOARD_EVENTS.clickOnDuplicateMenuOption('copy_dashboard'));

    try {
      const config = await dashboardConfigPromise;
      await navigator.clipboard.writeText(JSON.stringify(config));
      dispatch(
        showSuccessNotification({
          messageId: 'dashboardConfigurationCopied',
        }),
      );
    } catch (error) {
      dispatch(showDefaultErrorNotification(error));
    }

    setOpened(false);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button')}>
      <div className={cx('icon-holder', 'no-border')}>
        <button
          ref={dropdownRef}
          type="button"
          className={cx('duplicate-dropdown')}
          onClick={handleClick}
        >
          <div className={cx('duplicate-icon')}>{Parser(IconDuplicate)}</div>
          <i className={cx('arrow', { opened })} />
          {opened && (
            <div className={cx('duplicate-menu', 'shown')}>
              <button type="button" className={cx('dropdown-item')} onClick={handleDuplicate}>
                {formatMessage(messages.duplicate)}
              </button>
              <button type="button" className={cx('dropdown-item')} onClick={handleCopyConfig}>
                {formatMessage(messages.copyConfig)}
              </button>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

DuplicateColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
  className: PropTypes.string,
};

DuplicateColumn.defaultProps = {
  value: {},
  customProps: {},
  className: '',
};

export const EditColumn = ({ value, customProps, className }) => {
  const { trackEvent } = useTracking();
  const { onEdit } = customProps;
  const { id, locked } = value;
  const canLock = useCanLockDashboard();
  const isDisabled = locked && !canLock;

  const editItemHandler = () => {
    if (isDisabled) return;
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', id));
    onEdit(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button', 'edit-cell')}>
      <div className={cx('icon-holder')}>
        <LockedDashboardTooltip locked={locked}>
          <Icon type="icon-pencil" onClick={editItemHandler} disabled={isDisabled} />
        </LockedDashboardTooltip>
      </div>
    </div>
  );
};
EditColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
  className: PropTypes.string,
};
EditColumn.defaultProps = {
  value: {},
  customProps: {},
  className: '',
};

export const DeleteColumn = ({ value, customProps, className }) => {
  const { trackEvent } = useTracking();
  const { id, locked } = value;
  const canLock = useCanLockDashboard();
  const isDisabled = locked && !canLock;

  const deleteItemHandler = () => {
    if (isDisabled) return;
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', id));
    customProps.onDelete(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button', 'delete-cell')}>
      <div className={cx('icon-holder')}>
        <LockedDashboardTooltip locked={locked}>
          <Icon type="icon-delete" onClick={deleteItemHandler} disabled={isDisabled} />
        </LockedDashboardTooltip>
      </div>
    </div>
  );
};
DeleteColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
  className: PropTypes.string,
};
DeleteColumn.defaultProps = {
  value: {},
  customProps: {},
  className: '',
};
