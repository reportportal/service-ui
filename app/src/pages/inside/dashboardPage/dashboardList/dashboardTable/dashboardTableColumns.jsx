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

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { Icon } from 'components/main/icon';
import { NavLink } from 'components/main/navLink';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { injectIntl } from 'react-intl';
import { copyDashboardConfigAction } from 'controllers/dashboard';
import { userRolesSelector } from 'controllers/pages';
import { canWorkWithDashboard } from 'common/utils/permissions/permissions';
import styles from './dashboardTable.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const NameColumn = track()(({
  value,
  customProps: { getLink },
  className,
  tracking: { trackEvent },
}) => {
  const { id: dashboardId, name } = value;
  return (
    <NavLink
      className={cx(className, 'name')}
      to={getLink(dashboardId)}
      onClick={() => {
        trackEvent(DASHBOARD_EVENTS.clickOnDashboardName(dashboardId));
      }}
    >
      {name}
    </NavLink>
  );
});

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

export const DuplicateColumn = track()(
  injectIntl(({ value, customProps, className, tracking: { trackEvent }, intl }) => {
    const [opened, setOpened] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const userRoles = useSelector(userRolesSelector);

    useEffect(() => {
      if (opened) {
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

    const handleCopyConfig = (e) => {
      e.stopPropagation();
      trackEvent(DASHBOARD_EVENTS.clickOnDuplicateMenuOption('copy_dashboard'));
      dispatch(copyDashboardConfigAction(value));
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
                {canWorkWithDashboard(userRoles) && (
                  <button type="button" className={cx('dropdown-item')} onClick={handleDuplicate}>
                    {intl.formatMessage(messages.duplicate)}
                  </button>
                )}
                <button type="button" className={cx('dropdown-item')} onClick={handleCopyConfig}>
                  {intl.formatMessage(messages.copyConfig)}
                </button>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }),
);

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

export const EditColumn = track()(({ value, customProps, className, tracking: { trackEvent } }) => {
  const { onEdit, disabled } = customProps;
  const { id } = value;

  const editItemHandler = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', id));
    onEdit(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button', 'edit-cell')}>
      <div className={cx('icon-holder')}>
        <Icon type="icon-pencil" onClick={editItemHandler} disabled={disabled} />
      </div>
    </div>
  );
});
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

export const DeleteColumn = track()(({
  value,
  customProps,
  className,
  tracking: { trackEvent },
}) => {
  const { onDelete, disabled } = customProps;
  const deleteItemHandler = () => {
    const { id } = value;
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', id));
    onDelete(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button', 'delete-cell')}>
      <div className={cx('icon-holder')}>
        <Icon type="icon-delete" onClick={deleteItemHandler} disabled={disabled} />
      </div>
    </div>
  );
});
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
