import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import styles from './permissionMap.scss';
import { PermissionsName, RolesName } from './permissionsName';
import { PERMISSION_ROLES, PERMISSIONS_MAP, ALL } from './permissionsConfig';

const cx = classNames.bind(styles);

@injectIntl
export class PermissionMap extends Component {
  static propTypes = {
    intl: intlShape,
  };
  static defaultProps = {
    intl: {},
  };
  generateTableCells = (permission) =>
    PERMISSION_ROLES.map((role) => {
      if (role === 'MEMBER' || role === 'CUSTOMER') {
        if (PERMISSIONS_MAP[role][permission]) {
          if (PERMISSIONS_MAP[role][permission] === ALL) {
            return (
              <Fragment key={role}>
                <td className={cx('col', 'has-permission')}>
                  <i className={cx('rp-icons', 'rp-icons-check')} />
                </td>
                <td className={cx('col', 'has-permission')}>
                  <i className={cx('rp-icons', 'rp-icons-check')} />
                </td>
              </Fragment>
            );
          }
          return (
            <Fragment key={role}>
              <td className={cx('col', 'has-permission')}>
                <i className={cx('rp-icons', 'rp-icons-check')} />
              </td>
              <td className={cx('col')} />
            </Fragment>
          );
        }
        return (
          <Fragment key={role}>
            <td className={cx('col')} />
            <td className={cx('col')} />
          </Fragment>
        );
      }
      if (PERMISSIONS_MAP[role][permission]) {
        return (
          <td className={cx('col', 'has-permission')}>
            <i className={cx('rp-icons', 'rp-icons-check')} />
          </td>
        );
      }
      return <td key={role} className={cx('col')} />;
    });
  generateTableRows = () => {
    const keys = Object.keys(PermissionsName);
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
