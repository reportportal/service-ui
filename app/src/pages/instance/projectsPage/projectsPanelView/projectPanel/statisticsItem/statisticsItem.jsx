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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './statisticsItem.scss';

const cx = classNames.bind(styles);
export const StatisticsItem = ({ caption, value, emptyValueCaption }) => (
  <div className={cx('statistic-item')}>
    <div className={cx('caption')}>{caption}</div>
    {value ? (
      <div className={cx('value')}>{value}</div>
    ) : (
      <div className={cx('empty-value')}>{emptyValueCaption}</div>
    )}
  </div>
);

StatisticsItem.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  emptyValueCaption: PropTypes.string,
};

StatisticsItem.defaultProps = {
  value: '0',
  emptyValueCaption: '-',
};
