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

import { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { DatePicker } from '@reportportal/ui-kit';
import styles from './dateRange.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  customRange: {
    id: 'DateRange.customRange',
    defaultMessage: 'Custom range',
  },
});

export const DateRange = ({
  startDate,
  endDate,
  onChange,
  popperClassName = '',
  calendarClassName = '',
}) => {
  const { formatMessage } = useIntl();

  const handleDateChange = useCallback(
    (dates) => {
      const [start, end] = dates;
      onChange({ startDate: start, endDate: end });
    },
    [onChange],
  );

  return (
    <div className={cx('time-range-wrapper')}>
      <div className={cx('title')}>{formatMessage(messages.customRange)}</div>
      <div className={cx('date-picker-container')}>
        <DatePicker
          selectsRange
          value={[startDate, endDate]}
          onChange={handleDateChange}
          popperClassName={popperClassName}
          calendarClassName={calendarClassName}
        />
      </div>
    </div>
  );
};

DateRange.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  popperClassName: PropTypes.string,
  calendarClassName: PropTypes.string,
};
