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

import { RequirementFormRow, RequirementRQ } from '../types';

export const getMeaningfulRequirements = <T extends { value: string }>(requirements?: T[]): T[] =>
  (requirements ?? []).filter(({ value }) => Boolean(value?.trim()));

export const getRequirementIds = (requirements?: RequirementFormRow[]): Set<string> =>
  new Set((requirements ?? []).flatMap(({ id }) => (id ? [id] : [])));

// The server mints ids: only requirements of the loaded test case keep theirs; create and
// duplicate send values only.
export const buildRequirementsRQ = (
  requirements?: RequirementFormRow[],
  persistedIds: Set<string> = new Set(),
): RequirementRQ[] =>
  getMeaningfulRequirements(requirements).map(({ id, value }) =>
    id && persistedIds.has(id) ? { id, value } : { value },
  );
