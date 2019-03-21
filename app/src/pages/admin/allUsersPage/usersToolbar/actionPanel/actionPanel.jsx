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
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { activeProjectSelector } from 'controllers/user';
import { fetchMembersAction } from 'controllers/members';
import { fetch } from 'common/utils';

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
});

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    showModalAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    fetchMembersAction,
  },
)
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showScreenLockAction: PropTypes.func,
    activeProject: PropTypes.string,
    showNotification: PropTypes.func,
    fetchMembersAction: PropTypes.func,
    hideScreenLockAction: PropTypes.func,
    showModalAction: PropTypes.func,
  };
  static defaultProps = {
    showScreenLockAction: () => {},
    activeProject: '',
    showNotification: () => {},
    fetchMembersAction: () => {},
    hideScreenLockAction: () => {},
    showModalAction: () => {},
  };
  onExportUsers = () => {
    window.location.href = URLS.exportUsers();
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
          this.props.fetchMembersAction();
          this.props.hideScreenLockAction();
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.showNotification({ message: err.msg, type: NOTIFICATION_TYPES.ERROR });
          this.props.fetchMembersAction();
          this.props.hideScreenLockAction();
          return err;
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
        this.props.fetchMembersAction();
      })
      .catch((err) => {
        this.props.showNotification({ message: err.msg, type: NOTIFICATION_TYPES.ERROR });
        this.props.fetchMembersAction();
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
        grayBorder: false,
        onClick: this.showInviteUserModal,
      },
      {
        key: ADD_USER,
        icon: AddUserIcon,
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
