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

import { isEmpty } from 'es-toolkit/compat';

export const hasStepContent = <
  T extends { instructions?: string; expectedResult?: string; attachments?: unknown[] },
>(
  step: T,
) => !!step?.instructions?.trim() || !!step?.expectedResult?.trim() || !isEmpty(step?.attachments);

export const hasStepsPreconditionContent = <T extends { value?: string; attachments?: unknown[] }>(
  preconditions?: T,
) => {
  return Boolean(preconditions?.value?.trim() || !isEmpty(preconditions?.attachments));
};

export const hasScenarioContent = <
  T extends {
    preconditions?: { value?: string; attachments?: unknown[] };
    instructions?: string;
    expectedResult?: string;
  },
>(
  manualScenario: T,
) => {
  return (
    hasStepsPreconditionContent(manualScenario?.preconditions) ||
    !!manualScenario?.instructions?.trim() ||
    !!manualScenario?.expectedResult?.trim()
  );
};
