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
  userAccountRoleSelector,
  isAdminSelector,
  userIdSelector,
} from 'controllers/user';
import { ROLES_MAP } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';

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
    currentUser: userIdSelector(state),
    projectId: activeProjectSelector(state),
    isAdmin: isAdminSelector(state),
    canChangeRole: canChangeUserRole(
      userAccountRoleSelector(state),
      activeProjectRoleSelector(state),
    ),
  }),
  { showNotification },
)
export class ProjectRole extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    assignedProjects: PropTypes.object,
    showNotification: PropTypes.func,
    accountRole: PropTypes.string,
    projectId: PropTypes.string,
    userId: PropTypes.string,
    currentUser: PropTypes.string,
    canChangeRole: PropTypes.bool,
    isAdmin: PropTypes.bool,
  };
  static defaultProps = {
    assignedProjects: {},
    accountRole: '',
    projectId: '',
    userId: '',
    currentUser: '',
    showNotification: () => {},
    canChangeRole: false,
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
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.msg,
          type: NOTIFICATION_TYPES.ERROR,
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
        {accountRole !== ADMINISTRATOR && (
          <div className={cx('roles-list', 'mobile-hide')}>
            <InputDropdown
              value={this.state.currentRole}
              options={ROLES_MAP}
              onChange={this.onChangeRole}
              disabled={!this.props.canChangeRole || this.props.userId === this.props.currentUser}
            />
          </div>
        )}
        {accountRole === ADMINISTRATOR && (
          <div className={cx('mobile-hide', 'all-permissions')}>
            {intl.formatMessage(messages.allPermissions)}
          </div>
        )}
      </Fragment>
    );
  }
}
