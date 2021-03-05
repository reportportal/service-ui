/*
 * Copyright 2020 EPAM Systems
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

import React from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import RGL, { WidthProvider } from 'react-grid-layout';
import { ruleListItemDefaultProps, ruleListItemPropTypes } from './constants';
import { ListItem } from './listItem';
import styles from './movableRuleList.scss';

const cx = classNames.bind(styles);

const ReactGridLayout = WidthProvider(RGL);

const calculateLayout = (data) =>
  data.map((item) => ({ x: 0, y: item.order, w: 1, h: 1, i: String(item.id) }));

export const MovableRuleList = ({ data, onMove, ...rest }) => {
  const isFirefox = typeof InstallTrigger !== 'undefined';
  const maxItemOrder = data.length - 1;
  const [layout, setLayout] = React.useState(calculateLayout(data));

  const updateItemsOrder = (newLayout, oldPosition, newPosition) => {
    const isItemOrderChanged = oldPosition.y !== newPosition.y;
    if (isItemOrderChanged) {
      const updatedData = data.map((item, index) => ({ ...item, order: newLayout[index].y }));
      onMove(updatedData);
    }
  };
  const moveItem = (itemToMove, nextOrder) => {
    const updatedData = data.map((item) => {
      if (item.order === itemToMove.order) {
        return { ...item, order: nextOrder };
      } else if (item.order === nextOrder) {
        return { ...item, order: itemToMove.order };
      }

      return item;
    });
    setLayout(calculateLayout(updatedData));
    onMove(updatedData);
  };

  return (
    <div className={cx('movable-rule-list')}>
      <ReactGridLayout
        isDraggable
        isResizable={false}
        onDragStop={updateItemsOrder}
        onLayoutChange={setLayout}
        cols={1}
        useCSSTransforms={!isFirefox}
        draggableHandle=".draggable-field"
        measureBeforeMount
        layout={layout}
        rowHeight={164}
      >
        {data.map((item, index) => (
          <div key={item.id || index}>
            <ListItem
              id={index}
              item={{ ...item, order: layout[index].y }}
              onMove={moveItem}
              maxItemOrder={maxItemOrder}
              contentWithScroll
              lineHeightVariant="large"
              {...rest}
            />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
};
MovableRuleList.propTypes = {
  data: PropTypes.array,
  ...ruleListItemPropTypes,
};
MovableRuleList.defaultProps = {
  ...ruleListItemDefaultProps,
  data: [],
  isMovable: true,
};
