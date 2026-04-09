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

import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useOnClickOutside } from 'common/hooks';
import { SidebarButton } from './sidebarButton';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

const COLLAPSED_WIDTH_PX = 48;
const SIDEBAR_FULL_WIDTH_PX = 328;
const SIDEBAR_TRANSITION_DELAY_MS = 500;
const SIDEBAR_TRANSITION_DURATION_MS = 300;
const SIDEBAR_OPEN_DURATION_MS = SIDEBAR_TRANSITION_DELAY_MS + SIDEBAR_TRANSITION_DURATION_MS;

const SIDEBAR_CSS_VARS = {
  '--sidebar-collapsed-width': `${COLLAPSED_WIDTH_PX}px`,
  '--sidebar-full-width': '328px',
  '--sidebar-transition-duration': `${SIDEBAR_TRANSITION_DURATION_MS}ms`,
  '--sidebar-transition-delay': `${SIDEBAR_TRANSITION_DELAY_MS}ms`,
  '--sidebar-open-duration': `${SIDEBAR_OPEN_DURATION_MS}ms`,
};

export const Sidebar = ({
  logoBlock,
  createMainBlock,
  items,
  createFooterBlock,
  shouldBeCollapsedOnLeave,
}) => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const sidebarRef = useRef(null);
  const openTimerRef = useRef(null);
  const openRequestIdRef = useRef(0);

  const onCloseSidebar = () => {
    openRequestIdRef.current += 1;
    clearTimeout(openTimerRef.current);
    setIsOpenSidebar(false);
  };

  const handleClickOutside = useCallback(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
  }, [isOpenSidebar]);

  useOnClickOutside(sidebarRef, handleClickOutside);

  useEffect(() => () => clearTimeout(openTimerRef.current), []);

  const onOpenSidebar = () => {
    setIsOpenSidebar(true);
  };

  const onLeaveSidebar = () => {
    if (shouldBeCollapsedOnLeave) {
      onCloseSidebar();
    }
  };

  const getIsSidebarCollapsed = () => COLLAPSED_WIDTH_PX === sidebarRef.current?.offsetWidth;

  const afterOpenSidebar = (callback) => {
    const el = sidebarRef.current;
    openRequestIdRef.current += 1;
    const requestId = openRequestIdRef.current;
    if (!el) {
      callback();
      return;
    }

    clearTimeout(openTimerRef.current);

    let fired = false;
    const fire = () => {
      if (!fired && requestId === openRequestIdRef.current) {
        fired = true;
        callback();
      }
    };

    // Double rAF ensures the browser has started the CSS transition before we measure width.
    // getComputedStyle called synchronously after adding .open returns the CSS target value
    // (328px), not the current animated value.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!sidebarRef.current) {
          fire();
          return;
        }
        const currentWidth = parseFloat(window.getComputedStyle(el).width);
        if (currentWidth >= SIDEBAR_FULL_WIDTH_PX - 1) {
          fire();
          return;
        }

        const handleTransitionEnd = (e) => {
          if (e.propertyName === 'width' && e.target === el) {
            el.removeEventListener('transitionend', handleTransitionEnd);
            clearTimeout(openTimerRef.current);
            fire();
          }
        };

        el.addEventListener('transitionend', handleTransitionEnd);
        openTimerRef.current = setTimeout(() => {
          el.removeEventListener('transitionend', handleTransitionEnd);
          fire();
        }, SIDEBAR_OPEN_DURATION_MS);
      });
    });
  };

  return (
    <div
      ref={sidebarRef}
      style={SIDEBAR_CSS_VARS}
      className={cx('sidebar-container', { open: isOpenSidebar })}
      onMouseEnter={onOpenSidebar}
      onMouseLeave={onLeaveSidebar}
    >
      <aside className={cx('sidebar')}>
        {logoBlock}
        <div className={cx('main-block-wrapper')}>
          {createMainBlock(onOpenSidebar, onCloseSidebar, getIsSidebarCollapsed, afterOpenSidebar)}
        </div>
        {items.length > 0 && (
          <div className={cx('items-block')}>
            {items.map(({ icon, link, onClick, message, component }) => {
              const handleClick = () => {
                onClick(getIsSidebarCollapsed());
                onLeaveSidebar();
              };

              return component ? (
                <div onClick={handleClick}>{component}</div>
              ) : (
                <SidebarButton
                  key={link.type}
                  icon={icon}
                  link={link}
                  onClick={handleClick}
                  message={message}
                />
              );
            })}
          </div>
        )}
        <div className={cx('footer-block')}>
          {createFooterBlock(onOpenSidebar, onCloseSidebar, getIsSidebarCollapsed, afterOpenSidebar)}
        </div>
      </aside>
    </div>
  );
};

Sidebar.propTypes = {
  logoBlock: PropTypes.element,
  items: PropTypes.array,
  createMainBlock: PropTypes.func,
  createFooterBlock: PropTypes.func,
  shouldBeCollapsedOnLeave: PropTypes.bool,
};

Sidebar.defaultProps = {
  logoBlock: null,
  createMainBlock: () => {},
  items: [],
  shouldBeCollapsedOnLeave: false,
  createFooterBlock: () => {},
};
