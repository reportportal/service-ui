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
import styles from './bubblesPreloader.scss';

const cx = classNames.bind(styles);

export const BubblesPreloader = ({ color, bubblesCount, customClassName }) => (
  <div className={cx('bubbles-preloader', customClassName)}>
    {Array(bubblesCount)
      .fill(null)
      .map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={cx('bubble')} style={{ backgroundColor: color }} key={index} />
      ))}
  </div>
);
BubblesPreloader.propTypes = {
  color: PropTypes.string,
  bubblesCount: PropTypes.number,
  customClassName: PropTypes.string,
};
BubblesPreloader.defaultProps = {
  color: '#1a9cb0',
  bubblesCount: 7,
  customClassName: '',
};
