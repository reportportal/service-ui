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

import moment from 'moment';
import { DATE_FORMAT_DROPDOWN } from 'common/constants/timeDateFormat';

export const formatDisplayedValue = (date) => {
  if (!date || typeof date === 'string') {
    return date;
  }

  const { startDate, endDate } = date;

  if (!startDate && !endDate) {
    return '';
  }

  const formattedStartTimeRange =
    startDate && moment(new Date(startDate)).format(DATE_FORMAT_DROPDOWN);
  const formattedEndTimeRange = endDate && moment(new Date(endDate)).format(DATE_FORMAT_DROPDOWN);

  return `${formattedStartTimeRange || ''} — ${formattedEndTimeRange || ''}`;
};

export const parseFormattedDate = (formatted) => {
  if (!formatted) {
    return null;
  }

  const [startMinutesStr, endMinutesStr] = formatted.split(';');
  if (!startMinutesStr || !endMinutesStr) {
    return null;
  }

  const startMinutes = parseInt(startMinutesStr, 10);
  const endMinutes = parseInt(endMinutesStr, 10);
  const startDate = moment(moment().startOf('day')).add(startMinutes, 'minutes');
  const endDate = moment(moment().startOf('day')).add(endMinutes, 'minutes');

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
  };
};
