/*
 * Copyright 2025 EPAM Systems
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

export const GET_TEST_PLANS = 'getTestPlans' as const;
export const GET_TEST_PLAN = 'getTestPlan' as const;
export const TEST_PLANS_NAMESPACE = 'testPlans' as const;
export const ACTIVE_TEST_PLAN_NAMESPACE = 'activeTestPlan' as const;
export const defaultQueryParams = {
  limit: 1000,
  sortBy: 'createdDate,desc',
};
export const defaultSortParam = 'createdDate,desc';

export type TestPlanDto = {
  id: number;
  name: string;
  totalTestCases: number;
  coveredTestCases: number;
  description?: string;
};
