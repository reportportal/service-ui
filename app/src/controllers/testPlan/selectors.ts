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

interface TestPlanState {
  data?: TestPlanDto[];
  isLoading?: boolean;
}

interface RootState {
  testPlan?: TestPlanState;
}

export const testPlanSelector = (state: RootState): TestPlanState => state.testPlan || {};

export const isLoadingSelector = (state: RootState): boolean =>
  Boolean(testPlanSelector(state).isLoading);

export const testPlansSelector = (state: RootState): TestPlanDto[] =>
  testPlanSelector(state).data || [];
