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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Icon } from 'components/main/icon';
import { PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { NavLink } from 'components/main/navLink';
import { canEditDashboard, canDeleteDashboard } from 'common/utils/permissions';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);

export const NameColumn = ({ value, customProps: { projectId }, className }) => {
  const { id: dashboardId, name } = value;
  return (
    <NavLink
      className={cx(className, 'name')}
      to={{ type: PROJECT_DASHBOARD_ITEM_PAGE, payload: { projectId, dashboardId } }}
    >
      {name}
    </NavLink>
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

export const SharedColumn = ({
  value: { share, owner },
  customProps: {
    currentUser: { userId },
  },
  className,
}) => {
  const isShared = share || userId !== owner;

  return (
    <div className={cx(className, 'icon-cell', { empty: !isShared })}>
      {isShared && <Icon type="icon-check" />}
    </div>
  );
};
SharedColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
  className: PropTypes.string,
};
SharedColumn.defaultProps = {
  value: {},
  customProps: {},
  className: '',
};

export const EditColumn = ({ value, customProps, className }) => {
  const {
    onEdit,
    currentUser: { userId, userRole },
    projectRole,
  } = customProps;
  const { owner } = value;

  const editItemHandler = () => {
    onEdit(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button')}>
      <div className={cx('icon-holder')}>
        {canEditDashboard(userRole, projectRole, userId === owner) && (
          <Icon type="icon-pencil" onClick={editItemHandler} />
        )}
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
  const {
    currentUser: { userId, userRole },
    projectRole,
  } = customProps;
  const { owner } = value;

  const deleteItemHandler = () => {
    customProps.onDelete(value);
  };

  return (
    <div className={cx(className, 'icon-cell', 'with-button')}>
      <div className={cx('icon-holder')}>
        {canDeleteDashboard(userRole, projectRole, userId === owner) && (
          <Icon type="icon-delete" onClick={deleteItemHandler} />
        )}
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
