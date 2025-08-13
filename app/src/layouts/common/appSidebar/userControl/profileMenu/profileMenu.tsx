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

import { useDispatch } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import { logoutAction } from 'controllers/auth';
import { NavLink } from 'components/main/navLink';
import LogoutIcon from './img/log-out-inline.svg';
import MyProfileIcon from './img/my-profile-inline.svg';
import styles from './profileMenu.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface ProfileMenuProps {
  closePopover: () => void;
  closeSidebar: () => void;
  linkToUserProfilePage: { type: string };
}

export const ProfileMenu = ({
  closePopover,
  closeSidebar,
  linkToUserProfilePage,
}: ProfileMenuProps) => {
  const dispatch = useDispatch();

  const onClickLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <>
      <NavLink
        to={linkToUserProfilePage}
        className={cx('menu-item')}
        activeClassName={cx('active')}
        onClick={() => {
          closePopover();
          closeSidebar();
        }}
      >
        {Parser(MyProfileIcon)}
        <FormattedMessage id={'UserBlock.profile'} defaultMessage={'My profile'} />
      </NavLink>
      <Button className={cx('menu-item')} onClick={onClickLogout} variant="text">
        {Parser(LogoutIcon)}
        <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Log out'} />
      </Button>
    </>
  );
};
