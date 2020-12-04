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
import { ruleListItemPropTypes, ruleListItemDefaultProps } from '../constants';
import styles from './listItem.scss';

const cx = classNames.bind(styles);

export const ListItem = ({ item, getListItemContentData, ...rest }) => (
  <div className={cx('list-item')}>
    <ControlPanel item={item} {...rest} />
    <div className={cx('data')}>
      {getListItemContentData(item).map((itemData, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${itemData.key}_${index}`} className={cx('data-row')}>
          <span className={cx('data-name')}>{itemData.key}</span>
          {Array.isArray(itemData.value) ? (
            <div className={cx('data-value', 'multiple-data')}>
              {itemData.value.map((valueItem, valueIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={valueIndex} className={cx('data-value-item')}>
                  {valueItem}
                </span>
              ))}
            </div>
          ) : (
            <span className={cx('data-value')}>{itemData.value}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);
ListItem.propTypes = {
  ...ruleListItemPropTypes,
  item: PropTypes.object,
  id: PropTypes.number,
  maxItemOrder: PropTypes.number,
};
ListItem.defaultProps = {
  ...ruleListItemDefaultProps,
  item: {},
  id: 0,
  maxItemOrder: 0,
};
