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

import { differenceInCalendarDays, format, isValid, parse, parseISO, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const parseDateOnly = (value: string): Date | null => {
  if (!value) return null;
  const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsedDate) ? parsedDate : null;
};

export const toDateOnlyString = (date: Date): string => format(date, 'yyyy-MM-dd');

export const dateOnlyStringToUtcIso = (value: string): string | null => {
  const parsedDate = parseDateOnly(value);
  if (!parsedDate) return null;
  return new Date(
    Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
  ).toISOString();
};

// Milestone dates are calendar dates sent as UTC midnight (dateOnlyStringToUtcIso), so they are read
// back by their UTC calendar components: the browser time zone must not move them by a day.
export const isoToDateOnlyFormValue = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const parsedDate = parseISO(iso);
  return isValid(parsedDate) ? parsedDate.toISOString().slice(0, 10) : '';
};

const isoToCalendarDate = (iso: string | null | undefined): Date | null =>
  parseDateOnly(isoToDateOnlyFormValue(iso));

export const formatIsoDateShort = (iso: string | null | undefined): string => {
  const date = isoToCalendarDate(iso);
  return date ? format(date, 'P', { locale: enUS }) : '';
};

export const formatIsoDateShortDashed = (iso: string | null | undefined): string => {
  const date = isoToCalendarDate(iso);
  return date ? format(date, 'MM-dd-yyyy', { locale: enUS }) : '';
};

export const isIsoOnCalendarDay = (iso: string | null | undefined, day: Date): boolean => {
  const dateOnly = isoToDateOnlyFormValue(iso);
  return !!dateOnly && dateOnly === toDateOnlyString(day);
};

export const daysUntilIsoDate = (iso: string | null | undefined, today: Date): number | null => {
  const date = isoToCalendarDate(iso);
  return date ? differenceInCalendarDays(date, startOfDay(today)) : null;
};

export const isDeadlineBeforeStart = (startDate: string, endDate: string | undefined): boolean => {
  const trimmedEndDate = endDate?.trim();

  return !!trimmedEndDate && trimmedEndDate < startDate;
};
