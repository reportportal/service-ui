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

import { isEqual } from 'es-toolkit';

import type { TestPlanFormValues } from 'pages/inside/testPlansPage/testPlanModals/testPlanModal';

type BuildEditedFieldsConditionInitial = {
  name: string;
  description?: string;
  attributes: TestPlanFormValues['attributes'];
};

export const buildEditedFieldsCondition = (
  initial: BuildEditedFieldsConditionInitial,
  submitted: TestPlanFormValues,
): string => {
  const edited: string[] = [];

  if (initial.name !== submitted.name) {
    edited.push('name');
  }
  if ((initial.description ?? '') !== (submitted.description ?? '')) {
    edited.push('description');
  }
  if (!isEqual(initial.attributes ?? [], submitted.attributes ?? [])) {
    edited.push('attributes');
  }

  const sortedEdited = [...edited].sort((a, b) => a.localeCompare(b));

  return sortedEdited.join('#');
};
