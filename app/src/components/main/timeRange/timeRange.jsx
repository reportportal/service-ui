/*
 * Copyright 2025 EPAM Systems
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
import { useIntl, defineMessages } from 'react-intl';
import { DatePicker } from '@reportportal/ui-kit';
import styles from './timeRange.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  customRange: {
    id: 'TimeRange.customRange',
    defaultMessage: 'Custom range',
  },
  from: {
    id: 'TimeRange.from',
    defaultMessage: 'From',
  },
  to: {
    id: 'TimeRange.to',
    defaultMessage: 'To',
  },
});

export const TimeRange = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('time-range-wrapper')}>
      <div className={cx('title')}>{formatMessage(messages.customRange)}</div>
      <div className={cx('time-range')}>
        <div className={cx('date-picker-wrapper')}>
          {formatMessage(messages.from)}
          <DatePicker
            value={startDate}
            startDate={startDate}
            endDate={endDate}
            onChange={setStartDate}
            selects={'start'}
          />
        </div>
        <div className={cx('date-picker-wrapper')}>
          {formatMessage(messages.to)}
          <DatePicker
            value={endDate}
            startDate={startDate}
            endDate={endDate}
            onChange={setEndDate}
            selects={'end'}
          />
        </div>
      </div>
    </div>
  );
};

TimeRange.propTypes = {
  startDate: PropTypes.string.isRequired,
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.string.isRequired,
  setEndDate: PropTypes.func.isRequired,
};
