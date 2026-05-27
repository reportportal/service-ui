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

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { DatePicker } from '@reportportal/ui-kit';
import { getMaxAllowedEndDate } from './utils';
import styles from './dateRange.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  customRange: {
    id: 'DateRange.customRange',
    defaultMessage: 'Custom range',
  },
  maxRangeHint: {
    id: 'DateRange.maxRangeHint',
    defaultMessage: 'The maximum date range is {maxDays, plural, one {# day} other {# days}}',
  },
});

export const DateRange = ({
  startDate,
  endDate,
  onChange,
  popperClassName = '',
  calendarClassName = '',
  maxRangeDays,
}) => {
  const { formatMessage } = useIntl();
  const showMaxRangeHint = maxRangeDays > 0;

  const maxDate = useMemo(
    () => getMaxAllowedEndDate(maxRangeDays, startDate, endDate),
    [maxRangeDays, startDate, endDate],
  );

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
      <div className={cx('field')}>
        <div className={cx('date-picker-container')}>
          <DatePicker
            selectsRange
            value={[startDate, endDate]}
            onChange={handleDateChange}
            popperClassName={popperClassName}
            calendarClassName={calendarClassName}
            maxDate={maxDate}
          />
        </div>
        {showMaxRangeHint && (
          <span className={cx('max-range-hint')}>
            {formatMessage(messages.maxRangeHint, { maxDays: Number(maxRangeDays) })}
          </span>
        )}
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
  maxRangeDays: PropTypes.number,
};
