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

import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'components/main/icon';
import { DragControl } from 'pages/inside/projectSettingsPageContainer/content/elements/ruleList/ruleItem/draggable/dragControl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from '../linksAndBrandingTab.scss';

const cx = classNames.bind(styles);
const FOOTER_LINK_DRAG_SOURCE_TYPE = 'FOOTER_LINK';
export function DraggableLink({ item, onDrop, onDelete, disabled, disabledTitle }) {
  const [isDragging, setIsDragging] = useState(false);
  const { trackEvent } = useTracking();
  const [{ isInDraggingState }, dragRef, dragPreviewRef] = useDrag(
    () => ({
      type: FOOTER_LINK_DRAG_SOURCE_TYPE,
      item: { name: item.name, index: item.index },
      collect: (monitor) => ({
        isInDraggingState: monitor.isDragging(),
      }),
      canDrag: () => !disabled,
    }),
    [item],
  );
  const [{ draggedItemIndex }, dropRef] = useDrop(
    () => ({
      accept: FOOTER_LINK_DRAG_SOURCE_TYPE,
      collect: (monitor) => {
        const draggedItem = monitor.getItem();
        const isAbleToDrop = draggedItem?.name !== item.name;
        const isOver = isAbleToDrop ? monitor.isOver() : false;
        return {
          draggedItemIndex: isOver ? draggedItem?.index : null,
        };
      },
      drop: (dragObject) => {
        if (dragObject.name !== item.name) {
          onDrop(dragObject.index, item.index);
        }
      },
    }),
    [item, onDrop],
  );
  const dropTargetType = draggedItemIndex > item.index ? 'top' : 'bottom';
  const handleDragStart = () => {
    setIsDragging(true);
  };
  const handleDragEnd = () => {
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.DRAG_END_FOOTER_LINK);
    setIsDragging(false);
  };
  return (
    <div
      key={item.name}
      className={cx('link-item', {
        [`drop-target-${dropTargetType}`]: draggedItemIndex !== null,
      })}
      ref={(node) => dropRef(dragPreviewRef(node))}
      style={{ opacity: isInDraggingState ? 0 : 1 }}
    >
      <div className={cx('content', { 'is-dragging': isDragging })}>
        <div className={cx('link-item-name')}>{item.name}</div>
        <div className={cx('link-item-url')} title={item.url}>
          {item.url.startsWith('mailto:') ? item.url.slice(7) : item.url}
        </div>
      </div>
      {!isDragging && (
        <Icon
          type="icon-delete"
          className={cx('icon-delete')}
          onClick={() => onDelete(item.name)}
        />
      )}
      <DragControl
        dragRef={dragRef}
        dragPreviewRef={dragPreviewRef}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        isDragging={isDragging}
        disabled={disabled}
        title={disabled ? disabledTitle : ''}
      />
    </div>
  );
}

DraggableLink.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }).isRequired,
  onDrop: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  disabledTitle: PropTypes.string,
};
