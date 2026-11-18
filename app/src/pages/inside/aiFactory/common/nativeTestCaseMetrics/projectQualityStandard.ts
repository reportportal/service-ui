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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export interface ProjectQualityStandard {
  name: string;
  description?: string;
  criteria: { id: number; name: string; maxPoints: number; sequence: number }[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeCriterion = (criterion: unknown) => {
  if (!isRecord(criterion)) throw new Error('Invalid Quality Standard criterion');

  const { id, name, maxPoints, sequence } = criterion;
  if (
    typeof id !== 'number' ||
    !Number.isSafeInteger(id) ||
    typeof name !== 'string' ||
    !name.trim() ||
    typeof maxPoints !== 'number' ||
    !Number.isSafeInteger(maxPoints) ||
    maxPoints < 0 ||
    typeof sequence !== 'number' ||
    !Number.isSafeInteger(sequence)
  ) {
    throw new Error('Invalid Quality Standard criterion');
  }

  return { id, name, maxPoints, sequence };
};

const normalizeProjectQualityStandard = (value: unknown): ProjectQualityStandard => {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    !Array.isArray(value.criteria)
  ) {
    throw new Error('Invalid project Quality Standard');
  }

  return {
    name: value.name,
    description: typeof value.description === 'string' ? value.description.trim() : undefined,
    criteria: value.criteria.map(normalizeCriterion).sort((a, b) => a.sequence - b.sequence),
  };
};

export const loadProjectQualityStandard = async (
  projectKey: string,
  signal: AbortSignal,
): Promise<ProjectQualityStandard | null> => {
  const response = await fetch<unknown>(
    URLS.projectQualityStandard(projectKey),
    { signal, validateStatus: (status) => (status >= 200 && status < 300) || status === 404 },
    true,
  );

  return response.status === 404 ? null : normalizeProjectQualityStandard(response.data);
};
