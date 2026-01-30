/*
 * Copyright 2026 EPAM Systems
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
import styles from './dateRangeFormField.scss';
import { parseFormattedDate, formatDateRangeToMinutesString, setEndOfDay } from './utils';
import { useCallback } from 'react';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  customRange: {
    id: 'DateRange.customRange',
    defaultMessage: 'Custom range',
  },
});

export const DateRangeFormField = ({
  input,
  popperClassName = '',
  calendarClassName = '',
  onClose,
}) => {
  const { formatMessage } = useIntl();
  const { value = '', onChange } = input;
  const { startDate, endDate } = parseFormattedDate(value);

  const handleDateChange = useCallback(
    ([startDate, endDate] = []) => {
      const normalizedDateRange = {
        startDate,
        endDate: setEndOfDay(endDate),
      };
      const formattedValue = formatDateRangeToMinutesString(normalizedDateRange);

      if (startDate && endDate && startDate <= endDate) {
        onChange(formattedValue);
        onClose();
      } else {
        onChange(formattedValue);
      }
    },
    [onChange, onClose],
  );

  return (
    <div className={cx('date-range-wrapper')}>
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
DateRangeFormField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.object,
    onChange: PropTypes.func,
  }).isRequired,
  onClose: PropTypes.func,
  popperClassName: PropTypes.string,
  calendarClassName: PropTypes.string,
};
