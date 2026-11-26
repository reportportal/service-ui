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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { isEmpty } from 'es-toolkit/compat';

import { milestoneTestPlansAsTestPlanDtos } from 'controllers/milestone';
import type { TmsMilestonePageRS } from 'controllers/milestone';
import type { TestPlanDto } from 'controllers/testPlan/types';

const MILESTONES_PAGE_SIZE = 100;

const fetchMilestonesPage = (projectKey: string, offset: number) =>
  fetch<TmsMilestonePageRS>(
    URLS.tmsMilestone(projectKey, {
      limit: MILESTONES_PAGE_SIZE,
      offset,
    }),
  );

const pageTestPlans = (response: TmsMilestonePageRS): TestPlanDto[] =>
  (response.content ?? []).flatMap((milestone) =>
    milestoneTestPlansAsTestPlanDtos(milestone.testPlans, milestone.id),
  );

// Test plans linked to milestones: the first page tells how many pages there are, the rest are
// requested in parallel instead of one after another.
export const fetchAllMilestoneTestPlans = async (projectKey: string): Promise<TestPlanDto[]> => {
  const firstPage = await fetchMilestonesPage(projectKey, 0);

  if (isEmpty(firstPage.content)) {
    return [];
  }

  const totalPages = firstPage.page?.totalPages ?? 1;
  const restPages = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
      fetchMilestonesPage(projectKey, (index + 1) * MILESTONES_PAGE_SIZE),
    ),
  );

  return [firstPage, ...restPages].flatMap(pageTestPlans);
};

// Whether at least one test plan is linked to a milestone; stops at the first page that has one.
export const hasMilestoneTestPlans = async (projectKey: string, offset = 0): Promise<boolean> => {
  const response = await fetchMilestonesPage(projectKey, offset);

  if (isEmpty(response.content)) {
    return false;
  }

  if (!isEmpty(pageTestPlans(response))) {
    return true;
  }

  return response.page.number < response.page.totalPages
    ? hasMilestoneTestPlans(projectKey, offset + response.content.length)
    : false;
};

export const filterTestPlansByName = (testPlans: TestPlanDto[], search: string): TestPlanDto[] => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return testPlans;
  }

  return testPlans.filter((plan) => plan.name.toLowerCase().includes(query));
};
