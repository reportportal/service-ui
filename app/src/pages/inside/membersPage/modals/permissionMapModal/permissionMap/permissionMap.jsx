import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import {
  PROJECT_MANAGER,
  OPERATOR,
  CUSTOMER,
  MEMBER,
  ADMINISTRATOR,
} from 'common/constants/projectRoles';
import { ACTIONS, PERMISSIONS_MAP, ALL } from 'common/constants/permissions';
import styles from './permissionMap.scss';
import { PermissionsName, RolesName } from './permissionsName';

const cx = classNames.bind(styles);

@injectIntl
export class PermissionMap extends Component {
  static propTypes = {
    intl: intlShape,
  };
  static defaultProps = {
    intl: {},
  };
  generateTableCells = (permission) => {
    const roles = [ADMINISTRATOR, PROJECT_MANAGER, MEMBER, OPERATOR, CUSTOMER];
    const hasPermission = (
      <td className={cx('col', 'has-permission')}>
        <i className={cx('rp-icons', 'rp-icons-check')} />
      </td>
    );
    const noPermission = <td className={cx('col')} />;
    return roles.map((role) => {
      if (role === ADMINISTRATOR) {
        return <Fragment key={role}>{hasPermission}</Fragment>;
      }
      if (role === MEMBER || role === CUSTOMER) {
        if (PERMISSIONS_MAP[role][permission]) {
          if (PERMISSIONS_MAP[role][permission] === ALL) {
            return (
              <Fragment key={role}>
                {hasPermission}
                {hasPermission}
              </Fragment>
            );
          }
          return (
            <Fragment key={role}>
              {hasPermission}
              {noPermission}
            </Fragment>
          );
        }
        return (
          <Fragment key={role}>
            {noPermission}
            {noPermission}
          </Fragment>
        );
      }
      if (PERMISSIONS_MAP[role][permission]) {
        return <Fragment key={role}>{hasPermission}</Fragment>;
      }
      return <Fragment key={role}>{noPermission}</Fragment>;
    });
  };

  generateTableRows = () => {
    const keys = Object.keys(ACTIONS);
    return keys.map((key) => {
      const isAttention = PermissionsName[key].attention;
      return (
        <tr key={key} className={cx('row')}>
          <td className={cx('col', 'horizontal-header')}>
            {this.props.intl.formatMessage(PermissionsName[key])}
            {isAttention && <span className={cx('attention')}>*</span>}
          </td>
          {this.generateTableCells(key)}
        </tr>
      );
    });
  };
  render() {
    const { intl } = this.props;
    return (
      <div className={cx('container')}>
        <table className={cx('table-permissions')}>
          <thead>
            <tr>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.role)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.admin)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.manager)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.member)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.operator)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.customer)}
              </th>
            </tr>
            <tr>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.owner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.notOwner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.owner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(RolesName.notOwner)}
              </th>
            </tr>
          </thead>
          <tbody>{this.generateTableRows()}</tbody>
        </table>
        <div className={cx('permission-attention')}>
          <span className={cx('attention')}>*</span>
          <span>{intl.formatMessage(RolesName.oneAttention)}</span>
        </div>
      </div>
    );
  }
}
