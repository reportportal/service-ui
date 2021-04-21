/*
 * Copyright 2021 EPAM Systems
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
import styles from './itemContent.scss';

const cx = classNames.bind(styles);

export const ItemContent = ({ data, lineHeightVariant }) => (
  <div className={cx('item-content', { [`line-height-${lineHeightVariant}`]: lineHeightVariant })}>
    <span className={cx('data-name')}>{data.key}</span>
    {Array.isArray(data.value) ? (
      <div className={cx('data-value', 'multiple-data')}>
        {data.value.map((valueItem, valueIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={valueIndex} className={cx('data-value-item')}>
            {valueItem}
          </span>
        ))}
      </div>
    ) : (
      <span className={cx('data-value')}>{data.value}</span>
    )}
  </div>
);
ItemContent.propTypes = {
  data: PropTypes.shape({
    key: PropTypes.any,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.any]),
  }),
  lineHeightVariant: PropTypes.string,
};
ItemContent.defaultProps = {
  data: {
    key: '',
    value: '',
  },
  lineHeightVariant: '',
};
