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
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL, LDAP, UPSA } from 'common/constants/accountType';
import { DEFAULT_USER_ID } from 'common/constants/accountRoles';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { photoTimeStampSelector, userInfoSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { isDemoInstanceSelector } from 'controllers/appInfo';
import { GhostButton } from 'components/buttons/ghostButton';
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

const getUserSyncType = (accountType) => {
  if (accountType === UPSA) {
    return 'epam';
  }
  return accountType.toLowerCase();
};

const PersonalInfoBlockComponent = ({
  userLogin,
  userId,
  accountType,
  intl,
  showModalAction,
  showNotification,
  logoutAction,
  isDemoInstance,
  photoTimeStamp,
}) => {
  const [forceUpdateInProgress, setForceUpdateInProgress] = useState(false);
  const [avatarPreviewSource, setAvatarPreviewSource] = useState(null);

  const changePasswordHandler = (data) => {
    return fetch(URLS.userChangePassword(), {
      method: 'post',
      data: { oldPassword: data.oldPassword, newPassword: data.newPassword },
    })
      .then(() => {
        showNotification({
          message: intl.formatMessage(messages.passwordChanged),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((error) => {
        showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
        throw error;
      });
  };

  const onChangePassword = () => {
    showModalAction({
      id: 'changePasswordModal',
      data: { onChangePassword: changePasswordHandler },
    });
  };

  const onForceUpdate = () => {
    showNotification({
      message: intl.formatMessage(messages.synchronizeInProgress),
      type: NOTIFICATION_TYPES.SUCCESS,
    });
    setForceUpdateInProgress(true);
    fetch(URLS.userSynchronize(getUserSyncType(accountType || '')), { method: 'post' })
      .then(() => {
        showNotification({
          message: intl.formatMessage(messages.synchronize),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        showModalAction({
          id: 'forceUpdateModal',
          data: { onForceUpdate: logoutAction },
        });
      })
      .catch(() => {
        showNotification({
          message: intl.formatMessage(messages.synchronizeError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      })
      .finally(() => {
        setForceUpdateInProgress(false);
      });
  };

  const uploadNewImage = (image) => {
    setAvatarPreviewSource(image);
  };

  const removeImage = () => {
    setAvatarPreviewSource(null);
  };

  const isDefaultUser = userLogin === DEFAULT_USER_ID;
  const isChangePasswordDisabled = isDemoInstance && isDefaultUser;

  return (
    <div className={cx('personal-info-block')}>
      <BlockContainerBody>
        <div className={cx('block-content')}>
          <div className={cx('avatar-wrapper')}>
            <Image
              className={cx('avatar')}
              src={avatarPreviewSource || URLS.userAvatar(userId, false, photoTimeStamp)}
              isStatic={Boolean(avatarPreviewSource)}
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
                uploadNewImage={uploadNewImage}
                removeImage={removeImage}
                userId={userId}
              />
            )}
            {accountType === INTERNAL && (
              <div className={cx('top-btn')}>
                <GhostButton
                  onClick={onChangePassword}
                  disabled={isChangePasswordDisabled}
                  title={
                    isChangePasswordDisabled && intl.formatMessage(messages.disabledChangePassword)
                  }
                >
                  {intl.formatMessage(messages.changePassword)}
                </GhostButton>
              </div>
            )}
            {accountType !== INTERNAL && accountType !== LDAP && (
              <div className={cx('top-btn')}>
                <GhostButton disabled={forceUpdateInProgress} onClick={onForceUpdate}>
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
};

PersonalInfoBlockComponent.propTypes = {
  userLogin: PropTypes.string,
  userId: PropTypes.number,
  accountType: PropTypes.string,
  intl: PropTypes.object.isRequired,
  showModalAction: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  logoutAction: PropTypes.func.isRequired,
  isDemoInstance: PropTypes.bool,
  photoTimeStamp: PropTypes.number,
};

PersonalInfoBlockComponent.defaultProps = {
  userLogin: '',
  userId: null,
  accountType: '',
  isDemoInstance: false,
  photoTimeStamp: null,
};

const mapStateToProps = (state) => ({
  userLogin: userInfoSelector(state).userId,
  userId: userInfoSelector(state).id,
  accountType: userInfoSelector(state).accountType,
  isDemoInstance: isDemoInstanceSelector(state),
  photoTimeStamp: photoTimeStampSelector(state),
});

export const PersonalInfoBlock = injectIntl(
  connect(mapStateToProps, {
    showNotification,
    showModalAction,
    logoutAction,
  })(PersonalInfoBlockComponent),
);
