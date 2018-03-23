import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import styles from './permissionMap.scss';
import { Permissions } from './permissions';

const cx = classNames.bind(styles);

@injectIntl
export class PermissionMap extends Component {
  static propTypes = {
    intl: intlShape,
  };
  static defaultProps = {
    intl: {},
  };
  okClickHandler = (closeModal) => {
    setTimeout(() => closeModal(), 1000);
  };
  render() {
    const { intl } = this.props;
    return (
      <div className={cx('container')}>
        <table className="table-permissions">
          <thead>
          <tr>
            <th rowSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.role)}</th>
            <th rowSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.admin)}</th>
            <th rowSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.manager)}</th>
            <th colSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.member)}</th>
            <th rowSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.operator)}</th>
            <th colSpan="2" className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.customer)}</th>
          </tr>
          <tr>
            <th className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.owner)}</th>
            <th className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.notOwner)}</th>
            <th className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.owner)}</th>
            <th className={cx('th', 'roles-th')}>{intl.formatMessage(Permissions.notOwner)}</th>
          </tr>
          </thead>
          <tbody>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.accessToManagementSystem)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.createProject)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.deleteProject)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.updateSettings)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.seeSettings)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}><i className={cx('rp-icons', 'rp-icons-check')} /></td>
            <td className={cx('td', 'has-permission')}><i className={cx('rp-icons', 'rp-icons-check')} /></td>
            <td className={cx('td', 'has-permission')}><i className={cx('rp-icons', 'rp-icons-check')} /></td>
            <td className={cx('td', 'has-permission')}><i className={cx('rp-icons', 'rp-icons-check')} /></td>
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.createInternalUser)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.inviteInternalUser)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.unSlashAssignInternalUser)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.changeUserRole)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.delUser)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.seeMembers)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.editOwnAccount1)}<span className={cx('attention')}>*</span></td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.deleteLaunch)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.forceFinishLaunch)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.startAnalysis)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.deleteTestItem)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.moveToDebug)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td')} />
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.mergeLaunches)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
            <td className={cx('td')} />
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td')} />
          </tr>
          <tr className={cx('tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.workWithFiltersEtc)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
          </tr>
          <tr className={cx('even', 'tr')}>
            <td className={cx('td', 'horizontal-header')}>{intl.formatMessage(Permissions.readData)}</td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
            <td className={cx('td', 'has-permission')}>
              <i className={cx('rp-icons', 'rp-icons-check')} />
            </td>
          </tr>
          </tbody>
        </table>
        <div className={cx('permission-attention')}>
          <span className="attention">*</span>
          <span>{intl.formatMessage(Permissions.oneAttention)}</span>
        </div>
      </div>
    );
  }
}
