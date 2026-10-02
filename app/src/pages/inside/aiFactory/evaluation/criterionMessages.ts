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

import type { MessageDescriptor } from 'react-intl';

import { AiCriterionKey, CriterionKey } from 'types/aiFactory';

import { messages } from './messages';

export const CRITERION_MESSAGE: Record<AiCriterionKey, MessageDescriptor> = {
  [CriterionKey.ATOMICITY]: messages.criterionAtomicity,
  [CriterionKey.CLEAR_STEPS]: messages.criterionClearSteps,
  [CriterionKey.EXPECTED_RESULTS]: messages.criterionExpectedResults,
  [CriterionKey.NO_INVENTED_LOGIC]: messages.criterionNoInventedLogic,
  [CriterionKey.NO_INVENTED_UI]: messages.criterionNoInventedUi,
  [CriterionKey.COHERENCE]: messages.criterionCoherence,
};
