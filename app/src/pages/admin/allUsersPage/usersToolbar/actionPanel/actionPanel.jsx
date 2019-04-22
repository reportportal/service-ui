import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import InviteUserIcon from 'common/img/invite-inline.svg';
import AddUserIcon from 'common/img/add-user-inline.svg';
import { URLS } from 'common/urls';
import { showModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { activeProjectSelector } from 'controllers/user';
import {
  fetchAllUsersAction,
  allUsersSelector,
  querySelector,
} from 'controllers/administrate/allUsers';
import { fetch } from 'common/utils';
import { INTERNAL } from 'common/constants/accountType';
import { collectFilterEntities } from 'components/filterEntities/containers/utils';

import { EXPORT, INVITE_USER, ADD_USER } from './constants';

import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [EXPORT]: {
    id: 'AllUsersPage.export',
    defaultMessage: 'Export',
  },
  [INVITE_USER]: {
    id: 'AllUsersPage.inviteUser',
    defaultMessage: 'Invite user',
  },
  [ADD_USER]: {
    id: 'AllUsersPage.AddUser',
    defaultMessage: 'Add user',
  },
  inviteExternalMember: {
    id: 'MembersPage.inviteExternalMember',
    defaultMessage:
      'Invite for member is successfully registered. Confirmation info will be send on provided email. Expiration: 1 day.',
  },
  addUserSuccessNotification: {
    id: 'ActionPanel.addUserNotification',
    defaultMessage: 'New account has been created successfully',
  },
  memberWasInvited: {
    id: 'MembersPage.memberWasInvited',
    defaultMessage: "Member '<b>{name}</b>' has assigned to the project",
  },
});

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    users: allUsersSelector(state),
    filterEnities: collectFilterEntities(querySelector(state)),
  }),
  {
    showModalAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    showDefaultErrorNotification,
    fetchAllUsersAction,
  },
)
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    users: PropTypes.arrayOf(PropTypes.object),
    activeProject: PropTypes.string,
    filterEnities: PropTypes.object,
    showScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchAllUsersAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activeProject: '',
    users: [],
    filterEnities: {},
  };

  onExportUsers = () => {
    window.location.href = URLS.exportUsers(this.props.filterEnities);
  };

  showAddUserModal = () =>
    this.props.showModalAction({
      id: 'allUsersAddUserModal',
      data: {
        onSubmit: this.addUser,
      },
    });

  addUser = (values) => {
    fetch(URLS.user(), {
      method: 'post',
      data: {
        accountRole: values.accountRole,
        accountType: INTERNAL,
        defaultProject: values.defaultProject,
        email: values.email,
        fullName: values.fullName,
        login: values.login,
        password: values.password,
        projectRole: values.projectRole,
      },
    })
      .then(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: this.props.intl.formatMessage(messages.addUserSuccessNotification),
        });
      })
      .catch(this.props.showDefaultErrorNotification);
  };

  inviteUser = (userData) => {
    const data = {};
    if (userData.user.externalUser) {
      this.props.showScreenLockAction();

      data.defaultProject = userData.project || this.props.activeProject;
      data.email = userData.user.userLogin;
      data.role = userData.role;
      return fetch(URLS.userInviteExternal(), {
        method: 'post',
        data,
      })
        .then((res) => {
          this.props.showNotification({
            message: this.props.intl.formatMessage(messages.inviteExternalMember),
            type: NOTIFICATION_TYPES.SUCCESS,
          });
          this.props.fetchAllUsersAction();
          this.props.hideScreenLockAction();
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.showDefaultErrorNotification(err);
          this.props.fetchAllUsersAction();
          this.props.hideScreenLockAction();
          return {
            errorOccurred: true,
            ...err,
          };
        });
    }
    data.userNames = {
      [userData.user.userLogin]: userData.role,
    };

    return fetch(URLS.userInviteInternal(userData.project), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.memberWasInvited, {
            name: userData.user.userLogin,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchAllUsersAction();
      })
      .catch((err) => {
        this.props.showDefaultErrorNotification(err);
        this.props.fetchAllUsersAction();
        return {
          errorOccurred: true,
          ...err,
        };
      });
  };

  showInviteUserModal = () => {
    this.props.showModalAction({
      id: 'inviteUserModal',
      data: { onInvite: this.inviteUser, isProjectSelector: true },
    });
  };

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const ACTION_BUTTONS = [
      {
        key: EXPORT,
        icon: ExportIcon,
        onClick: this.onExportUsers,
      },
      {
        key: INVITE_USER,
        icon: InviteUserIcon,
        onClick: this.showInviteUserModal,
      },
      {
        key: ADD_USER,
        icon: AddUserIcon,
        onClick: this.showAddUserModal,
      },
    ];
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, onClick }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton icon={icon} onClick={onClick}>
              {formatMessage(messages[key])}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  };

  render() {
    return this.renderHeaderButtons();
  }
}
