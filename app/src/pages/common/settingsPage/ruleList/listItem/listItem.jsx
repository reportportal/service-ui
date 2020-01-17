/*
 * Copyright 2019 EPAM Systems
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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ControlPanel } from './controlPanel';
import styles from './listItem.scss';

const cx = classNames.bind(styles);

export const ListItem = ({
  item,
  id,
  readOnly,
  onToggle,
  onDelete,
  onEdit,
  onClone,
  getPanelTitle,
  getListItemContentData,
  isCloned,
  messages,
}) => (
  <div className={cx('list-item')}>
    <ControlPanel
      item={item}
      id={id}
      readOnly={readOnly}
      onToggle={onToggle}
      onDelete={onDelete}
      onEdit={onEdit}
      onClone={onClone}
      getPanelTitle={getPanelTitle}
      isCloned={isCloned}
      messages={messages}
    />
    <div className={cx('data')}>
      {getListItemContentData(item).map((itemData, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${itemData.key}_${itemData.value}_${index}`} className={cx('data-row')}>
          <span className={cx('data-name')}>{itemData.key}</span>
          <span className={cx('data-value')}>{itemData.value}</span>
        </div>
      ))}
    </div>
  </div>
);

ListItem.propTypes = {
  item: PropTypes.object,
  id: PropTypes.number,
  readOnly: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onClone: PropTypes.func,
  getPanelTitle: PropTypes.func,
  getListItemContentData: PropTypes.func,
  isCloned: PropTypes.bool,
  messages: PropTypes.object,
};

ListItem.defaultProps = {
  item: {},
  id: 0,
  readOnly: false,
  onToggle: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onClone: () => {},
  getPanelTitle: () => {},
  getListItemContentData: () => {},
  isCloned: false,
  messages: {},
};
