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

import type { IterationSummaryRS } from 'types/aiFactory';

export const parseQueryId = (value: unknown): number | null => {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getLatestPair = (iterations: Array<Pick<IterationSummaryRS, 'id' | 'number'>>) => {
  const [candidate, baseline] = [...iterations].sort((left, right) => right.number - left.number);
  return baseline && candidate ? { baselineId: baseline.id, candidateId: candidate.id } : null;
};
