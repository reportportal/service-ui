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

import { isAiFactoryMocksEnabled } from 'controllers/aiFactory/mockMode';
import {
  AutomationStatus,
  Lifecycle,
  MergeRequestState,
  SkipReason,
  type AiAutomationStatus,
  type AiLifecycle,
  type AutomateAcceptedRS,
  type AutomationEnvironmentsRS,
  type TestCaseAiExtension,
  type TestCaseAutomationState,
} from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

export const isAutomationDemoEnabled = () =>
  process.env.NODE_ENV === 'development' && isAiFactoryMocksEnabled();

export interface AutomationCandidate {
  id: number;
  displayId?: string;
  name?: string;
  lifecycle?: AiLifecycle;
  review?: TestCaseAiExtension['review'];
  automation?: { status: AiAutomationStatus };
  isFixRunning?: boolean;
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

const CI_CONNECTION_STATES = new Set(['CONNECTED', 'NOT_CONNECTED', 'CONNECTION_FAILED']);

const isIteration = (value: unknown) => {
  const iteration = asRecord(value);
  return (
    iteration &&
    isPositiveInteger(iteration.pipelineId) &&
    isPositiveInteger(iteration.iterationId) &&
    isPositiveInteger(iteration.number)
  );
};

const isLaunch = (value: unknown) => {
  const launch = asRecord(value);
  return (
    launch &&
    isPositiveInteger(launch.id) &&
    isPositiveInteger(launch.number) &&
    typeof launch.name === 'string'
  );
};

const isMergeRequest = (value: unknown) => {
  const mergeRequest = asRecord(value);
  return (
    mergeRequest &&
    typeof mergeRequest.id === 'string' &&
    Object.values(MergeRequestState).includes(mergeRequest.state as MergeRequestState)
  );
};

const isLastResult = (value: unknown) => {
  const result = asRecord(value);
  return (
    result &&
    (result.status === 'PASSED' || result.status === 'FAILED') &&
    (result.defectType === undefined || typeof result.defectType === 'string')
  );
};

export const getNativeAutomationState = (
  testCase?: Pick<TestCase, 'automationState'> | null,
): TestCaseAutomationState | undefined => {
  const state = testCase?.automationState;
  if (
    !state ||
    !CI_CONNECTION_STATES.has(state.ciConnection) ||
    !Object.values(AutomationStatus).includes(state.status as AutomationStatus) ||
    typeof state.fixInProgress !== 'boolean' ||
    typeof state.scenarioChangedAfterAutomation !== 'boolean' ||
    (state.iteration !== undefined && !isIteration(state.iteration)) ||
    (state.launch !== undefined && !isLaunch(state.launch)) ||
    (state.mergeRequest !== undefined && !isMergeRequest(state.mergeRequest)) ||
    (state.lastResult !== undefined && !isLastResult(state.lastResult))
  ) {
    return undefined;
  }
  return state;
};

export const getNativeAutomationCandidate = (
  testCase: AutomationCandidate & Pick<TestCase, 'status' | 'automationState'>,
  isFixRunning = false,
): AutomationCandidate => {
  const state = getNativeAutomationState(testCase);
  return {
    id: testCase.id,
    displayId: testCase.displayId,
    name: testCase.name,
    lifecycle: testCase.status,
    ...(state && { automation: { status: state.status } }),
    ...((isFixRunning || state?.fixInProgress) && { isFixRunning: true }),
  };
};

export const getAutomationSkipReason = (testCase: AutomationCandidate): SkipReason | null => {
  if (testCase.lifecycle !== Lifecycle.READY) {
    return SkipReason.NOT_READY;
  }
  if (testCase.isFixRunning || testCase.review?.fixRound?.status === 'RUNNING') {
    return SkipReason.FIX_RUNNING;
  }
  if (testCase.automation?.status === AutomationStatus.IN_PROGRESS) {
    return SkipReason.AUTOMATION_IN_PROGRESS;
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
    (skipped.reason === SkipReason.FIX_RUNNING ||
      skipped.reason === SkipReason.NOT_READY ||
      skipped.reason === SkipReason.AUTOMATION_IN_PROGRESS),
  );
};

export const getReautomationRequiredIds = (value: unknown, requestedIds: readonly number[]) => {
  const response = asRecord(value);
  const ids: unknown = response?.testCaseIds;
  if (
    response?.reason !== 'ALREADY_AUTOMATED_CONFIRM_REQUIRED' ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    new Set(ids).size !== ids.length ||
    !ids.every((id) => isPositiveInteger(id) && requestedIds.includes(id))
  ) {
    return undefined;
  }
  return ids as number[];
};

export const getNoEligibleCases = (value: unknown, requestedIds: readonly number[]) => {
  const response = asRecord(value);
  const skipped: unknown = response?.skipped;
  if (
    response?.reason !== 'NO_ELIGIBLE_TEST_CASES' ||
    !Array.isArray(skipped) ||
    !skipped.every(isSkippedCase) ||
    new Set(skipped.map(({ id }) => id)).size !== skipped.length ||
    !skipped.every(({ id }) => requestedIds.includes(id))
  ) {
    return undefined;
  }
  return skipped;
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
  const skippedIds = skippedEntries.map((entry) => asRecord(entry)?.id).filter(isPositiveInteger);
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
