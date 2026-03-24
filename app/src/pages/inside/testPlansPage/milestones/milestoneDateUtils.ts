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

export const parseDateOnly = (value: string): Date | null => {
  if (!value) return null;
  const d = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : null;
};

export const toDateOnlyString = (date: Date): string => format(date, 'yyyy-MM-dd');

export const dateOnlyStringToUtcIso = (value: string): string | null => {
  const d = parseDateOnly(value);
  if (!d) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
};
