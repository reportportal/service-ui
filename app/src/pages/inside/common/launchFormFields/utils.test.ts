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

import { getTestPlanMilestoneName, getTestPlanOptionLabel, getTestPlanSearchParams } from './utils';

describe('getTestPlanOptionLabel', () => {
  it('shows "Plan name, Milestone name" when the API returns the Milestone', () => {
    expect(
      getTestPlanOptionLabel({
        name: 'Smoke regression',
        milestone: { id: 6, name: 'Release 24.2 Beta' },
      }),
    ).toBe('Smoke regression, Release 24.2 Beta');
  });

  it('shows only the plan name for a plan without a Milestone', () => {
    expect(getTestPlanOptionLabel({ name: 'Smoke regression' })).toBe('Smoke regression');
  });

  it('shows only the plan name when the API returns the Milestone without a name', () => {
    expect(getTestPlanOptionLabel({ name: 'Smoke regression', milestone: { id: 6 } })).toBe(
      'Smoke regression',
    );
  });

  it('returns an empty string for an empty field value', () => {
    expect(getTestPlanOptionLabel(null)).toBe('');
    expect(getTestPlanOptionLabel(undefined)).toBe('');
    expect(getTestPlanOptionLabel('')).toBe('');
  });
});

describe('getTestPlanMilestoneName', () => {
  it('returns the Milestone name or an empty string', () => {
    expect(getTestPlanMilestoneName({ name: 'Plan', milestone: { id: 6, name: 'Beta' } })).toBe(
      'Beta',
    );
    expect(getTestPlanMilestoneName({ name: 'Plan' })).toBe('');
    expect(getTestPlanMilestoneName(null)).toBe('');
  });
});

describe('getTestPlanSearchParams', () => {
  it('searches by plan name or Milestone name', () => {
    expect(getTestPlanSearchParams('Smoke regression, Release')).toEqual({
      'filter.cnt.nameOrMilestoneName': 'Smoke regression, Release',
      pageSize: 50,
    });
  });

  it('sends only the page size without a search value', () => {
    expect(getTestPlanSearchParams('')).toEqual({ pageSize: 50 });
  });
});
