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

import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { isCiNotConnectedError } from 'controllers/aiFactory/pipelines/ciConnection';
import { useUserPermissions } from 'hooks/useUserPermissions';
import {
  AutomationStatus,
  type AutomateAcceptedRS,
  type AutomatePayload,
  type AutomationEnvironmentsRS,
} from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

import {
  getNativeAutomationState,
  getNoEligibleCases,
  getReautomationRequiredIds,
  normalizeAutomateAccepted,
  normalizeAutomationEnvironments,
} from './automationUtils';

export type AutomationRequestError =
  | 'ENVIRONMENTS_LOAD_FAILED'
  | 'ENVIRONMENTS_NOT_CONFIGURED'
  | 'INVALID_ENVIRONMENTS_RESPONSE'
  | 'REAUTOMATE_CONFIRMATION_REQUIRED'
  | 'CI_NOT_CONNECTED'
  | 'NO_ELIGIBLE_TEST_CASES'
  | 'JOB_START_FAILED'
  | 'START_NOT_CONFIRMED'
  | 'INVALID_AUTOMATION_RESPONSE';

type AutomationStartResult = AutomateAcceptedRS & { unconfirmed?: number[] };

const AMBIGUOUS_STATUS_CODES = new Set([408, 502, 503, 504]);
const START_TIMEOUT_MS = 30_000;
const RECOVERY_TIMEOUT_MS = 10_000;

type SkippedCases = AutomateAcceptedRS['skipped'];

interface AutomationRequestFailure {
  error: AutomationRequestError;
  reautomationRequiredIds?: number[];
  skipped?: SkippedCases;
}

const getConflict = (body: unknown, testCaseIds: number[]): AutomationRequestFailure => {
  if (isCiNotConnectedError(body)) return { error: 'CI_NOT_CONNECTED' };
  const reautomationRequiredIds = getReautomationRequiredIds(body, testCaseIds);
  if (reautomationRequiredIds) {
    return { error: 'REAUTOMATE_CONFIRMATION_REQUIRED', reautomationRequiredIds };
  }
  const skipped = getNoEligibleCases(body, testCaseIds);
  return skipped ? { error: 'NO_ELIGIBLE_TEST_CASES', skipped } : { error: 'JOB_START_FAILED' };
};

const readActiveIteration = async (
  projectKey: string,
  testCaseId: number,
  pipelineId: number,
  signal: AbortSignal,
) => {
  const testCase = await fetch<Pick<TestCase, 'id' | 'automationState'>>(
    URLS.testCaseDetails(projectKey, testCaseId),
    { signal, timeout: RECOVERY_TIMEOUT_MS },
  );
  const automation = testCase?.id === testCaseId ? getNativeAutomationState(testCase) : undefined;
  if (
    automation?.status !== AutomationStatus.IN_PROGRESS ||
    automation.iteration?.pipelineId !== pipelineId
  ) {
    return undefined;
  }
  return { id: testCaseId, iteration: automation.iteration };
};

const readStartOutcome = async (
  projectKey: string,
  testCaseIds: number[],
  pipelineId: number | undefined,
  signal: AbortSignal,
): Promise<AutomationStartResult | undefined> => {
  if (!pipelineId) return undefined;
  const reads = await Promise.allSettled(
    testCaseIds.map((id) => readActiveIteration(projectKey, id, pipelineId, signal)),
  );
  const confirmed = reads.flatMap((read) =>
    read.status === 'fulfilled' && read.value ? [read.value] : [],
  );
  const iteration = confirmed[0]?.iteration;
  if (
    !iteration ||
    confirmed.some((entry) => entry.iteration.iterationId !== iteration.iterationId)
  ) {
    return undefined;
  }
  const accepted = confirmed.map(({ id }) => id);
  const unconfirmed = testCaseIds.filter((id) => !accepted.includes(id));
  return { iteration, accepted, skipped: [], ...(unconfirmed.length > 0 && { unconfirmed }) };
};

const loadEnvironments = async (
  projectKey: string,
  pipelineId: number | undefined,
  signal: AbortSignal,
) => {
  const response = await fetch<unknown>(
    URLS.tmsAutomationEnvironments(projectKey),
    {
      signal,
      ...(process.env.NODE_ENV === 'development' && pipelineId && { adapter: 'xhr' }),
      validateStatus: (status) => status === 200 || status === 400,
    },
    true,
  );
  if (response.status === 400) return { error: 'ENVIRONMENTS_NOT_CONFIGURED' as const };
  return { environments: normalizeAutomationEnvironments(response.data) };
};

type AutomationStartOutcome = { response: AutomationStartResult } | AutomationRequestFailure;

