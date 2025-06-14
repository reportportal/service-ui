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

import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL, LDAP, UPSA } from 'common/constants/accountType';
import { DEFAULT_USER_ID } from 'common/constants/accountRoles';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { isDemoInstanceSelector } from 'controllers/appInfo';
import { GhostButton } from 'components/buttons/ghostButton';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { Image } from 'components/main/image';
import styles from './personalInfoBlock.scss';
import { BlockContainerBody } from '../blockContainer';
import { PhotoControls } from './photoControls';
import { UserInfo } from './userInfo/userInfo';

const cx = classNames.bind(styles);

const messages = defineMessages({
  changePassword: {
    id: 'PersonalInfoBlock.changePassword',
    defaultMessage: 'Change Password',
  },
  passwordChanged: {
    id: 'PersonalInfoBlock.passwordChanged',
    defaultMessage: 'Your password has been changed successfully',
  },
  errorChangePassword: {
    id: 'PersonalInfoBlock.errorChangePassword',
    defaultMessage: "Error! Can't change password.",
  },
  forceUpdate: {
    id: 'PersonalInfoBlock.forceUpdate',
    defaultMessage: 'Force Update',
  },
  synchronize: {
    id: 'PersonalInfoBlock.synchronize',
    defaultMessage: 'User info successfully synchronized',
  },
  synchronizeError: {
    id: 'PersonalInfoBlock.synchronizeError',
    defaultMessage: "Can't synchronize profile!",
  },
  synchronizeInProgress: {
    id: 'PersonalInfoBlock.synchronizeInProgress',
    defaultMessage: 'Force update is in progress',
  },
  inProgress: {
    id: 'PersonalInfoBlock.inProgress',
    defaultMessage: 'In progress',
  },
  disabledChangePassword: {
    id: 'PersonalInfoBlock.disabledChangePassword',
    defaultMessage: "It's forbidden to change password for default user on Demo instance",
  },
});

@connect(
  (state) => ({
    userLogin: userInfoSelector(state).userId,
    userId: userInfoSelector(state).id,
    accountType: userInfoSelector(state).accountType,
    isDemoInstance: isDemoInstanceSelector(state),
  }),
  {
    showNotification,
    showModalAction,
    logoutAction,
  },
)
@injectIntl
@track()
export class PersonalInfoBlock extends Component {
  static propTypes = {
    userLogin: PropTypes.string,
    userId: PropTypes.number,
    accountType: PropTypes.string,
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    logoutAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    isDemoInstance: PropTypes.bool,
  };
  static defaultProps = {
    userLogin: '',
    userId: null,
    accountType: '',
    isDemoInstance: false,
  };

  state = {
    avatarSource: URLS.userAvatar(this.props.userId, false),
    forceUpdateInProgress: false,
  };

  onChangePassword = () => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.CHANGE_PASSWORD_CLICK);
    this.props.showModalAction({
      id: 'changePasswordModal',
      data: { onChangePassword: this.changePasswordHandler },
    });
  };

  onForceUpdate = () => {
    const { accountType = '', intl } = this.props;
    this.props.showNotification({
      message: intl.formatMessage(messages.synchronizeInProgress),
      type: NOTIFICATION_TYPES.SUCCESS,
    });
    this.setState({ forceUpdateInProgress: true });
    fetch(URLS.userSynchronize(this.getUserSyncType(accountType)), { method: 'post' })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.synchronize),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.showModalAction({
          id: 'forceUpdateModal',
          data: { onForceUpdate: this.props.logoutAction },
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.synchronizeError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      })
      .finally(() => {
        this.setState({ forceUpdateInProgress: false });
      });
  };

  getUserSyncType = (accountType) => {
    if (accountType === UPSA) {
      return 'epam';
    }
    return accountType.toLowerCase();
  };

  changePasswordHandler = (data) => {
    fetch(URLS.userChangePassword(), {
      method: 'post',
      data: { oldPassword: data.oldPassword, newPassword: data.newPassword },
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.passwordChanged),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((error) => {
        this.props.showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  uploadNewImage = (image) => {
    this.setState({ avatarSource: image });
  };

  removeImage = () => {
    this.setState({ avatarSource: URLS.dataPhoto(this.props.userId, Date.now()) });
  };

  render() {
    const { intl, accountType, userLogin, isDemoInstance, userId } = this.props;
    const { forceUpdateInProgress } = this.state;
    const isDefaultUser = userLogin === DEFAULT_USER_ID;
    const isChangePasswordDisabled = isDemoInstance && isDefaultUser;

    return (
      <div className={cx('personal-info-block')}>
        <BlockContainerBody>
          <div className={cx('block-content')}>
            <div className={cx('avatar-wrapper')}>
              <Image
                className={cx('avatar')}
                src={this.state.avatarSource}
                alt="Profile avatar"
                fallback={DefaultUserImage}
                preloaderColor="charcoal"
              />
            </div>
            <div className={cx('info')}>
              <UserInfo accountType={accountType} userId={userLogin} />
              {accountType === INTERNAL && (
                <PhotoControls
                  accountType={accountType}
                  uploadNewImage={this.uploadNewImage}
                  removeImage={this.removeImage}
                  userId={userId}
                />
              )}
              {accountType === INTERNAL && (
                <div className={cx('top-btn')}>
                  <GhostButton
                    onClick={this.onChangePassword}
                    disabled={isChangePasswordDisabled}
                    title={
                      isChangePasswordDisabled &&
                      intl.formatMessage(messages.disabledChangePassword)
                    }
                  >
                    {intl.formatMessage(messages.changePassword)}
                  </GhostButton>
                </div>
              )}
              {accountType !== INTERNAL && accountType !== LDAP && (
                <div className={cx('top-btn')}>
                  <GhostButton disabled={forceUpdateInProgress} onClick={this.onForceUpdate}>
                    {forceUpdateInProgress
                      ? intl.formatMessage(messages.inProgress)
                      : intl.formatMessage(messages.forceUpdate)}
                  </GhostButton>
                </div>
              )}
            </div>
          </div>
        </BlockContainerBody>
      </div>
    );
  }
}
