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
import Parser from 'html-react-parser';
import { useEffect } from 'react';
import { SidebarButton } from '../sidebarButton';
import styles from './navbar.scss';

const cx = classNames.bind(styles);

export const Navbar = ({
  active,
  onCloseNavbar,
  logoControlIcon,
  createMainControlBlock,
  topSidebarControlItems,
  bottomSidebarControlItems,
  createFooterControlBlock,
  setIsOpenPopover,
  getClassName,
  setHoverType,
  clearActionButton,
  setActiveType,
  setIsImmediatelyOpenSidebar,
  isImmediatelyOpenSidebar,
  sidebarRef,
}) => {
  useEffect(() => {
    if (isImmediatelyOpenSidebar) {
      setIsImmediatelyOpenSidebar(false);
    }
  }, [isImmediatelyOpenSidebar, setIsImmediatelyOpenSidebar]);

  return (
    <div
      className={cx('navbar', {
        active,
        quickly: active === false,
        immediately: isImmediatelyOpenSidebar,
      })}
    >
      {logoControlIcon && (
        <div className={cx('logo-wrapper')}>
          <i className={cx('logo')}>{Parser(logoControlIcon)}</i>
        </div>
      )}
      <div className={cx('main-block')}>
        {createMainControlBlock(onCloseNavbar, setIsOpenPopover, sidebarRef)}
      </div>
      {topSidebarControlItems.length > 0 && (
        <div className={cx('top-block')}>
          {topSidebarControlItems.map(({ sidebarBlockItem, key, onClick }) => (
            <SidebarButton
              key={key}
              className={cx('navbar-btn', getClassName(key))}
              onClick={() => {
                onClick();
                onCloseNavbar();
              }}
              onMouseEnter={() => setHoverType(key)}
              onMouseLeave={clearActionButton}
              onMouseDown={() => setActiveType(key)}
            >
              {sidebarBlockItem}
            </SidebarButton>
          ))}
        </div>
      )}
      {bottomSidebarControlItems.length > 0 && (
        <div className={cx('bottom-block')}>
          {bottomSidebarControlItems.map(({ bottomSidebarItem, key, onClick }) => (
            <SidebarButton
              key={key}
              className={cx('navbar-btn', getClassName(key))}
              onClick={() => {
                onClick();
                onCloseNavbar();
              }}
              onMouseEnter={() => setHoverType(key)}
              onMouseLeave={clearActionButton}
              onMouseDown={() => setActiveType(key)}
            >
              {bottomSidebarItem}
            </SidebarButton>
          ))}
        </div>
      )}
      <div className={cx('bottom-block')}>
        {createFooterControlBlock(onCloseNavbar, setIsOpenPopover, sidebarRef)}
      </div>
    </div>
  );
};
Navbar.propTypes = {
  active: PropTypes.bool,
  topSidebarControlItems: PropTypes.array,
  bottomSidebarControlItems: PropTypes.array,
  onCloseNavbar: PropTypes.func.isRequired,
  logoControlIcon: PropTypes.element,
  createMainControlBlock: PropTypes.func,
  createFooterControlBlock: PropTypes.func,
  setIsOpenPopover: PropTypes.func,
  getClassName: PropTypes.object.isRequired,
  setHoverType: PropTypes.func.isRequired,
  clearActionButton: PropTypes.func.isRequired,
  setActiveType: PropTypes.func.isRequired,
  isImmediatelyOpenSidebar: PropTypes.bool,
  setIsImmediatelyOpenSidebar: PropTypes.func.isRequired,
  sidebarRef: PropTypes.element.isRequired,
};

Navbar.defaultProps = {
  active: false,
  isImmediatelyOpenSidebar: false,
  topSidebarControlItems: [],
  bottomSidebarControlItems: [],
  createMainControlBlock: () => {},
  createFooterControlBlock: () => {},
  setIsOpenPopover: () => {},
};
