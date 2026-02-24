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
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';

import { Attachment, ManualScenario, Step, Tag } from '../types';

export const hasStepContent = (step: Step) =>
  !!step?.instructions || !!step?.expectedResult || !isEmpty(step?.attachments);

export const hasStepsPreconditionContent = (preconditions: {
  value?: string;
  attachments?: Attachment[];
}) => {
  return Boolean(preconditions?.value || !isEmpty(preconditions?.attachments));
};

export const hasScenarioContent = (manualScenario: ManualScenario) => {
  return Boolean(
    manualScenario?.preconditions?.value ||
    manualScenario?.instructions ||
    manualScenario?.expectedResult,
  );
};

export const checkScenario = (manualScenario: ManualScenario | undefined): boolean => {
  if (!manualScenario) return true;

  const hasRequirements = !isEmpty(manualScenario.requirements);
  const hasPreconditions = hasStepsPreconditionContent(manualScenario.preconditions);

  if (manualScenario.manualScenarioType === TestCaseManualScenario.STEPS) {
    const hasSteps = manualScenario.steps?.some(hasStepContent);

    return !hasRequirements && !hasPreconditions && !hasSteps;
  }

  const hasScenario = hasScenarioContent(manualScenario);

  return !hasRequirements && !hasScenario && isEmpty(manualScenario.attachments);
};

export const convertKeysToTags = (keys: string[]): Tag[] => {
  return keys.map((key, index) => ({
    id: -Date.now() - index,
    key,
  }));
};
