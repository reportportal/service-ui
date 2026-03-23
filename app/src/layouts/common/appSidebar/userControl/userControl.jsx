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

import { Popover } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { userInfoSelector, photoTimeStampSelector } from 'controllers/user';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { ProfileMenu } from './profileMenu';
import ArrowRightIcon from '../img/arrow-right-inline.svg';
import styles from './userControl.scss';

const cx = classNames.bind(styles);

const UserControl = ({ onClick }) => {
  const { userRole, fullName, email, id } = useSelector(userInfoSelector);
  const photoTimeStamp = useSelector(photoTimeStampSelector);

  return (
    <button className={cx('user-block-wrapper')} onClick={onClick} tabIndex={0}>
      <button className={cx('avatar-block')}>
        <UserAvatar
          className={cx('user-avatar')}
          userId={id}
          timestamp={photoTimeStamp}
          thumbnail
        />
      </button>
      <div className={cx('user-control')}>
        <div className={cx('user-details')}>
          <div className={cx('username-wrapper')}>
            <div className={cx('username')}>{fullName}</div>
            <div className={cx('arrow-icon')}>
              {/* TODO: Need to manage this permission via common permission engine */}
              {userRole === ADMINISTRATOR && (
                <div className={cx('admin-badge')}>
                  <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
                </div>
              )}
              {Parser(ArrowRightIcon)}
            </div>
          </div>
          <div className={cx('user-email')}>{email}</div>
        </div>
      </div>
    </button>
  );
};

UserControl.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export const UserControlWithPopover = ({
  linkToUserProfilePage,
  isOpenPopover,
  closeSidebar,
  onClick,
  togglePopover,
}) => {
  const closePopover = () => {
    togglePopover(false);
  };
  return (
    <div className={cx('popover-control')}>
      <Popover
        className={cx('popover')}
        placement="right"
        isOpened={isOpenPopover}
        setIsOpened={togglePopover}
        content={
          <ProfileMenu
            linkToUserProfilePage={linkToUserProfilePage}
            closePopover={closePopover}
            closeSidebar={closeSidebar}
          />
        }
      >
        <UserControl onClick={onClick} />
      </Popover>
    </div>
  );
};

UserControlWithPopover.propTypes = {
  linkToUserProfilePage: PropTypes.object.isRequired,
  isOpenPopover: PropTypes.bool.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  togglePopover: PropTypes.func.isRequired,
};
