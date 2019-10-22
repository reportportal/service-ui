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
