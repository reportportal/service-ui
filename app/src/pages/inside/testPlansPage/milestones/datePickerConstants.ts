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

import { addDays, addMonths, nextDay, startOfDay } from 'date-fns';

import { parseDateOnly, toDateOnlyString } from './milestoneDateUtils';

export const tomorrowDateOnly = (): string => toDateOnlyString(addDays(startOfDay(new Date()), 1));

export const nextMondayDateOnly = (): string =>
  toDateOnlyString(nextDay(startOfDay(new Date()), 1));

const anchorDateForEndShortcuts = (startDate: string | undefined): Date => {
  const parsed = startDate ? parseDateOnly(startDate) : null;
  if (parsed) {
    return startOfDay(parsed);
  }
  return startOfDay(new Date());
};

export const endDateDaysAfterStart = (startDate: string | undefined, days: number): string =>
  toDateOnlyString(addDays(anchorDateForEndShortcuts(startDate), days));

export const endDateMonthsAfterStart = (startDate: string | undefined, months: number): string =>
  toDateOnlyString(addMonths(anchorDateForEndShortcuts(startDate), months));
