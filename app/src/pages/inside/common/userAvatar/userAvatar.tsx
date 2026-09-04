/*
 * Copyright 2026 EPAM Systems
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

import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { Image } from 'components/main/image';
import { idSelector, photoTimeStampSelector } from 'controllers/user';

import styles from './userAvatar.scss';

const cx = createClassnames(styles);

interface UserAvatarProps {
  userId: string | number;
  className?: string;
  imageClassName?: string;
  thumbnail?: boolean;
  timestamp?: number;
}

export const UserAvatar = ({
  userId,
  className = '',
  imageClassName = '',
  thumbnail = false,
  timestamp,
}: UserAvatarProps): ReactElement => {
  const currentUserId = useSelector(idSelector);
  const photoTimeStamp = useSelector(photoTimeStampSelector);
  const isCurrentUser = currentUserId === userId;
  const cacheBustTimestamp = timestamp ?? (thumbnail && isCurrentUser ? photoTimeStamp : undefined);
  const src = URLS.userAvatar(userId, thumbnail, cacheBustTimestamp);

  return (
    <div className={cx('user-avatar', className)}>
      <Image
        className={cx('avatar', imageClassName)}
        src={src}
        alt="avatar"
        fallback={DefaultUserImage}
        preloaderColor="charcoal"
      />
    </div>
  );
};
