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

import type { ReducedPipelineSection } from 'controllers/aiFactory/pipelines';

interface GradeCriterion {
  name: string;
  score: number;
  max_score: number;
  failure_reasons: string[];
}

interface GradedCase {
  name: string;
  line?: number;
  total_score: number;
  criterias: GradeCriterion[];
}

interface GradeReport {
  total_score: number;
  max_score: number;
  case_count: number;
  test_cases: GradedCase[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isScore = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;

const isCriterion = (value: unknown): value is GradeCriterion =>
  isRecord(value) &&
  isText(value.name) &&
  isPositiveInteger(value.max_score) &&
  isScore(value.score, value.max_score) &&
  Array.isArray(value.failure_reasons) &&
  value.failure_reasons.every(isText);

const isGradedCase = (value: unknown, max: number): value is GradedCase =>
  isRecord(value) &&
  isText(value.name) &&
  (value.line === undefined || isPositiveInteger(value.line)) &&
  isScore(value.total_score, max) &&
  Array.isArray(value.criterias) &&
  value.criterias.length > 0 &&
  value.criterias.every(isCriterion) &&
  new Set(value.criterias.map(({ name }) => name)).size === value.criterias.length;

const isGradeReport = (value: unknown): value is GradeReport => {
  if (!isRecord(value) || !isPositiveInteger(value.max_score)) return false;

  const { max_score: max, case_count: count, test_cases: cases } = value;
  return (
    isScore(value.total_score, max) &&
    isPositiveInteger(count) &&
    Array.isArray(cases) &&
    cases.length === count &&
    cases.every((testCase) => isGradedCase(testCase, max))
  );
};

export const readLegacyGradeReport = (
  sections: ReducedPipelineSection[] | undefined,
): GradeReport | undefined => {
  const transcript = sections?.find(({ key, role }) => key === 'transcript' && role === 'DETAILS');
  if (!transcript) return undefined;

  // The grader's final message is followed by usage events. Tool calls may contain drafts.
  const message = [...transcript.rows].reverse().find(({ cells }) => cells.kind === 'Message');
  if (!message) return undefined;

  const fullMessage = message.details.find(({ heading }) => heading === 'Message')?.items[0];
  const text = fullMessage ?? message.cells.action;
  const json = text
    ?.replace(/^Message — /, '')
    .trim()
    .match(/^```json\s+(\{[\s\S]*\})\s*```$/)?.[1];
  if (!json) return undefined;

  try {
    const value: unknown = JSON.parse(json);
    return isGradeReport(value) ? value : undefined;
  } catch {
    return undefined;
  }
};
