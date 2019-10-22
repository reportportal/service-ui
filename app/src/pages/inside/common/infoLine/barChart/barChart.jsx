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

import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './barChart.scss';
import { BarChartTooltip } from './barChartTooltip';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: BarChartTooltip,
  data: { width: 170, placement: 'left', noArrow: true },
})
export class BarChart extends Component {
  static propTypes = {
    passed: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired,
    skipped: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className={cx('bar-chart')}>
        <div className={cx('segment', 'passed')} style={{ width: `${this.props.passed}px` }} />
        <div className={cx('segment', 'failed')} style={{ width: `${this.props.failed}px` }} />
        <div className={cx('segment', 'skipped')} style={{ width: `${this.props.skipped}px` }} />
      </div>
    );
  }
}
