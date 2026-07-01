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

import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL, UPSA } from 'common/constants/accountType';
import { EPAM } from 'common/constants/pluginNames';
import { DEFAULT_USER_ID } from 'common/constants/accountRoles';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { photoTimeStampSelector, userInfoSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { isDemoInstanceSelector } from 'controllers/appInfo';
import { isEpamPluginEnabledSelector } from 'controllers/plugins';
import { COMMAND_SYNCHRONIZE } from 'controllers/plugins/uiExtensions/constants';
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

export const PersonalInfoBlock = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { userId: userLogin, id: userId, accountType } = useSelector(userInfoSelector);
  const isDemoInstance = useSelector(isDemoInstanceSelector);
  const photoTimeStamp = useSelector(photoTimeStampSelector);
  const isEpamAuthEnabled = useSelector(isEpamPluginEnabledSelector);
  const [forceUpdateInProgress, setForceUpdateInProgress] = useState(false);
  const [avatarPreviewSource, setAvatarPreviewSource] = useState(null);

  const changePasswordHandler = (data) => {
    return fetch(URLS.userChangePassword(), {
      method: 'post',
      data: { oldPassword: data.oldPassword, newPassword: data.newPassword },
    })
      .then(() => {
        dispatch(showSuccessNotification({ message: formatMessage(messages.passwordChanged) }));
      })
      .catch((error) => {
        dispatch(showErrorNotification({ message: error.message }));
        throw error;
      });
  };

  const onChangePassword = () => {
    dispatch(
      showModalAction({
        id: 'changePasswordModal',
        data: { onChangePassword: changePasswordHandler },
      }),
    );
  };

  const onForceUpdate = () => {
    dispatch(showSuccessNotification({ message: formatMessage(messages.synchronizeInProgress) }));
    setForceUpdateInProgress(true);
    fetch(URLS.pluginsCommandsCommon(EPAM, COMMAND_SYNCHRONIZE), {
      method: 'post',
      data: {
        arguments: { userId },
      },
    })
      .then(() => {
        dispatch(showSuccessNotification({ message: formatMessage(messages.synchronize) }));
        dispatch(
          showModalAction({
            id: 'forceUpdateModal',
            data: { onForceUpdate: () => dispatch(logoutAction()) },
          }),
        );
      })
      .catch(() => {
        dispatch(showErrorNotification({ message: formatMessage(messages.synchronizeError) }));
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
  const isForceUpdateVisible = accountType === UPSA && isEpamAuthEnabled;

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
                  title={isChangePasswordDisabled && formatMessage(messages.disabledChangePassword)}
                >
                  {formatMessage(messages.changePassword)}
                </GhostButton>
              </div>
            )}
            {isForceUpdateVisible && (
              <div className={cx('top-btn')}>
                <GhostButton disabled={forceUpdateInProgress} onClick={onForceUpdate}>
                  {forceUpdateInProgress
                    ? formatMessage(messages.inProgress)
                    : formatMessage(messages.forceUpdate)}
                </GhostButton>
              </div>
            )}
          </div>
        </div>
      </BlockContainerBody>
    </div>
  );
};
