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
import Parser from 'html-react-parser';
import TimeIcon from 'common/img/time-icon-inline.svg';
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './mostTimeConsumingTestCasesTooltip.scss';

const cx = classNames.bind(styles);

export const MostTimeConsumingTestCasesTooltip = ({ itemName, duration, date }) => (
  <TooltipContent itemName={itemName}>
    <div className={cx('time-wrapper')}>
      <span className={cx('time-icon')}>{Parser(TimeIcon)}</span>
      <span>{`${duration} ms`}</span>
    </div>
    <div className={cx('date')}>{date}</div>
  </TooltipContent>
);
MostTimeConsumingTestCasesTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  duration: PropTypes.number,
  date: PropTypes.string,
};
MostTimeConsumingTestCasesTooltip.defaultProps = {
  itemName: '',
  duration: 0,
  date: '',
};
