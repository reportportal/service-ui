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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { Navbar } from './navbar';
import { SidebarButton } from './sidebarButton';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);
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

  const sidebarRef = useRef(null);

  const onOpenNavbar = () => {
    setIsOpenNavbar(true);
  };

  const onCloseSidebar = () => {
    if (!isOpenNavbarPopover) {
      setIsOpenNavbar(false);
    }
  };

  const onCloseNavbar = () => {
    setIsOpenNavbar(false);
  };

  const onButtonClick = (onClick) => {
    onClick();
    onCloseNavbar();
  };

  const setHoverType = (key) => {
    setActionButtonKey(key);
    setActionButtonType(HOVER);
  };

  const setActiveType = (key) => {
    setActionButtonKey(key);
    setActionButtonType(ACTIVE);
  };

  const clearActionButton = () => {
    setActionButtonKey(null);
    setActionButtonType(null);
  };

  const getClassName = (key) => {
    const isAction = actionButtonKey === key;

    return cx({
      hover: isAction && actionButtonType === HOVER,
      active: isAction && actionButtonType === ACTIVE,
    });
  };

  return (
    <div
      ref={sidebarRef}
      className={cx('sidebar-container')}
      onMouseEnter={onOpenNavbar}
      onMouseLeave={onCloseSidebar}
    >
      <aside className={cx('sidebar')}>
        <div className={cx('logo')}>
          <i>{Parser(logoBlockIcon)}</i>
        </div>
        <div className={cx('main-block')}>{createMainBlock(onOpenNavbar)}</div>
        {topSidebarItems.length > 0 && (
          <div className={cx('top-block')}>
            {topSidebarItems.map(({ key, topSidebarItem, onClick }) => (
              <SidebarButton
                key={key}
                onClick={() => onButtonClick(onClick)}
                className={cx('sidebar-btn', getClassName(key))}
                onMouseEnter={() => setHoverType(key)}
                onMouseLeave={clearActionButton}
                onMouseDown={() => setActiveType(key)}
              >
                {topSidebarItem}
              </SidebarButton>
            ))}
          </div>
        )}
        {bottomSidebarItems.length > 0 && (
          <div className={cx('bottom-block')}>
            {bottomSidebarItems.map(({ key, bottomSidebarItem, onClick }) => (
              <SidebarButton
                key={key}
                onClick={() => onButtonClick(onClick)}
                className={cx('sidebar-btn', getClassName(key))}
                onMouseEnter={() => setHoverType(key)}
                onMouseLeave={clearActionButton}
                onMouseDown={() => setActiveType(key)}
              >
                {bottomSidebarItem}
              </SidebarButton>
            ))}
          </div>
        )}
        <div className={cx('footer-block')}>{createFooterBlock(onOpenNavbar)}</div>
      </aside>
      <Navbar
        active={isOpenNavbar}
        onCloseNavbar={onCloseNavbar}
        setIsOpenPopover={setIsOpenNavbarPopover}
        getClassName={getClassName}
        setHoverType={setHoverType}
        clearActionButton={clearActionButton}
        setActiveType={setActiveType}
        sidebarRef={sidebarRef}
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
