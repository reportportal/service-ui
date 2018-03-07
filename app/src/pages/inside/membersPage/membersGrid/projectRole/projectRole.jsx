import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { canChangeUserRole } from 'common/utils/permissions';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  accountRoleSelector,
  isAdminSelector,
} from 'controllers/user';
import { ROLES_MAP, ADMINISTRATOR } from 'common/constants/projectRoles';
import { showNotification } from 'controllers/notification';

import styles from './projectRole.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  projectRoleMobile: { id: 'ProjectRole.mobileTitle', defaultMessage: 'Project role' },
  allPermissions: {
    id: 'ProjectRole.allPermissions',
    defaultMessage: 'Administrator has full privileges according to permission map',
  },
  updateMember: {
    id: 'ProjectRole.updateMember',
    defaultMessage: 'Member {name} has been updated',
  },
});

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    isAdmin: isAdminSelector(state),
    canChangeRole: () =>
      canChangeUserRole(accountRoleSelector(state), activeProjectRoleSelector(state)),
  }),
  { showNotification },
)
export class ProjectRole extends PureComponent {
  static propTypes = {
    assignedProjects: PropTypes.object,
    accountRole: PropTypes.string,
    projectId: PropTypes.string,
    intl: intlShape.isRequired,
    userId: PropTypes.string,
    showNotification: PropTypes.func,
    canChangeRole: PropTypes.func,
    isAdmin: PropTypes.bool,
  };
  static defaultProps = {
    assignedProjects: {},
    accountRole: '',
    projectId: '',
    userId: '',
    showNotification: () => {},
    canChangeRole: () => {},
    isAdmin: false,
  };
  state = {
    currentRole: this.getUserRole(),
  };

  onChangeRole = (val) => {
    const { intl, userId } = this.props;
    const param = {
      users: {},
    };
    param.users[this.props.userId] = val;
    this.setState({ currentRole: val });
    fetch(URLS.project(this.props.projectId), {
      method: 'put',
      data: param,
    })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.updateMember, { name: userId }),
          type: 'success',
        });
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.msg,
          type: 'error',
        });
      });
  };
  getUserRole() {
    const { assignedProjects, projectId } = this.props;
    return assignedProjects[projectId].projectRole;
  }
  render() {
    this.getUserRole();
    const { accountRole, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('mobile-title', 'mobile-show')}>
          {intl.formatMessage(messages.projectRoleMobile)}:
        </span>
        <span className={cx('current-role', 'mobile-show')}>
          {accountRole === ADMINISTRATOR
            ? intl.formatMessage(messages.allPermissions)
            : this.state.currentRole}
        </span>
        <div className={cx('roles-list', 'mobile-hide', { hide: accountRole === ADMINISTRATOR })}>
          <InputDropdown
            value={this.state.currentRole}
            options={ROLES_MAP}
            onChange={this.onChangeRole}
            disabled={!this.props.canChangeRole()}
          />
        </div>
        <div
          className={cx('mobile-hide', 'all-permissions', { hide: accountRole !== ADMINISTRATOR })}
        >
          {intl.formatMessage(messages.allPermissions)}
        </div>
      </Fragment>
    );
  }
}
