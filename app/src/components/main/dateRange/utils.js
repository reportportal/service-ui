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

import moment from 'moment';
import { getMinutesFromTimestamp } from 'common/utils';
import { DATE_FORMAT_DROPDOWN } from 'common/constants/timeDateFormat';

export const parseFormattedDate = (formatted) => {
  if (!formatted) {
    return {};
  }

  if (formatted instanceof Object) {
    return formatted;
  }

  const [startMinutesStr, endMinutesStr] = formatted.split(';');

  const startDate = startMinutesStr
    ? moment(moment().startOf('day')).add(parseInt(startMinutesStr, 10), 'minutes')
    : undefined;
  const endDate = endMinutesStr
    ? moment(moment().startOf('day')).add(parseInt(endMinutesStr, 10), 'minutes')
    : undefined;

  return {
    startDate: startDate?.toDate(),
    endDate: endDate?.toDate(),
  };
};

export const formatDisplayedValue = (displayedValue, value, timeRangeValues) => {
  if (!value) {
    return displayedValue;
  }

  if (timeRangeValues.includes(value)) {
    return displayedValue;
  }

  const { startDate, endDate } = parseFormattedDate(value) || {};

  if (!startDate && !endDate) {
    return '';
  }

  const formattedStartTimeRange =
    startDate && moment(new Date(startDate)).format(DATE_FORMAT_DROPDOWN);
  const formattedEndTimeRange = endDate && moment(new Date(endDate)).format(DATE_FORMAT_DROPDOWN);

  return `${formattedStartTimeRange || ''} — ${formattedEndTimeRange || ''}`;
};

export const formatDateRangeToMinutesString = (formValue) => {
  if (typeof formValue === 'string') {
    return formValue;
  }

  const { startDate, endDate } = formValue || {};

  const utcString = moment().format('ZZ');

  return `${startDate ? getMinutesFromTimestamp(startDate) : ''};${endDate ? getMinutesFromTimestamp(endDate) : ''};${utcString}`;
};

export const setEndOfDay = (date) => {
  if (!date) return date;

  const dateObj = new Date(date);
  dateObj.setHours(23, 59);
  return dateObj;
};
