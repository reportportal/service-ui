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
import {
  hasStepContent,
  hasStepsPreconditionContent,
  hasScenarioContent,
} from 'pages/inside/common/scenarioUtils';

import { ManualScenario, Tag } from 'types/testCase';

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
