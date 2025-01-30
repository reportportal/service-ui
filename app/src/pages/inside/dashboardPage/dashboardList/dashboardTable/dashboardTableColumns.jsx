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

import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { Icon } from 'components/main/icon';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { NavLink } from 'components/main/navLink';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);

export const NameColumn = track()(
  ({ value, customProps: { projectId }, className, tracking: { trackEvent } }) => {
    const { id: dashboardId, name } = value;
    return (
      <NavLink
        className={cx(className, 'name')}
        to={{ type: PROJECT_DASHBOARD_ITEM_PAGE, payload: { projectId, dashboardId } }}
        onClick={() => {
          trackEvent(DASHBOARD_EVENTS.clickOnDashboardName(dashboardId));
        }}
      >
        {name}
      </NavLink>
    );
  },
);
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
  ({ value, customProps, className, tracking: { trackEvent } }) => {
    const [opened, setOpened] = useState(false);

    useEffect(() => {
      const handleOutsideClick = (e) => {
        if (!e.target.closest(`.${cx('duplicate-dropdown')}`) && opened) {
          setOpened(false);
        }
      };

      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }, [opened]);

    const handleDuplicate = () => {
      const { id } = value;
      trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('duplicate', id));
      customProps.onDuplicate(value);
      setOpened(false);
    };

    const handleCopyConfig = () => {
      // TODO: Copy configuration functionality will be added later
      setOpened(false);
    };

    return (
      <div className={cx(className, 'icon-cell', 'with-button')}>
        <div className={cx('icon-holder', 'no-border')}>
          <div className={cx('duplicate-dropdown')} onClick={() => setOpened(!opened)}>
            <div className={cx('duplicate-icon')}>
              {Parser(IconDuplicate.replace('stroke="#999999"', 'stroke="currentColor"'))}
            </div>
            <i className={cx('arrow', { opened })} />
            {opened && (
              <div className={cx('hamburger-menu', 'shown')}>
                <div className={cx('dropdown-item')} onClick={handleDuplicate}>
                  Duplicate
                </div>
                <div className={cx('dropdown-item')} onClick={handleCopyConfig}>
                  Copy dashboard configuration to clipboard
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
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
  const { onEdit } = customProps;
  const { id } = value;

  const editItemHandler = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', id));
    onEdit(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button', 'edit-cell')}>
      <div className={cx('icon-holder')}>
        <Icon type="icon-pencil" onClick={editItemHandler} />
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

export const DeleteColumn = track()(
  ({ value, customProps, className, tracking: { trackEvent } }) => {
    const deleteItemHandler = () => {
      const { id } = value;
      trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', id));
      customProps.onDelete(value);
    };

    return (
      <div className={cx(className, 'icon-cell', 'with-button', 'delete-cell')}>
        <div className={cx('icon-holder')}>
          <Icon type="icon-delete" onClick={deleteItemHandler} />
        </div>
      </div>
    );
  },
);
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
