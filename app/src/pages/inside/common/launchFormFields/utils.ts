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

import { TestPlanOption } from './types';

type TestPlanLabelSource = Pick<TestPlanOption, 'name' | 'milestone'> | null | undefined | '';

/**
 * The Milestone name of a Test Plan, if the API returned it (service-api adds `milestone` to TmsTestPlanRS).
 */
export const getTestPlanMilestoneName = (testPlan: TestPlanLabelSource): string =>
  (testPlan && testPlan.milestone?.name) || '';

/**
 * The value shown in a Test Plan field: "Plan name, Milestone name", or only the plan name
 * when the plan has no Milestone or the API did not return its name.
 */
export const getTestPlanOptionLabel = (testPlan: TestPlanLabelSource): string => {
  if (!testPlan) {
    return '';
  }

  const milestoneName = getTestPlanMilestoneName(testPlan);
  const name = testPlan.name || '';

  return milestoneName ? `${name}, ${milestoneName}` : name;
};

/**
 * Generate UUID with fallback for non-secure contexts (HTTP)
 * crypto.randomUUID() requires HTTPS or localhost, this provides a fallback
 */
export const generateUUID = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for non-HTTPS environments - Math.random() is acceptable here as this UUID
    // is only used for temporary client-side request identification, not for security operations
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`; // NOSONAR
  }
};
