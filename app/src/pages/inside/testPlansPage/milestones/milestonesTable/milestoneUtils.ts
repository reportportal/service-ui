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

import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

import type { TmsMilestoneRS, TmsTestPlanInMilestoneRS } from 'controllers/milestone';
import type { TestPlanDto } from 'controllers/testPlan';

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

export const aggregateMilestoneCoverage = (
  milestone: TmsMilestoneRS,
): { coveredPct: number; plansCount: number } => {
  const plans = milestone.testPlans ?? [];
  let covered = 0;
  let total = 0;

  plans.forEach((plan) => {
    covered += plan.executionStatistic?.covered ?? 0;
    total += plan.executionStatistic?.total ?? 0;
  });

  const coveredPct = total > 0 ? Math.round((covered / total) * 100) : 0;

  return { coveredPct, plansCount: plans.length };
};

export const daysLeftUntil = (endDateIso: string): number =>
  Math.max(0, differenceInCalendarDays(startOfDay(parseISO(endDateIso)), startOfDay(new Date())));
