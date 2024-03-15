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

import React, { useLayoutEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { logoutAction } from 'controllers/auth';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { SidebarButton } from 'components/buttons/sidebarButton/sidebarButton';
import { LOGIN_PAGE } from 'controllers/pages/constants';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { updateStorageItem, getStorageItem, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { activeModalSelector } from 'controllers/modal';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { useOnClickOutside } from 'common/hooks';
import { useSelector } from 'react-redux';
import { SupportBlock } from './supportBlock';
import LogoutIcon from '../img/logout-inline.svg';
import { OrganizationsBlock } from './organizationsBlock';
import { Navbar } from './navbar';
import LogoIcon from './img/logo-icon-inline.svg';
import { UserAvatar } from './userAvatar';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

export const Sidebar = ({ topSidebarItems, bottomSidebarItems }) => {
  const [onboardingOptions, setOnboardingOptions] = useState([]);
  const activeModal = useSelector(activeModalSelector)?.id || '';
  const [isOpenNavbar, setIsOpenNavbar] = useState(false);
  const asideRef = useRef(null);
  let asideTimer;

  useLayoutEffect(() => {
    const appSettings = getStorageItem(APPLICATION_SETTINGS);
    const shouldRequestOnboarding = !(appSettings && appSettings.shouldRequestOnboarding === false);
    if (shouldRequestOnboarding) {
      fetch(URLS.onboarding())
        .then((res) => {
          if (Array.isArray(res)) {
            setOnboardingOptions(res.map(({ problem, link }) => ({ label: problem, value: link })));
          } else if (res === -1) {
            updateStorageItem(APPLICATION_SETTINGS, { shouldRequestOnboarding: false });
          }
        })
        .catch(({ message }) => {
          showNotification({
            type: NOTIFICATION_TYPES.ERROR,
            message,
          });
        });
    }
  }, []);

  const handleClickOutside = () => {
    if (isOpenNavbar && !activeModal) {
      setIsOpenNavbar(false);
    }
  };

  useOnClickOutside(asideRef, handleClickOutside);

  const onMouseEnter = () => {
    asideTimer = setTimeout(() => {
      setIsOpenNavbar(true);
    }, 500);
  };

  const onMouseLeave = () => {
    clearTimeout(asideTimer);
  };

  return (
    <div className={cx('sidebar-container')} ref={asideRef}>
      <aside className={cx('sidebar')} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div className={cx('logo')} onClick={() => setIsOpenNavbar(!isOpenNavbar)}>
          <i className={cx('btn-icon')}>{Parser(LogoIcon)}</i>
        </div>
        <OrganizationsBlock openNavbar={() => setIsOpenNavbar(true)} />
        <div className={cx('top-block')}>
          {topSidebarItems.map((item) => (
            <div
              key={item.component ? item.name : item.link.type}
              className={cx('sidebar-btn')}
              onClick={item.onClick}
            >
              {item.component || (
                <SidebarButton link={item.link} icon={item.icon}>
                  {item.message}
                </SidebarButton>
              )}
            </div>
          ))}
        </div>
        <div className={cx('bottom-block')}>
          {bottomSidebarItems.map((item) => (
            <div key={item.link.type} className={cx('sidebar-btn')} onClick={item.onClick}>
              <SidebarButton link={item.link} icon={item.icon} bottom>
                {item.message}
              </SidebarButton>
            </div>
          ))}
          <div className={cx('sidebar-btn')} onClick={logoutAction}>
            <SidebarButton link={{ type: LOGIN_PAGE }} icon={LogoutIcon} bottom>
              <FormattedMessage id={'Sidebar.logoutBtn'} defaultMessage={'Logout'} />
            </SidebarButton>
          </div>
          {onboardingOptions.length > 0 && <SupportBlock options={onboardingOptions} />}
          <UserAvatar />
        </div>
      </aside>
      <Navbar
        active={isOpenNavbar}
        topSidebarItems={topSidebarItems.filter((item) => item.message)}
        closeNavbar={() => setIsOpenNavbar(false)}
      />
    </div>
  );
};

Sidebar.propTypes = {
  topSidebarItems: PropTypes.array,
  bottomSidebarItems: PropTypes.array,
};

Sidebar.defaultProps = {
  topSidebarItems: [],
  bottomSidebarItems: [],
};
