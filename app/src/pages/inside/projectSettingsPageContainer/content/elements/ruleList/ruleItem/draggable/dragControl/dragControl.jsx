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

import React from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './dragControl.scss';
import DragAndDropIcon from './img/drag-n-drop-inline.svg';

const cx = classNames.bind(styles);

export function DragControl({
  dragRef,
  handleDragStart,
  handleDragEnd,
  isDragging,
  disabled,
  title,
}) {
  return (
    <i
      ref={dragRef}
      onDragStart={disabled ? null : handleDragStart}
      onDragEnd={disabled ? null : handleDragEnd}
      className={cx('drag-control', { 'dragging-control': isDragging, disabled })}
      title={title}
    >
      {Parser(DragAndDropIcon)}
    </i>
  );
}
DragControl.propTypes = {
  dragRef: PropTypes.func,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
  isDragging: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};
DragControl.defaultProps = {
  dragRef: () => {},
  handleDragStart: () => {},
  handleDragEnd: () => {},
  isDragging: false,
  disabled: false,
  title: '',
};
