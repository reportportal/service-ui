/*
 * Copyright 2023 EPAM Systems
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

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDrag, useDrop } from 'react-dnd';
import { withTooltip } from 'componentLibrary/tooltip';
import { RuleItem, ruleItemPropTypes, ruleItemDefaultProps } from '../plain';
import { RULE_DRAG_SOURCE_TYPE } from './constants';
import styles from './draggableRuleItem.scss';
import { DragControl } from './dragControl';

const cx = classNames.bind(styles);

export const DraggableRuleItem = ({ item, onDrop, tooltipComponent, ...restRuleItemProps }) => {
  const [isDragging, setIsDragging] = useState(false);

  const [{ isInDraggingState }, dragRef, dragPreviewRef] = useDrag(
    () => ({
      type: RULE_DRAG_SOURCE_TYPE,
      item: { id: item.id, index: item.index },
      collect: (monitor) => ({
        isInDraggingState: monitor.isDragging(),
      }),
    }),
    [item],
  );
  const [{ draggedItemIndex }, dropRef] = useDrop(
    () => ({
      accept: RULE_DRAG_SOURCE_TYPE,
      collect: (monitor) => {
        const draggedItem = monitor.getItem();
        const isAbleToDrop = draggedItem?.id !== item.id;
        const isOver = isAbleToDrop ? monitor.isOver() : false;
        return {
          draggedItemIndex: isOver ? draggedItem?.index : null,
        };
      },
      drop: (dragObject) => {
        if (dragObject.id !== item.id) {
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
    setIsDragging(false);
  };

  const DragControlComponent = useMemo(
    () =>
      tooltipComponent
        ? withTooltip({
            ContentComponent: tooltipComponent,
            width: 250,
            tooltipWrapperClassName: cx('tooltip-wrapper'),
          })(DragControl)
        : DragControl,
    [tooltipComponent],
  );

  return (
    <div
      ref={(node) => dropRef(dragPreviewRef(node))}
      style={{ opacity: isInDraggingState ? 0 : 1 }}
      className={cx('draggable-rule-item', {
        [`drop-target-${dropTargetType}`]: draggedItemIndex !== null,
        'is-dragging': isDragging,
      })}
    >
      <RuleItem item={item} isPreview={isDragging} {...restRuleItemProps} />
      <DragControlComponent
        dragRef={dragRef}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        isDragging={isDragging}
      />
    </div>
  );
};
DraggableRuleItem.propTypes = {
  ...ruleItemPropTypes,
  onDrop: PropTypes.func,
  tooltipComponent: PropTypes.func,
};
DraggableRuleItem.defaultProps = {
  ...ruleItemDefaultProps,
  onDrop: () => {},
  tooltipComponent: null,
};
