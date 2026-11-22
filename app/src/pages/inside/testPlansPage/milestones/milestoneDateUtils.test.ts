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

import {
  dateOnlyStringToUtcIso,
  daysUntilIsoDate,
  formatIsoDateShortDashed,
  isIsoOnCalendarDay,
  isoToDateOnlyFormValue,
} from './milestoneDateUtils';
import { daysLeftUntil } from './milestonesTable/milestoneUtils';

describe('milestoneDateUtils (west of UTC)', () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/New_York';
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  test('reads the stored date by its UTC calendar day', () => {
    expect(isoToDateOnlyFormValue('2026-03-10T00:00:00.000Z')).toBe('2026-03-10');
    expect(formatIsoDateShortDashed('2026-03-10T00:00:00Z')).toBe('03-10-2026');
  });

  test('edit round trip keeps the same day', () => {
    const iso = dateOnlyStringToUtcIso('2026-03-10');

    expect(iso).toBe('2026-03-10T00:00:00.000Z');
    expect(dateOnlyStringToUtcIso(isoToDateOnlyFormValue(iso))).toBe(iso);
  });

  test('compares with the local today by calendar day', () => {
    const localToday = new Date(2026, 2, 10, 22, 0);

    expect(isIsoOnCalendarDay('2026-03-10T00:00:00.000Z', localToday)).toBe(true);
    expect(isIsoOnCalendarDay('2026-03-11T00:00:00.000Z', localToday)).toBe(false);
    expect(daysUntilIsoDate('2026-03-24T00:00:00.000Z', localToday)).toBe(14);
  });

  test('null or invalid dates are rendered as empty, not thrown', () => {
    expect(isoToDateOnlyFormValue(null)).toBe('');
    expect(formatIsoDateShortDashed(null)).toBe('');
    expect(formatIsoDateShortDashed('not a date')).toBe('');
    expect(isIsoOnCalendarDay(null, new Date())).toBe(false);
    expect(daysLeftUntil(null)).toBeNull();
  });
});
