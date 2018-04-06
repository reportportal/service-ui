import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import styles from './permissionMap.scss';
import { PermissionsName } from './permissionsName';
import { PermissionsConfig } from './permissionsConfig';

const cx = classNames.bind(styles);

@injectIntl
export class PermissionMap extends Component {
  static propTypes = {
    intl: intlShape,
  };
  static defaultProps = {
    intl: {},
  };
  generateTableCells = (permissions) =>
    Object.keys(permissions).map((key) => {
      if (permissions[key]) {
        return (
          <td key={key} className={cx('col', 'has-permission')}>
            <i className={cx('rp-icons', 'rp-icons-check')} />
          </td>
        );
      }
      return <td key={key} className={cx('col')} />;
    });
  generateTableRows = () => {
    const keys = Object.keys(PermissionsConfig);
    return keys.map((key) => {
      const criteria = PermissionsConfig[key];
      return (
        <tr key={key} className={cx('row')}>
          <td className={cx('col', 'horizontal-header')}>
            {this.props.intl.formatMessage(PermissionsName[key])}
            {criteria.attention && <span className={cx('attention')}>*</span>}
          </td>
          {this.generateTableCells(criteria.permissions)}
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
                {intl.formatMessage(PermissionsName.role)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.admin)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.manager)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.member)}
              </th>
              <th rowSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.operator)}
              </th>
              <th colSpan="2" className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.customer)}
              </th>
            </tr>
            <tr>
              <th className={cx('header', 'roles-header')}>{intl.formatMessage(PermissionsName.owner)}</th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.notOwner)}
              </th>
              <th className={cx('header', 'roles-header')}>{intl.formatMessage(PermissionsName.owner)}</th>
              <th className={cx('header', 'roles-header')}>
                {intl.formatMessage(PermissionsName.notOwner)}
              </th>
            </tr>
          </thead>
          <tbody>{this.generateTableRows()}</tbody>
        </table>
        <div className={cx('permission-attention')}>
          <span className={cx('attention')}>*</span>
          <span>{intl.formatMessage(PermissionsName.oneAttention)}</span>
        </div>
      </div>
    );
  }
}
