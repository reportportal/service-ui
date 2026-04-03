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

import { format } from 'date-fns';

import { DATE_FORMAT } from 'common/constants/timeDateFormat';

import {
  START_TIME_PRESETS,
  DAYS_IN_WEEK,
  DAYS_IN_MONTH,
  DAYS_IN_QUARTER,
  END_OF_DAY_HOURS,
  END_OF_DAY_MINUTES,
  END_OF_DAY_SECONDS,
  END_OF_DAY_MS,
} from '../constants';

export const getPresetDateRange = (preset: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(END_OF_DAY_HOURS, END_OF_DAY_MINUTES, END_OF_DAY_SECONDS, END_OF_DAY_MS);

  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  switch (preset) {
    case START_TIME_PRESETS.TODAY:
      break;
    case START_TIME_PRESETS.LAST_7_DAYS:
      startDate.setDate(startDate.getDate() - DAYS_IN_WEEK);
      break;
    case START_TIME_PRESETS.LAST_30_DAYS:
      startDate.setDate(startDate.getDate() - DAYS_IN_MONTH);
      break;
    case START_TIME_PRESETS.LAST_90_DAYS:
      startDate.setDate(startDate.getDate() - DAYS_IN_QUARTER);
      break;
    default:
      break;
  }

  return { startDate, endDate };
};

export const formatDateDisplay = (date: Date): string => format(date, DATE_FORMAT);
