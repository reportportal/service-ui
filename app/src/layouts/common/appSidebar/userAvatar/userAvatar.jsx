/*
 * Copyright 2024 EPAM Systems
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
import { Image } from 'components/main/image';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { photoTimeStampSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { useSelector } from 'react-redux';
import styles from './userAvatar.scss';

const cx = classNames.bind(styles);

export const UserAvatar = ({ onClick, onHoverUser, onClearUser }) => {
  const photoTimeStamp = useSelector(photoTimeStampSelector);

  return (
    <button
      className={cx('avatar-block')}
      onClick={onClick}
      onMouseEnter={onHoverUser}
      onMouseLeave={onClearUser}
    >
      <Image
        className={cx('avatar-img')}
        src={URLS.dataPhoto(photoTimeStamp, true)}
        alt="avatar"
        fallback={DefaultUserImage}
      />
    </button>
  );
};

UserAvatar.propTypes = {
  onClick: PropTypes.func.isRequired,
  onHoverUser: PropTypes.func.isRequired,
  onClearUser: PropTypes.func.isRequired,
};
