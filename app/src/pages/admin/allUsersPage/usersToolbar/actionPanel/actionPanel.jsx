/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import InviteUserIcon from 'common/img/invite-inline.svg';
import AddUserIcon from 'common/img/add-user-inline.svg';
import { URLS } from 'common/urls';
import { showModalAction } from 'controllers/modal';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import {
  fetchAllUsersAction,
  allUsersSelector,
  querySelector,
} from 'controllers/administrate/allUsers';
import { fetch } from 'common/utils';
import { INTERNAL } from 'common/constants/accountType';
import { collectFilterEntities } from 'components/filterEntities/containers/utils';
import { downloadFile } from 'common/utils/downloadFile';
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
    defaultMessage: 'Invite User',
  },
  [ADD_USER]: {
    id: 'AllUsersPage.AddUser',
    defaultMessage: 'Add User',
  },
  addUserSuccessNotification: {
    id: 'ActionPanel.addUserNotification',
    defaultMessage: 'New account has been created successfully',
  },
});

@track()
@connect(
  (state) => ({
    users: allUsersSelector(state),
    filterEnities: collectFilterEntities(querySelector(state)),
  }),
  {
    showModalAction,
    showNotification,
    showDefaultErrorNotification,
    fetchAllUsersAction,
  },
)
@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    users: PropTypes.arrayOf(PropTypes.object),
    filterEnities: PropTypes.object,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchAllUsersAction: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    users: [],
    filterEnities: {},
  };

  onExportUsers = () => {
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.EXPORT_BTN);
    downloadFile(URLS.exportUsers(this.props.filterEnities));
  };

  showAddUserModal = () => {
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.ADD_USER_BTN);
    this.props.showModalAction({
      id: 'allUsersAddUserModal',
      data: {
        onSubmit: this.addUser,
      },
    });
  };

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
        this.props.fetchAllUsersAction();
      })
      .catch(this.props.showDefaultErrorNotification);
  };

  showInviteUserModal = () => {
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.INVITE_USER_BTN);
    this.props.showModalAction({
      id: 'inviteUserModal',
      data: { onInvite: this.props.fetchAllUsersAction, isProjectSelector: true },
    });
  };

  actionButtons = [
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

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('action-buttons')}>
        {this.actionButtons.map(({ key, icon, onClick }) => (
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
