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

import { isNil } from 'es-toolkit';

import { TestPlanOption } from 'pages/inside/common/launchFormFields/types';

export enum TestPlanChange {
  CHANGED = 'changed',
  REMOVED = 'removed',
}

type TestPlanValue = Pick<TestPlanOption, 'id'> | null | undefined | '';

const getTestPlanId = (testPlan: TestPlanValue) => (testPlan ? testPlan.id : null);

/**
 * Compares the Test Plan the launch was opened with and the Test Plan selected in the form.
 * Returns null when the Test Plan is the same or when the launch had no Test Plan:
 * the warnings cover only changing or removing an existing Test Plan.
 */
export const getTestPlanChange = (
  initialTestPlan: TestPlanValue,
  currentTestPlan: TestPlanValue,
): TestPlanChange | null => {
  const initialId = getTestPlanId(initialTestPlan);
  const currentId = getTestPlanId(currentTestPlan);

  if (isNil(initialId) || initialId === currentId) {
    return null;
  }

  if (isNil(currentId)) {
    return TestPlanChange.REMOVED;
  }

  return TestPlanChange.CHANGED;
};
