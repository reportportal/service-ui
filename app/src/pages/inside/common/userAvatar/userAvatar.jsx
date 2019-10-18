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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { Image } from 'components/main/image';
import styles from './userAvatar.scss';

const cx = classNames.bind(styles);

export const UserAvatar = ({ className, projectId, userId }) => (
  <div className={cx('user-avatar', className)}>
    <Image
      className={cx('avatar')}
      src={URLS.dataUserPhoto(projectId, userId, true)}
      alt="avatar"
      fallback={DefaultUserImage}
    />
  </div>
);

UserAvatar.propTypes = {
  className: PropTypes.string,
  projectId: PropTypes.string,
  userId: PropTypes.string,
};
UserAvatar.defaultProps = {
  className: '',
  projectId: '',
  userId: '',
};
