/*
 * Copyright 2023 EPAM Systems
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

import ReactDatePicker, { registerLocale } from 'react-datepicker';
import classNames from 'classnames/bind';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { be, ru, enGB, uk } from 'date-fns/locale';
import { langSelector } from 'controllers/lang';
import { useSelector } from 'react-redux';
import styles from './datePicker.scss';
import { DatePickerHeader } from './header';

const cx = classNames.bind(styles);
const currentLanguageToLocale = {
  en: enGB,
  be,
  ru,
  uk,
};

export const DatePicker = ({
  value,
  onChange,
  disabled,
  onBlur,
  onFocus,
  endDate,
  startDate,
  selectsRange,
  headerNodes,
  customClassName,
  customTimeInput,
  shouldCloseOnSelect,
  showPopperArrow,
  children,
  popperClassName,
  calendarClassName,
  fixedHeight,
}) => {
  const language = useSelector(langSelector);
  const startDateToString = startDate && startDate.toDateString();
  const endDateToString = endDate && endDate.toDateString();
  const isValidEndDate = endDate > startDate;

  useMemo(() => registerLocale(language, currentLanguageToLocale[language]), [language]);

  const getDayClassName = (displayedDates) => {
    const displayedDateToString = displayedDates.toDateString();
    const isCurrentDate = displayedDateToString === startDateToString;
    const isEndDate = isValidEndDate && displayedDateToString === endDateToString;

    const isInsideSelectedRange =
      ((startDate && endDate) || selectsRange) &&
      displayedDates > startDate &&
      displayedDates < endDate;

    return cx('date', {
      'current-date': isCurrentDate,
      'selected-range': isInsideSelectedRange && !isEndDate,
      'end-date': isEndDate && isValidEndDate,
      disabled,
    });
  };

  const handleChange = (dates) => {
    if (selectsRange) {
      const [dateFrom, dateTo] = dates;
      onChange({
        startDate: dateFrom,
        endDate: dateTo,
      });
    } else {
      onChange(dates);
    }
  };

  return (
    <ReactDatePicker
      selected={endDate || startDate}
      startDate={startDate}
      endDate={endDate}
      disabled={disabled}
      value={value}
      selectsRange={selectsRange}
      shouldCloseOnSelect={shouldCloseOnSelect}
      fixedHeight={fixedHeight}
      locale={currentLanguageToLocale[language]}
      showPopperArrow={showPopperArrow}
      dayClassName={getDayClassName}
      calendarClassName={cx(calendarClassName, 'calendar')}
      renderCustomHeader={(customHeaderProps) => (
        <DatePickerHeader
          {...customHeaderProps}
          headerNodes={headerNodes}
          customClass={customClassName}
        />
      )}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      customTimeInput={customTimeInput}
      showTimeInput={Boolean(customTimeInput)}
      popperClassName={cx(popperClassName, 'popper')}
    >
      {children}
    </ReactDatePicker>
  );
};
DatePicker.propTypes = {
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  headerNodes: PropTypes.node,
  disabled: PropTypes.bool,
  selectsRange: PropTypes.bool,
  shouldCloseOnSelect: PropTypes.bool,
  showPopperArrow: PropTypes.bool,
  fixedHeight: PropTypes.bool,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  customClassName: PropTypes.string,
  popperClassName: PropTypes.string,
  calendarClassName: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  children: PropTypes.element,
  customTimeInput: PropTypes.element,
};
DatePicker.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  headerNodes: null,
  disabled: false,
  selectsRange: false,
  shouldCloseOnSelect: false,
  showPopperArrow: false,
  fixedHeight: false,
  startDate: new Date(),
  endDate: null,
  customClassName: '',
  popperClassName: '',
  calendarClassName: '',
  children: null,
};
