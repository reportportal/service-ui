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

import {
  AutomationStatus,
  Lifecycle,
  SkipReason,
  type AiAutomationStatus,
  type AiLifecycle,
  type AutomateAcceptedRS,
  type AutomationEnvironmentsRS,
  type TestCaseAiExtension,
} from 'types/aiFactory';

export interface AutomationCandidate {
  id: number;
  displayId?: string;
  name?: string;
  lifecycle?: AiLifecycle;
  review?: TestCaseAiExtension['review'];
  automation?: { status: AiAutomationStatus };
}

export interface SkippedAutomationCandidate extends AutomationCandidate {
  reason: SkipReason;
}

export interface AutomationSelection {
  eligible: AutomationCandidate[];
  skipped: SkippedAutomationCandidate[];
  requiresReautomation: boolean;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export const getAutomationSkipReason = (testCase: AutomationCandidate): SkipReason | null => {
  if (testCase.review?.fixRound?.status === 'RUNNING') {
    return SkipReason.FIX_RUNNING;
  }
  if (testCase.automation?.status === AutomationStatus.IN_PROGRESS) {
    return SkipReason.AUTOMATION_IN_PROGRESS;
  }
  if (testCase.lifecycle !== Lifecycle.READY) {
    return SkipReason.NOT_READY;
  }

  return null;
};

export const partitionAutomationSelection = (
  testCases: AutomationCandidate[],
): AutomationSelection => {
  const eligible: AutomationCandidate[] = [];
  const skipped: SkippedAutomationCandidate[] = [];

  testCases.forEach((testCase) => {
    const reason = getAutomationSkipReason(testCase);
    if (reason) {
      skipped.push({ ...testCase, reason });
    } else {
      eligible.push(testCase);
    }
  });

  return {
    eligible,
    skipped,
    requiresReautomation: eligible.some(
      ({ automation }) => automation?.status === AutomationStatus.AUTOMATED,
    ),
  };
};

export const normalizeAutomationEnvironments = (
  value: unknown,
): AutomationEnvironmentsRS | null => {
  const response = asRecord(value);
  if (
    !response ||
    !Array.isArray(response.environments) ||
    response.environments.length === 0 ||
    !response.environments.every(
      (environment) => typeof environment === 'string' && environment.trim().length > 0,
    ) ||
    typeof response.default !== 'string' ||
    !response.environments.includes(response.default)
  ) {
    return null;
  }

  return {
    environments: [...new Set(response.environments)],
    default: response.default,
  };
};

const isSkippedCase = (value: unknown): value is AutomateAcceptedRS['skipped'][number] => {
  const skipped = asRecord(value);
  return Boolean(
    skipped &&
    isPositiveInteger(skipped.id) &&
    typeof skipped.displayId === 'string' &&
    typeof skipped.reason === 'string' &&
    Object.values(SkipReason).includes(skipped.reason as SkipReason),
  );
};

export const normalizeAutomateAccepted = (
  value: unknown,
  requestedIds: readonly number[],
): AutomateAcceptedRS | null => {
  const response = asRecord(value);
  const iteration = asRecord(response?.iteration);
  const requestedIdSet = new Set(requestedIds);
  const acceptedIds = Array.isArray(response?.accepted)
    ? response.accepted.filter(isPositiveInteger)
    : [];
  const skippedEntries = Array.isArray(response?.skipped) ? response.skipped : [];
  const skippedIds = skippedEntries
    .map((entry) => asRecord(entry)?.id)
    .filter(isPositiveInteger);
  const resultIds = [...acceptedIds, ...skippedIds];
  if (
    requestedIds.length === 0 ||
    requestedIdSet.size !== requestedIds.length ||
    !response ||
    !iteration ||
    !isPositiveInteger(iteration.pipelineId) ||
    !isPositiveInteger(iteration.iterationId) ||
    !isPositiveInteger(iteration.number) ||
    !Array.isArray(response.accepted) ||
    response.accepted.length === 0 ||
    !response.accepted.every(isPositiveInteger) ||
    new Set(response.accepted).size !== response.accepted.length ||
    !Array.isArray(response.skipped) ||
    !response.skipped.every(isSkippedCase) ||
    new Set(skippedIds).size !== skippedIds.length ||
    resultIds.length !== requestedIds.length ||
    new Set(resultIds).size !== resultIds.length ||
    !resultIds.every((id) => requestedIdSet.has(id)) ||
    !requestedIds.every((id) => resultIds.includes(id))
  ) {
    return null;
  }

  return response as unknown as AutomateAcceptedRS;
};

export const getAutomationCandidateLabel = (testCase: AutomationCandidate): string =>
  [testCase.displayId, testCase.name].filter(Boolean).join(' · ') || String(testCase.id);
