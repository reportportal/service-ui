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

import { fetch } from 'common/utils';

import {
  fetchAllMilestoneTestPlans,
  filterTestPlansByNameOrMilestone,
  getTestPlanOptionLabel,
} from './fetchMilestoneTestPlans';
import type { TestPlanWithMilestone } from './types';

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const fetchMock = fetch as jest.Mock;

const makePlan = (id: number, name: string, milestoneName?: string): TestPlanWithMilestone => ({
  id,
  displayId: `TP-${id}`,
  name,
  milestoneName,
  executionStatistic: { covered: 0, total: 0 },
});

const betaSmoke = makePlan(1, 'Smoke regression', 'Release 24.2 Beta');
const stageSmoke = makePlan(2, 'Smoke regression', 'Release 24.2 Stage');
const stageFull = makePlan(3, 'Full regression', 'Release 24.2 Stage');
const noMilestone = makePlan(4, 'Payments');

describe('getTestPlanOptionLabel', () => {
  it('joins the plan name and the milestone name', () => {
    expect(getTestPlanOptionLabel(stageSmoke)).toBe('Smoke regression, Release 24.2 Stage');
  });

  it('returns only the plan name when the plan has no milestone', () => {
    expect(getTestPlanOptionLabel(noMilestone)).toBe('Payments');
  });

  it('returns an empty string for no value', () => {
    expect(getTestPlanOptionLabel(null)).toBe('');
  });
});

describe('filterTestPlansByNameOrMilestone', () => {
  const plans = [betaSmoke, stageSmoke, stageFull, noMilestone];

  it('returns all plans for an empty search', () => {
    expect(filterTestPlansByNameOrMilestone(plans, '  ')).toEqual(plans);
  });

  it('matches the plan name', () => {
    expect(filterTestPlansByNameOrMilestone(plans, 'smoke')).toEqual([betaSmoke, stageSmoke]);
  });

  it('matches the milestone name', () => {
    expect(filterTestPlansByNameOrMilestone(plans, 'STAGE')).toEqual([stageSmoke, stageFull]);
  });

  it('matches the label shown in the field after selection', () => {
    expect(filterTestPlansByNameOrMilestone(plans, getTestPlanOptionLabel(stageSmoke))).toEqual([
      stageSmoke,
    ]);
  });
});

describe('fetchAllMilestoneTestPlans', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it('adds the milestone name to every test plan of every page', async () => {
    fetchMock
      .mockResolvedValueOnce({
        content: [
          {
            id: 10,
            name: 'Release 24.2 Beta',
            testPlans: [{ id: 1, displayId: 'TP-1', name: 'Smoke regression' }],
          },
        ],
        page: { number: 1, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [
          {
            id: 20,
            name: 'Release 24.2 Stage',
            testPlans: [{ id: 2, displayId: 'TP-2', name: 'Smoke regression' }],
          },
        ],
        page: { number: 2, totalPages: 2 },
      });

    const plans = await fetchAllMilestoneTestPlans('project');

    expect(
      plans.map(({ id, milestoneId, milestoneName }) => [id, milestoneId, milestoneName]),
    ).toEqual([
      [1, 10, 'Release 24.2 Beta'],
      [2, 20, 'Release 24.2 Stage'],
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
