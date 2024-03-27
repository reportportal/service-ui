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
import { SidebarButton } from '../sidebarButton';
import styles from './navbar.scss';

const cx = classNames.bind(styles);

export const Navbar = ({
  active,
  onCloseNavbar,
  logoControlIcon,
  mainControlBlock,
  topSidebarControlItems,
  bottomSidebarControlItems,
  footerControlBlock,
  setIsOpenPopover,
  getClassName,
  setHoverType,
  clearActionButton,
  setActiveType,
}) => (
  <div className={cx('navbar', { active })}>
    {logoControlIcon && (
      <div className={cx('logo-wrapper')}>
        <i className={cx('logo')}>{Parser(logoControlIcon)}</i>
      </div>
    )}
    <div className={cx('main-block')}>{mainControlBlock(onCloseNavbar, setIsOpenPopover)}</div>
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
    <div className={cx('bottom-block')}>{footerControlBlock(onCloseNavbar, setIsOpenPopover)}</div>
  </div>
);

Navbar.propTypes = {
  active: PropTypes.bool,
  topSidebarControlItems: PropTypes.array,
  bottomSidebarControlItems: PropTypes.array,
  onCloseNavbar: PropTypes.func.isRequired,
  logoControlIcon: PropTypes.element,
  mainControlBlock: PropTypes.element,
  footerControlBlock: PropTypes.element,
  setIsOpenPopover: PropTypes.func,
  getClassName: PropTypes.object.isRequired,
  setHoverType: PropTypes.func.isRequired,
  clearActionButton: PropTypes.func.isRequired,
  setActiveType: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  active: false,
  topSidebarControlItems: [],
  bottomSidebarControlItems: [],
  mainControlBlock: null,
  footerControlBlock: null,
  setIsOpenPopover: () => {},
};
