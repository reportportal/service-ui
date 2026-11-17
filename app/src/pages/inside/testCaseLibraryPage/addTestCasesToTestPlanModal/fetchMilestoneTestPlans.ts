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

export const fetchAllMilestoneTestPlans = async (
  projectKey: string,
  fetchedTestPlans: TestPlanDto[] = [],
  fetchedMilestonesCount = 0,
): Promise<TestPlanDto[]> => {
  const response = await fetch<TmsMilestonePageRS>(
    URLS.tmsMilestone(projectKey, {
      limit: 100,
      offset: fetchedMilestonesCount,
    }),
  );

  if (isEmpty(response.content)) {
    return fetchedTestPlans;
  }

  const pageTestPlans = response.content.flatMap((milestone) =>
    milestoneTestPlansAsTestPlanDtos(milestone.testPlans, milestone.id),
  );
  const testPlans = [...fetchedTestPlans, ...pageTestPlans];
  const nextMilestonesCount = fetchedMilestonesCount + response.content.length;

  if (response.page.number < response.page.totalPages) {
    return fetchAllMilestoneTestPlans(projectKey, testPlans, nextMilestonesCount);
  }

  return testPlans;
};

export const filterTestPlansByName = (testPlans: TestPlanDto[], search: string): TestPlanDto[] => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return testPlans;
  }

  return testPlans.filter((plan) => plan.name.toLowerCase().includes(query));
};
