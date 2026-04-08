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
import { useIntl } from 'react-intl';
import { PROJECT_MANAGER, OPERATOR, CUSTOMER, MEMBER } from 'common/constants/projectRoles';
import { ALL } from 'common/constants/permissions';
import { PERMISSIONS_MAP } from './permissions';
import { PERMISSION_NAMES, ROLE_NAMES, PERMISSION_CATEGORIES } from './permissionsName';
import styles from './permissionMap.scss';

const cx = classNames.bind(styles);

export const PermissionMap = () => {
  const { formatMessage } = useIntl();

  const generateTableCells = (permission) => {
    const roles = [PROJECT_MANAGER, MEMBER, OPERATOR, CUSTOMER];
    const ownerPermission = (
      <div title={formatMessage(ROLE_NAMES.ownTitle)} className={cx('owner-permission')} />
    );
    const notOwnerPermission = (
      <div title={formatMessage(ROLE_NAMES.notOwnTitle)} className={cx('not-owner-permission')} />
    );

    return roles.map((role) => (
      <td className={cx('permission-cell')} key={`${role}_${permission}`}>
        <div className={cx('cell-content')}>
          {PERMISSIONS_MAP[role][permission] && ownerPermission}
          {PERMISSIONS_MAP[role][permission] === ALL && notOwnerPermission}
        </div>
      </td>
    ));
  };

  const generateTableRows = () => {
    const categories = Object.keys(PERMISSION_NAMES);

    return categories.map((categoryKey) => {
      const currentCategoryActions = PERMISSION_NAMES[categoryKey];
      const categoryActionsKeys = Object.keys(currentCategoryActions);

      return (
        <Fragment key={categoryKey}>
          <tr className={cx('category-row')}>
            <td className={cx('category-header')}>
              {formatMessage(PERMISSION_CATEGORIES[categoryKey])}
            </td>
            <td colSpan="4" />
          </tr>
          {categoryActionsKeys.map((actionKey) => (
            <tr key={actionKey} className={cx('row')}>
              <td className={cx('horizontal-header')}>
                {formatMessage(currentCategoryActions[actionKey])}
              </td>
              {generateTableCells(actionKey)}
            </tr>
          ))}
        </Fragment>
      );
    });
  };

  return (
    <div className={cx('container')}>
      <table>
        <thead>
          <tr>
            <th className={cx('roles-header')}>{formatMessage(ROLE_NAMES.role)}</th>
            <th className={cx('header')}>{formatMessage(ROLE_NAMES.manager)}</th>
            <th className={cx('header')}>{formatMessage(ROLE_NAMES.member)}</th>
            <th className={cx('header')}>{formatMessage(ROLE_NAMES.operator)}</th>
            <th className={cx('header')}>{formatMessage(ROLE_NAMES.customer)}</th>
          </tr>
        </thead>
        <tbody>{generateTableRows()}</tbody>
      </table>
      <div className={cx('permission-attention')}>
        <div className={cx('legend-block')}>
          <span className={cx('legend-item')}>
            <span className={cx('owner-permission')} />
            <span className={cx('legend-text')}>{formatMessage(ROLE_NAMES.ownLegend)}</span>
          </span>
          <span className={cx('legend-item')}>
            <span className={cx('not-owner-permission')} />
            <span className={cx('legend-text')}>{formatMessage(ROLE_NAMES.notOwnLegend)}</span>
          </span>
        </div>
        <span className={cx('attention-text')}>{formatMessage(ROLE_NAMES.attention)}</span>
      </div>
    </div>
  );
};
