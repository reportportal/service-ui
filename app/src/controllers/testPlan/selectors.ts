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

import { TestPlanDto } from './constants';

export interface TestPlanState {
  data?: TestPlanDto[];
  isLoading?: boolean;
  activeTestPlan?: TestPlanDto | null;
  isLoadingActive?: boolean;
}

interface RootState {
  testPlan?: TestPlanState;
}

export const testPlanSelector = (state: RootState) => state.testPlan || {};

export const isLoadingSelector = (state: RootState) => Boolean(testPlanSelector(state).isLoading);

export const testPlansSelector = (state: RootState) => testPlanSelector(state).data || [];

export const activeTestPlanSelector = (state: RootState) =>
  testPlanSelector(state).activeTestPlan || null;

export const isLoadingActiveSelector = (state: RootState) =>
  Boolean(testPlanSelector(state).isLoadingActive);

export const testPlanByIdSelector = (testPlanId: string | number) => (state: RootState) => {
  const activeTestPlan = activeTestPlanSelector(state);

  if (activeTestPlan && activeTestPlan.id === Number(testPlanId)) {
    return activeTestPlan;
  }
};
