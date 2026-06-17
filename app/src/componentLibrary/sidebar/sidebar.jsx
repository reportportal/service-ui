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

import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Popover } from '@reportportal/ui-kit';
import { useOnClickOutside } from 'common/hooks';
import { SidebarButton } from './sidebarButton';
import { ShowMoreButton } from './showMoreButton';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

const COLLAPSED_WIDTH_PX = 48;
const SIDEBAR_FULL_WIDTH_PX = 328;
const SIDEBAR_TRANSITION_DELAY_MS = 500;
const SIDEBAR_TRANSITION_DURATION_MS = 300;
const SIDEBAR_OPEN_DURATION_MS = SIDEBAR_TRANSITION_DELAY_MS + SIDEBAR_TRANSITION_DURATION_MS;
const DEFAULT_ITEM_HEIGHT_PX = 40;

const SIDEBAR_CSS_VARS = {
  '--sidebar-collapsed-width': `${COLLAPSED_WIDTH_PX}px`,
  '--sidebar-full-width': `${SIDEBAR_FULL_WIDTH_PX}px`,
  '--sidebar-transition-duration': `${SIDEBAR_TRANSITION_DURATION_MS}ms`,
  '--sidebar-transition-delay': `${SIDEBAR_TRANSITION_DELAY_MS}ms`,
  '--sidebar-open-duration': `${SIDEBAR_OPEN_DURATION_MS}ms`,
};

const getSidebarItemKey = ({ name, link, message }) => {
  if (name) {
    return name;
  }

  if (!link) {
    return message;
  }

  const { type, payload = {} } = link;
  return [type, payload.pluginPage, payload.organizationSlug, payload.projectSlug]
    .filter(Boolean)
    .join(':');
};

export const Sidebar = ({
  logoBlock,
  createMainBlock,
  items,
  createFooterBlock,
  shouldBeCollapsedOnLeave,
  onShowMoreClick,
}) => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [isShowMorePopoverOpen, setIsShowMorePopoverOpen] = useState(false);

  const sidebarRef = useRef(null);
  const openTimerRef = useRef(null);
  const openRequestIdRef = useRef(0);
  const itemsBlockRef = useRef(null);
  const itemRefsMap = useRef(new Map());
  const showMoreRef = useRef(null);

  const setItemRef = useCallback((key, element) => {
    if (element) {
      itemRefsMap.current.set(key, element);
    } else {
      itemRefsMap.current.delete(key);
    }
  }, []);

  const calculateLayout = useCallback(() => {
    const container = itemsBlockRef.current;
    if (!container || items.length === 0) {
      return;
    }

    const availableHeight = container.offsetHeight;
    const itemHeights = items.map((item) => {
      const element = itemRefsMap.current.get(getSidebarItemKey(item));
      return element?.offsetHeight || DEFAULT_ITEM_HEIGHT_PX;
    });
    const showMoreHeight = showMoreRef.current?.offsetHeight || DEFAULT_ITEM_HEIGHT_PX;

    const totalHeight = itemHeights.reduce((sum, h) => sum + h, 0);
    if (totalHeight <= availableHeight) {
      setVisibleCount(items.length);
      setIsShowMorePopoverOpen(false);
      return;
    }

    for (let count = items.length - 1; count >= 0; count -= 1) {
      const neededHeight =
        itemHeights.slice(0, count).reduce((sum, h) => sum + h, 0) + showMoreHeight;
      if (neededHeight <= availableHeight) {
        setVisibleCount(count);
        return;
      }
    }
    setVisibleCount(0);
  }, [items]);

  // Sync calc before paint to avoid a brief flash of ShowMore on mount / when items change.
  useLayoutEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  useEffect(() => {
    const container = itemsBlockRef.current;
    if (!container) {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(() => calculateLayout());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [calculateLayout]);

  const onCloseSidebar = () => {
    openRequestIdRef.current += 1;
    clearTimeout(openTimerRef.current);
    setIsShowMorePopoverOpen(false);
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

  const collapseSidebarOnLeave = () => {
    if (shouldBeCollapsedOnLeave) {
      onCloseSidebar();
    }
  };

  const onLeaveSidebar = () => {
    if (!isShowMorePopoverOpen) {
      collapseSidebarOnLeave();
    }
  };

  const getIsSidebarCollapsed = () => COLLAPSED_WIDTH_PX === sidebarRef.current?.offsetWidth;

  const renderItem = (item, isInPopover = false) => {
    const { icon, link, message, component } = item;
    const itemKey = getSidebarItemKey(item);
    const handleClick = () => {
      item.onClick?.(getIsSidebarCollapsed());
      if (isInPopover) {
        setIsShowMorePopoverOpen(false);
      }
      collapseSidebarOnLeave();
    };

    return component ? (
      <button
        type="button"
        key={itemKey}
        className={cx('custom-item-button')}
        onClick={handleClick}
      >
        {component}
      </button>
    ) : (
      <SidebarButton
        key={itemKey}
        icon={icon}
        link={link}
        onClick={handleClick}
        message={message}
      />
    );
  };

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
          <div ref={itemsBlockRef} className={cx('items-block')}>
            {items.map((item, idx) => {
              const itemKey = getSidebarItemKey(item);
              const isHidden = idx >= visibleCount;

              return (
                <div
                  key={itemKey}
                  ref={(el) => setItemRef(itemKey, el)}
                  className={cx('item-wrapper', { hidden: isHidden })}
                >
                  {renderItem(item)}
                </div>
              );
            })}
            <div
              ref={showMoreRef}
              className={cx('show-more-wrapper', { hidden: visibleCount >= items.length })}
            >
              <Popover
                className={cx('show-more-popover')}
                placement="right-start"
                isOpened={isShowMorePopoverOpen}
                setIsOpened={(open) => {
                  if (open) {
                    onShowMoreClick?.(getIsSidebarCollapsed());
                    onOpenSidebar();
                    afterOpenSidebar(() => setIsShowMorePopoverOpen(true));
                  } else {
                    setIsShowMorePopoverOpen(false);
                  }
                }}
                strategy="fixed"
                content={
                  <div className={cx('show-more-content')}>
                    {items.slice(visibleCount).map((item) => renderItem(item, true))}
                  </div>
                }
              >
                <ShowMoreButton isActive={isShowMorePopoverOpen} />
              </Popover>
            </div>
          </div>
        )}
        <div className={cx('footer-block')}>
          {createFooterBlock(
            onOpenSidebar,
            onCloseSidebar,
            getIsSidebarCollapsed,
            afterOpenSidebar,
          )}
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
  onShowMoreClick: PropTypes.func,
};

Sidebar.defaultProps = {
  logoBlock: null,
  createMainBlock: () => {},
  items: [],
  shouldBeCollapsedOnLeave: false,
  createFooterBlock: () => {},
  onShowMoreClick: null,
};
