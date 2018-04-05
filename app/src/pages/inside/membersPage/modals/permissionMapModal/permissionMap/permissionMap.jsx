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
  generateTableCells = (criteria) =>
    criteria.permissions.map((item) => {
      if (item) {
        return (
          <td key={Math.random()} className={cx('td', 'has-permission')}>
            <i className={cx('rp-icons', 'rp-icons-check')} />
          </td>
        );
      }
      return <td key={Math.random()} className={cx('td')} />;
    });
  generateTableRows = () => {
    const keys = Object.keys(PermissionsConfig);
    return keys.map((key, i) => {
      const criteria = PermissionsConfig[key];
      const even = i % 2 === 0;
      return (
        <tr key={key} className={cx('tr', { even })}>
          <td className={cx('td', 'horizontal-header')}>
            {this.props.intl.formatMessage(PermissionsName[key])}
            {criteria.attention && <span className={cx('attention')}>*</span>}
          </td>
          {this.generateTableCells(criteria)}
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
              <th rowSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.role)}
              </th>
              <th rowSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.admin)}
              </th>
              <th rowSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.manager)}
              </th>
              <th colSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.member)}
              </th>
              <th rowSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.operator)}
              </th>
              <th colSpan="2" className={cx('th', 'roles-th')}>
                {intl.formatMessage(PermissionsName.customer)}
              </th>
            </tr>
            <tr>
              <th className={cx('th', 'roles-th')}>{intl.formatMessage(PermissionsName.owner)}</th>
              <th className={cx('th', 'roles-th')}>{intl.formatMessage(PermissionsName.notOwner)}</th>
              <th className={cx('th', 'roles-th')}>{intl.formatMessage(PermissionsName.owner)}</th>
              <th className={cx('th', 'roles-th')}>{intl.formatMessage(PermissionsName.notOwner)}</th>
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
