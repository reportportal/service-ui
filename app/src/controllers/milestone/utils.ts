import type { TestPlanDto } from 'controllers/testPlan/types';

import type { TmsTestPlanInMilestoneRS } from './constants';

export const milestoneTestPlansAsTestPlanDtos = (
  plans: TmsTestPlanInMilestoneRS[] | undefined,
  milestoneId: number,
): TestPlanDto[] =>
  (plans ?? []).map((plan) => ({
    id: plan.id,
    displayId: plan.displayId,
    name: plan.name,
    description: plan.description,
    milestoneId: plan.milestoneId ?? milestoneId,
    executionStatistic: {
      covered: plan.executionStatistic?.covered ?? 0,
      total: plan.executionStatistic?.total ?? 0,
    },
  }));
