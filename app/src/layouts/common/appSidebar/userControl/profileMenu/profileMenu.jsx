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
import { useDispatch } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { USER_PROFILE_PAGE } from 'controllers/pages';
import { logoutAction } from 'controllers/auth';
import { NavLink } from 'components/main/navLink';
import LogoutIcon from './img/log-out-inline.svg';
import MyProfileIcon from './img/my-profile-inline.svg';
import styles from './profileMenu.scss';

const cx = classNames.bind(styles);

export const ProfileMenu = ({ closePopover, closeSidebar }) => {
  const dispatch = useDispatch();

  const onClickLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <>
      <NavLink
        to={{
          type: USER_PROFILE_PAGE,
        }}
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
      <div className={cx('menu-item')} onClick={onClickLogout}>
        {Parser(LogoutIcon)}
        <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Log out'} />
      </div>
    </>
  );
};

ProfileMenu.propTypes = {
  closePopover: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
};
