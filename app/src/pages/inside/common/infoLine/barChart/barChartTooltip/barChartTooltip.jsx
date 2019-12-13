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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './barChartTooltip.scss';

const cx = classNames.bind(styles);

export const BarChartTooltip = ({ passed, failed, skipped }) => (
  <div className={cx('bar-chart-tooltip')}>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.passed" defaultMessage="Passed:" />
      <span>{`${passed.toFixed(2)}%`}</span>
    </div>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.failed" defaultMessage="Failed:" />
      <span>{`${failed.toFixed(2)}%`}</span>
    </div>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.skipped" defaultMessage="Skipped:" />
      <span>{`${skipped.toFixed(2)}%`}</span>
    </div>
  </div>
);

BarChartTooltip.propTypes = {
  passed: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
};
