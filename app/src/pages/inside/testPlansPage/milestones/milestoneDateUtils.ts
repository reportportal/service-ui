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

import { format, isValid, parse, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatIsoDateShort = (iso: string): string =>
  format(parseISO(iso), 'P', { locale: enUS });

export const formatIsoDateShortDashed = (iso: string): string =>
  format(parseISO(iso), 'MM-dd-yyyy', { locale: enUS });

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

export const isoToDateOnlyFormValue = (iso: string): string => {
  const parsedDate = parseISO(iso);
  return isValid(parsedDate) ? toDateOnlyString(parsedDate) : '';
};
