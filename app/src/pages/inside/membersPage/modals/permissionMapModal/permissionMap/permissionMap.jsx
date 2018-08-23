import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { PROJECT_MANAGER, OPERATOR, CUSTOMER, MEMBER } from 'common/constants/projectRoles';
import { ALL } from 'common/constants/permissions';
import { PERMISSIONS_MAP } from './permissions';
import { PERMISSION_NAMES, ROLE_NAMES, PERMISSION_CATEGORIES } from './permissionsName';
import styles from './permissionMap.scss';

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
    const { intl } = this.props;
    const roles = [PROJECT_MANAGER, MEMBER, OPERATOR, CUSTOMER];
    const ownerPermission = (
      <div title={intl.formatMessage(ROLE_NAMES.ownTitle)} className={cx('owner-permission')} />
    );
    const notOwnerPermission = (
      <div
        title={intl.formatMessage(ROLE_NAMES.notOwnTitle)}
        className={cx('not-owner-permission')}
      />
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

  generateTableRows = () => {
    const categories = Object.keys(PERMISSION_NAMES);

    return categories.map((categoryKey) => {
      const currentCategoryActions = PERMISSION_NAMES[categoryKey];
      const categoryActionsKeys = Object.keys(currentCategoryActions);

      return (
        <Fragment key={categoryKey}>
          <tr className={cx('category-row')}>
            <td className={cx('category-header')}>
              {this.props.intl.formatMessage(PERMISSION_CATEGORIES[categoryKey])}
            </td>
            <td colSpan="4" />
          </tr>
          {categoryActionsKeys.map((actionKey) => (
            <tr key={actionKey} className={cx('row')}>
              <td className={cx('horizontal-header')}>
                {this.props.intl.formatMessage(currentCategoryActions[actionKey])}
              </td>
              {this.generateTableCells(actionKey)}
            </tr>
          ))}
        </Fragment>
      );
    });
  };

  render() {
    const { intl } = this.props;
    return (
      <div className={cx('container')}>
        <table>
          <thead>
            <tr>
              <th className={cx('roles-header')}>{intl.formatMessage(ROLE_NAMES.role)}</th>
              <th className={cx('header')}>{intl.formatMessage(ROLE_NAMES.manager)}</th>
              <th className={cx('header')}>{intl.formatMessage(ROLE_NAMES.member)}</th>
              <th className={cx('header')}>{intl.formatMessage(ROLE_NAMES.operator)}</th>
              <th className={cx('header')}>{intl.formatMessage(ROLE_NAMES.customer)}</th>
            </tr>
          </thead>
          <tbody>{this.generateTableRows()}</tbody>
        </table>
        <div className={cx('permission-attention')}>
          <div className={cx('legend-block')}>
            <span className={cx('legend-item')}>
              <span className={cx('owner-permission')} />
              <span className={cx('legend-text')}>{intl.formatMessage(ROLE_NAMES.ownLegend)}</span>
            </span>
            <span className={cx('legend-item')}>
              <span className={cx('not-owner-permission')} />
              <span className={cx('legend-text')}>
                {intl.formatMessage(ROLE_NAMES.notOwnLegend)}
              </span>
            </span>
          </div>
          <span className={cx('attention-text')}>{intl.formatMessage(ROLE_NAMES.attention)}</span>
        </div>
      </div>
    );
  }
}
