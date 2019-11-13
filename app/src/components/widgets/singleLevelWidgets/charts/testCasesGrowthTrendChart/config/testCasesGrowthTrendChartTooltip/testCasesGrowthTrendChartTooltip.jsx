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
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './testCasesGrowthTrendChartTooltip.scss';

const cx = classNames.bind(styles);

export const TestCasesGrowthTrendChartTooltip = ({
  itemName,
  startTime,
  growthClass,
  growth,
  total,
  growTestCasesMessage,
  totalTestCasesMessage,
}) => (
  <TooltipContent itemName={itemName}>
    {startTime && <div className={cx('launch-start-time')}>{startTime}</div>}
    <div className={cx('item-wrapper')}>
      <div className={cx('item-cases')}>
        <div className={cx('item-cases-growth')}>
          {`${growTestCasesMessage}: `}
          <span className={cx(growthClass)}>{growth}</span>
        </div>
        <div className={cx('item-cases-total')}>
          {`${totalTestCasesMessage}: `}
          <span>{total}</span>
        </div>
      </div>
    </div>
  </TooltipContent>
);
TestCasesGrowthTrendChartTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  startTime: PropTypes.string,
  growthClass: PropTypes.string,
  growth: PropTypes.number,
  total: PropTypes.number,
  growTestCasesMessage: PropTypes.string,
  totalTestCasesMessage: PropTypes.string,
};
TestCasesGrowthTrendChartTooltip.defaultProps = {
  itemName: '',
  startTime: '',
  growthClass: '',
  growth: 0,
  total: 0,
  growTestCasesMessage: '',
  totalTestCasesMessage: '',
};
