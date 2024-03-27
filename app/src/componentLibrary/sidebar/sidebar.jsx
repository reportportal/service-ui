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

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useOnClickOutside } from 'common/hooks';
import { Navbar } from './navbar';
import { SidebarButton } from './sidebarButton';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);
const DELAY_NAVBAR_APPEARANCE = 500;
const HOVER = 'hover';
const ACTIVE = 'active';

export const Sidebar = ({
  logoBlockIcon,
  createMainBlock,
  topSidebarItems,
  bottomSidebarItems,
  createFooterBlock,
  ...navbarProps
}) => {
  const [isOpenNavbarPopover, setIsOpenNavbarPopover] = useState(false);
  const [isOpenNavbar, setIsOpenNavbar] = useState(false);

  const [actionButtonKey, setActionButtonKey] = useState(null);
  const [actionButtonType, setActionButtonType] = useState(null);

  const asideRef = useRef(null);
  let asideTimer;

  const handleClickOutside = () => {
    if (isOpenNavbar && !isOpenNavbarPopover) {
      setIsOpenNavbar(false);
    }
  };

  useOnClickOutside(asideRef, handleClickOutside);

  const onOpenSidebar = () => {
    asideTimer = setTimeout(() => {
      setIsOpenNavbar(true);
    }, DELAY_NAVBAR_APPEARANCE);
  };

  const onCloseSidebar = () => {
    clearTimeout(asideTimer);
  };

  const onCloseNavbar = () => {
    setIsOpenNavbar(false);
  };

  const onOpenNavbar = () => {
    setIsOpenNavbar(true);
  };

  const onButtonClick = (onClick) => {
    onClick();
    clearTimeout(asideTimer);
    onCloseNavbar();
  };

  const onEnterButton = (key) => {
    setActionButtonKey(key);
    setActionButtonType(HOVER);
  };

  const onLeaveButton = () => {
    setActionButtonKey(null);
    setActionButtonType(null);
  };

  const onButtonDown = (key) => {
    setActionButtonKey(key);
    setActionButtonType(ACTIVE);
  };

  const onButtonUp = () => {
    setActionButtonKey(null);
    setActionButtonType(null);
  };

  const getClassName = (key, isNavbar = false) => {
    const isAction = actionButtonKey === key;

    return cx({
      'sidebar-btn': !isNavbar,
      hover: isAction && actionButtonType === HOVER,
      active: isAction && actionButtonType === ACTIVE,
    });
  };

  return (
    <div className={cx('sidebar-container')} ref={asideRef}>
      <aside className={cx('sidebar')} onMouseEnter={onOpenSidebar} onMouseLeave={onCloseSidebar}>
        <div className={cx('logo')}>
          <i>{Parser(logoBlockIcon)}</i>
        </div>
        <div className={cx('main-block')}>{createMainBlock(onOpenNavbar)}</div>
        <div className={cx('top-block')}>
          {topSidebarItems.map(({ key, topSidebarItem, onClick }) => (
            <SidebarButton
              key={key}
              onClick={() => onButtonClick(onClick)}
              className={getClassName(key)}
              onMouseEnter={() => onEnterButton(key)}
              onMouseLeave={onLeaveButton}
              onMouseDown={() => onButtonDown(key)}
              onMouseUp={onButtonUp}
            >
              {topSidebarItem}
            </SidebarButton>
          ))}
        </div>
        <div className={cx('bottom-block')}>
          {bottomSidebarItems.map(({ key, bottomSidebarItem, onClick }) => (
            <SidebarButton
              key={key}
              onClick={() => onButtonClick(onClick)}
              className={getClassName(key)}
              onMouseEnter={() => onEnterButton(key)}
              onMouseLeave={onLeaveButton}
              onMouseDown={() => onButtonDown(key)}
              onMouseUp={onButtonUp}
            >
              {bottomSidebarItem}
            </SidebarButton>
          ))}
          <div className={cx('footer-block')}>{createFooterBlock(onOpenNavbar)}</div>
        </div>
      </aside>
      <Navbar
        active={isOpenNavbar}
        onCloseNavbar={onCloseNavbar}
        setIsOpenPopover={setIsOpenNavbarPopover}
        getClassName={getClassName}
        onEnterButton={onEnterButton}
        onLeaveButton={onLeaveButton}
        onButtonDown={onButtonDown}
        onButtonUp={onButtonUp}
        {...navbarProps}
      />
    </div>
  );
};

Sidebar.propTypes = {
  topSidebarItems: PropTypes.array,
  bottomSidebarItems: PropTypes.array,
  logoBlockIcon: PropTypes.element,
  createMainBlock: PropTypes.element,
  createFooterBlock: PropTypes.func,
};

Sidebar.defaultProps = {
  logoBlockIcon: null,
  createMainBlock: null,
  topSidebarItems: [],
  bottomSidebarItems: [],
  createFooterBlock: () => {},
};