const submitAutomation = async (
  projectKey: string,
  payload: AutomatePayload,
  pipelineId: number | undefined,
  signal: AbortSignal,
): Promise<AutomationStartOutcome> => {
  const recover = async (): Promise<AutomationStartOutcome> => {
    const response = await readStartOutcome(projectKey, payload.testCaseIds, pipelineId, signal);
    return response ? { response } : { error: 'START_NOT_CONFIRMED' };
  };
  const response = await fetch<unknown>(
    URLS.tmsAutomation(projectKey),
    {
      method: 'POST',
      data: payload,
      signal,
      ...(process.env.NODE_ENV === 'development' && pipelineId && { adapter: 'xhr' }),
      timeout: START_TIMEOUT_MS,
      validateStatus: (status) =>
        status === 202 || status === 400 || status === 409 || AMBIGUOUS_STATUS_CODES.has(status),
    },
    true,
  ).catch((error: unknown): undefined => {
    if (isAxiosError(error) && !error.response && !signal.aborted) return undefined;
    throw error;
  });
  if (!response || AMBIGUOUS_STATUS_CODES.has(response.status)) return recover();
  if (response.status === 409) return getConflict(response.data, payload.testCaseIds);
  if (response.status === 400) return { error: 'JOB_START_FAILED' };
  const result = normalizeAutomateAccepted(response.data, payload.testCaseIds);
  if (!result || (pipelineId && result.iteration.pipelineId !== pipelineId)) {
    return { error: 'INVALID_AUTOMATION_RESPONSE' };
  }
  return { response: result };
};

export interface AutomationRequestState {
  environments: AutomationEnvironmentsRS | null;
  isLoadingEnvironments: boolean;
  isStarting: boolean;
  error: AutomationRequestError | null;
  reautomationRequiredIds: number[];
  skipped: SkippedCases;
  start: (payload: AutomatePayload) => Promise<AutomationStartResult | null>;
  reloadEnvironments: () => void;
}

export const useAutomationRequest = (
  projectKey: string,
  isEnabled: boolean,
  pipelineId?: number,
): AutomationRequestState => {
  const { canAutomateTestCases } = useUserPermissions();
  const isRequestEnabled = Boolean(isEnabled && canAutomateTestCases && projectKey);
  const [environments, setEnvironments] = useState<AutomationEnvironmentsRS | null>(null);
  const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [failure, setFailure] = useState<AutomationRequestFailure>();
  const [loadIndex, setLoadIndex] = useState(0);
  const activeStart = useRef<AbortController>();
  const scope = isRequestEnabled ? JSON.stringify([projectKey, pipelineId, loadIndex]) : '';
  const activeScope = useRef('');

  useEffect(() => {
    activeScope.current = scope;
    setEnvironments(null);
    setIsStarting(false);
    setFailure(undefined);
    setIsLoadingEnvironments(Boolean(scope));
    if (!scope) return undefined;

    const controller = new AbortController();
    void loadEnvironments(projectKey, pipelineId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.environments) {
          setEnvironments(result.environments);
        } else {
          setFailure({ error: result.error ?? 'INVALID_ENVIRONMENTS_RESPONSE' });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailure({ error: 'ENVIRONMENTS_LOAD_FAILED' });
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingEnvironments(false);
      });

    return () => {
      controller.abort();
      activeStart.current?.abort();
      activeStart.current = undefined;
      activeScope.current = '';
    };
  }, [scope, pipelineId, projectKey]);

  const start = useCallback(
    async (payload: AutomatePayload) => {
      if (!scope || activeScope.current !== scope || activeStart.current) return null;
      if (!environments?.environments.includes(payload.environment)) {
        setFailure({ error: 'INVALID_ENVIRONMENTS_RESPONSE' });
        return null;
      }
      const controller = new AbortController();
      activeStart.current = controller;
      const isCurrent = () => activeStart.current === controller;
      setIsStarting(true);
      try {
        const outcome = await submitAutomation(projectKey, payload, pipelineId, controller.signal);
        if (!isCurrent()) return null;
        if ('response' in outcome) return outcome.response;
        setFailure(outcome);
        return null;
      } catch {
        if (isCurrent()) setFailure({ error: 'JOB_START_FAILED' });
        return null;
      } finally {
        if (isCurrent()) {
          activeStart.current = undefined;
          setIsStarting(false);
        }
      }
    },
    [environments, pipelineId, projectKey, scope],
  );

  return {
    environments,
    isLoadingEnvironments,
    isStarting,
    error: failure?.error ?? null,
    reautomationRequiredIds: failure?.reautomationRequiredIds ?? [],
    skipped: failure?.skipped ?? [],
    start,
    reloadEnvironments: () => setLoadIndex((index) => index + 1),
  };
};
