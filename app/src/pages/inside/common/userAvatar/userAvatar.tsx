/*
 * Copyright 2025 EPAM Systems
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

import { FC } from 'react';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { Image } from 'components/main/image';

import styles from './userAvatar.scss';

const cx = createClassnames(styles);

interface UserAvatarProps {
  userId: string | number;
  className?: string;
  thumbnail?: boolean;
  timestamp?: number;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  userId,
  className = '',
  thumbnail = false,
  timestamp,
}) => {
  const src = URLS.userAvatar(userId, thumbnail, timestamp);

  return (
    <div className={cx('user-avatar', className)}>
      <Image
        className={cx('avatar')}
        src={src}
        alt="avatar"
        fallback={DefaultUserImage}
        preloaderColor="charcoal"
      />
    </div>
  );
};
