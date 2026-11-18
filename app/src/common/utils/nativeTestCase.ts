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

import type { TestCaseAiExtension } from 'types/aiFactory';
import type { TestCase, TestCaseCriterion, TestCaseMetrics, TestCaseStatus } from 'types/testCase';

const LEGACY_AI_FIELDS: (keyof TestCaseAiExtension)[] = [
  'ai',
  'lifecycle',
  'evaluationSummary',
  'costSummary',
  'review',
  'automation',
  'blockedPlans',
];

export interface NativeTestCaseSummary {
  isAi: boolean;
  status?: TestCaseStatus;
  score?: number;
  isObsolete: boolean;
  model?: string;
  costUsd?: number;
  metrics?: TestCaseMetrics;
  unsentReviewComments?: number;
}

export const hasNativeTestCaseData = (testCase?: Partial<TestCase> | null): boolean =>
  Boolean(
    testCase &&
    ['origin', 'status', 'defaultVersionId', 'metrics'].some((field) =>
      Object.prototype.hasOwnProperty.call(testCase, field),
    ),
  );

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const getMetricText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const getMetricNumber = (value: unknown): number | undefined =>
  isNonNegativeNumber(value) ? value : undefined;

const getIterationId = (value: unknown): number | undefined =>
  Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : undefined;

const normalizeCriterion = (criterion: TestCaseCriterion): TestCaseCriterion | undefined => {
  const name = getMetricText(criterion?.name);
  if (!name) return undefined;
  return {
    name,
    criterionId: getIterationId(criterion.criterionId),
    score: getMetricNumber(criterion.score),
    maxPoints: getMetricNumber(criterion.maxPoints),
  };
};

export const getNativeTestCaseMetrics = (
  metrics?: TestCaseMetrics,
): TestCaseMetrics | undefined => {
  if (!metrics) return undefined;
  return {
    overallScore: getMetricNumber(metrics.overallScore),
    obsolete: metrics.obsolete === true,
    evaluatedAt: getMetricNumber(metrics.evaluatedAt),
    criteria: Array.isArray(metrics.criteria)
      ? metrics.criteria.map(normalizeCriterion).filter(Boolean)
      : [],
    tokensIn: getMetricNumber(metrics.tokensIn),
    tokensOut: getMetricNumber(metrics.tokensOut),
    model: getMetricText(metrics.model),
    skill: getMetricText(metrics.skill),
    costUsd: getMetricNumber(metrics.costUsd),
    pipelineIterationId: getIterationId(metrics.pipelineIterationId),
    pipelineIterationNumber: getIterationId(metrics.pipelineIterationNumber),
  };
};

export const getNativeTestCaseSummary = (
  testCase?: Partial<TestCase> | null,
): NativeTestCaseSummary | undefined => {
  if (!hasNativeTestCaseData(testCase)) return undefined;
  const isAi = testCase?.origin === 'AI';
  const metrics = isAi ? getNativeTestCaseMetrics(testCase?.metrics) : undefined;
  return {
    isAi,
    status:
      testCase?.status === 'DRAFT' || testCase?.status === 'READY' ? testCase.status : undefined,
    score: isNonNegativeNumber(metrics?.overallScore) ? metrics.overallScore : undefined,
    isObsolete: metrics?.obsolete === true,
    model: typeof metrics?.model === 'string' && metrics.model.trim() ? metrics.model : undefined,
    costUsd: metrics?.costUsd,
    metrics,
    unsentReviewComments: isAi ? getIterationId(testCase?.unsentReviewComments) : undefined,
  };
};

export const getTestCasePresentation = <T extends Partial<TestCase>>(
  testCase: T,
  isAiFactoryEnabled: boolean,
): T => {
  if (!isAiFactoryEnabled || !hasNativeTestCaseData(testCase)) return testCase;
  const presentation = { ...testCase };
  LEGACY_AI_FIELDS.forEach((field) => {
    delete presentation[field];
  });
  return presentation;
};
