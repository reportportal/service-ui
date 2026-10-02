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

import { CriterionKey } from 'types/aiFactory';
import type { AiCriterionKey, GradeCriterionRS } from 'types/aiFactory';

const CRITERION_KEYS = new Set<string>(Object.values(CriterionKey));
const CRITERION_ORDER = new Map<AiCriterionKey, number>(
  Object.values(CriterionKey).map((criterionKey, index) => [criterionKey, index]),
);

export const normalizeCriteria = (value: unknown): GradeCriterionRS[] =>
  Array.isArray(value)
    ? value
        .filter(
          (criterion): criterion is GradeCriterionRS =>
            typeof criterion === 'object' &&
            criterion !== null &&
            CRITERION_KEYS.has((criterion as GradeCriterionRS).key) &&
            Number.isFinite((criterion as GradeCriterionRS).score) &&
            Number.isFinite((criterion as GradeCriterionRS).maxScore) &&
            Array.isArray((criterion as GradeCriterionRS).failureReasons),
        )
        .sort(
          (left, right) =>
            (CRITERION_ORDER.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
            (CRITERION_ORDER.get(right.key) ?? Number.MAX_SAFE_INTEGER),
        )
    : [];
