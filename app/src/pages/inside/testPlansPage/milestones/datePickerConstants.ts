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

import { parseDateOnly, toDateOnlyString } from './milestoneDateUtils';

const todayMidnightLocal = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const tomorrowDateOnly = (): string => {
  const d = todayMidnightLocal();
  d.setDate(d.getDate() + 1);
  return toDateOnlyString(d);
};

/** If today is Monday, the Monday one week later; otherwise the next calendar Monday. */
export const nextMondayDateOnly = (): string => {
  const d = todayMidnightLocal();
  const day = d.getDay();
  let add: number;
  if (day === 0) add = 1;
  else if (day === 1) add = 7;
  else add = 8 - day;
  d.setDate(d.getDate() + add);
  return toDateOnlyString(d);
};

const anchorDateForEndShortcuts = (startDate: string | undefined): Date => {
  const parsed = startDate ? parseDateOnly(startDate) : null;
  if (parsed) {
    const d = new Date(parsed);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return todayMidnightLocal();
};

export const endDateDaysAfterStart = (startDate: string | undefined, days: number): string => {
  const d = anchorDateForEndShortcuts(startDate);
  d.setDate(d.getDate() + days);
  return toDateOnlyString(d);
};

export const endDateMonthsAfterStart = (startDate: string | undefined, months: number): string => {
  const d = anchorDateForEndShortcuts(startDate);
  d.setMonth(d.getMonth() + months);
  return toDateOnlyString(d);
};
