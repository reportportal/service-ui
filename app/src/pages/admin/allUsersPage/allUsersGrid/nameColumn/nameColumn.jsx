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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { userIdSelector, activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { fetchAllUsersAction } from 'controllers/administrate/allUsers';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './nameColumn.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  youLabel: { id: 'NameColumn.youLabel', defaultMessage: 'you' },
  adminLabel: { id: 'NameColumn.adminLabel', defaultMessage: 'admin' },
  makeAdminLabel: { id: 'NameColumn.makeAdminLabel', defaultMessage: 'make admin' },
  changeAccountRoleNotification: {
    id: 'NameColumn.changeAccountRoleNotification',
    defaultMessage: "User role for ''{name}'' was changed.",
  },
});

@connect(
  (state) => ({
    currentUser: userIdSelector(state),
    activeProject: activeProjectSelector(state),
  }),
  {
    showModal: showModalAction,
    fetchAllUsers: fetchAllUsersAction,
    showNotification,
  },
)
@injectIntl
@track()
export class NameColumn extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showNotification: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    currentUser: PropTypes.string,
    activeProject: PropTypes.string,
    showModal: PropTypes.func,
    fetchAllUsers: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    value: {},
    currentUser: '',
    activeProject: '',
    showModal: () => {},
    fetchAllUsers: () => {},
  };

  onChangeAccountRole = () => {
    const { intl, showModal, value, fetchAllUsers } = this.props;
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.MAKE_ADMIN_BTN);
    const onSubmit = () => {
      fetch(URLS.userInfo(value.userId), {
        method: 'PUT',
        data: {
          role: value.userRole === ADMINISTRATOR ? USER : ADMINISTRATOR,
        },
      }).then(() => {
        fetchAllUsers();
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: intl.formatMessage(messages.changeAccountRoleNotification, {
            name: value.fullName,
          }),
        });
      });
    };

    showModal({
      id: 'allUsersChangeProjectRoleModal',
      data: {
        name: value.fullName,
        onSubmit,
        eventsInfo: {
          changeBtn: ADMIN_ALL_USERS_PAGE_EVENTS.CHANGE_BTN_CHANGE_ROLE_MODAL,
          closeIcon: ADMIN_ALL_USERS_PAGE_EVENTS.CLOSE_ICON_CHANGE_ROLE_MODAL,
          cancelBtn: ADMIN_ALL_USERS_PAGE_EVENTS.CANCEL_BTN_CHANGE_ROLE_MODAL,
        },
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      activeProject,
      value,
      className,
      currentUser,
    } = this.props;

    return (
      <div className={cx('name-col', className)}>
        <UserAvatar
          className={cx('avatar-wrapper')}
          projectId={activeProject}
          userId={value.userId}
        />
        <span className={cx('name')} title={value.fullName}>
          {value.fullName}
        </span>
        {value.userId === currentUser && (
          <span className={cx('label', 'you-label')}>{formatMessage(messages.youLabel)}</span>
        )}
        {value.userRole === ADMINISTRATOR ? (
          <span
            className={cx('label', 'admin-label')}
            onClick={value.userId !== currentUser ? this.onChangeAccountRole : undefined}
          >
            {formatMessage(messages.adminLabel)}
          </span>
        ) : (
          <span className={cx('label', 'make-admin-label')} onClick={this.onChangeAccountRole}>
            {formatMessage(messages.makeAdminLabel)}
          </span>
        )}
      </div>
    );
  }
}
