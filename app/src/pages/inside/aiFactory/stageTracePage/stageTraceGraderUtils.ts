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

export interface TraceGraderCriterion {
  name: string;
  score: number;
  max: number;
}
export interface TraceGraderData {
  caseId?: string;
  total?: number;
  before?: number;
  after?: number;
  criteria?: TraceGraderCriterion[];
}
const MAX_STRUCTURED_CRITERIA = 100;
const MAX_CRITERION_NAME_LENGTH = 512;
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isCriterion = (value: unknown): value is TraceGraderCriterion => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const criterion = value as Record<string, unknown>;
  return (
    typeof criterion.name === 'string' &&
    criterion.name.length <= MAX_CRITERION_NAME_LENGTH &&
    isFiniteNumber(criterion.score) &&
    isFiniteNumber(criterion.max)
  );
};
export const readTraceGraderData = (raw: Record<string, unknown>): TraceGraderData | undefined => {
  const data: TraceGraderData = {};
  if (typeof raw.caseId === 'string') data.caseId = raw.caseId;
  if (isFiniteNumber(raw.total)) data.total = raw.total;
  if (isFiniteNumber(raw.before)) data.before = raw.before;
  if (isFiniteNumber(raw.after)) data.after = raw.after;
  if (
    Array.isArray(raw.criteria) &&
    raw.criteria.length <= MAX_STRUCTURED_CRITERIA &&
    raw.criteria.every(isCriterion)
  )
    data.criteria = raw.criteria;
  return Object.keys(data).length ? data : undefined;
};
export const getCriterionRows = (criteria: TraceGraderCriterion[] = []) => {
  const occurrences = new Map<string, number>();
  return criteria.map((criterion) => {
    const occurrence = occurrences.get(criterion.name) ?? 0;
    occurrences.set(criterion.name, occurrence + 1);
    return { ...criterion, key: `${criterion.name}:${occurrence}` };
  });
};
