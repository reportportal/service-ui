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
import { DateRange } from './dateRange';

export const DateRangeFormField = ({
  input,
  startPopperClassName = '',
  startCalendarClassName = '',
  endPopperClassName = '',
  endCalendarClassName = '',
}) => {
  const { value = {}, onChange } = input;

  const startDateChangeHandler = (startDate) => {
    onChange({ startDate, endDate: value?.endDate });
  };

  const endDateChangeHandler = (endDate) => {
    onChange({ startDate: value?.startDate || endDate, endDate });
  };

  return (
    <DateRange
      startDate={value?.startDate}
      setStartDate={startDateChangeHandler}
      endDate={value?.endDate}
      setEndDate={endDateChangeHandler}
      startPopperClassName={startPopperClassName}
      startCalendarClassName={startCalendarClassName}
      endPopperClassName={endPopperClassName}
      endCalendarClassName={endCalendarClassName}
    />
  );
};

DateRangeFormField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.object,
    onChange: PropTypes.func,
  }).isRequired,
  startPopperClassName: PropTypes.string,
  startCalendarClassName: PropTypes.string,
  endPopperClassName: PropTypes.string,
  endCalendarClassName: PropTypes.string,
};
