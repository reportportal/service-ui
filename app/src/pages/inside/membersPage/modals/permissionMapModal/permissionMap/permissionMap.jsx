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
import { PERMISSION_NAMES, ROLE_NAMES } from './permissionsName';

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
        return <Fragment key={`${role}_${permission}`}>{hasPermission}</Fragment>;
      }
      if (role === MEMBER || role === CUSTOMER) {
        if (PERMISSIONS_MAP[role][permission]) {
          if (PERMISSIONS_MAP[role][permission] === ALL) {
            return (
              <Fragment key={`${role}_${permission}`}>
                {hasPermission}
                {hasPermission}
              </Fragment>
            );
          }
          return (
            <Fragment key={`${role}_${permission}`}>
              {hasPermission}
              {noPermission}
            </Fragment>
          );
        }
        return (
          <Fragment key={`${role}_${permission}`}>
            {noPermission}
            {noPermission}
          </Fragment>
        );
      }
      if (PERMISSIONS_MAP[role][permission]) {
        return <Fragment key={`${role}_${permission}`}>{hasPermission}</Fragment>;
      }
      return <Fragment key={`${role}_${permission}`}>{noPermission}</Fragment>;
    });
  };

  generateTableRows = () => {
    const keys = Object.keys(ACTIONS);
    const actions = keys.filter((key) => PERMISSION_NAMES[key]);
    return actions.map((key) => {
      const isAttention = PERMISSION_NAMES[key].attention;
      return (
        <tr key={key} className={cx('row')}>
          <td className={cx('col', 'horizontal-header')}>
            {this.props.intl.formatMessage(PERMISSION_NAMES[key])}
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
                {intl.formatMessage(ROLE_NAMES.role)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.admin)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.manager)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.member)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.operator)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.customer)}
              </th>
            </tr>
            <tr>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.owner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.notOwner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.owner)}
              </th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(ROLE_NAMES.notOwner)}
              </th>
            </tr>
          </thead>
          <tbody>{this.generateTableRows()}</tbody>
        </table>
        <div className={cx('permission-attention')}>
          <span className={cx('attention')}>*</span>
          <span>{intl.formatMessage(ROLE_NAMES.oneAttention)}</span>
        </div>
      </div>
    );
  }
}
