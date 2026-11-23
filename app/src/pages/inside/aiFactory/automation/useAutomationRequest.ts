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
import { delay } from 'common/utils/delay';
import { getErrorMessage } from 'common/utils/helperUtils/errorUtils';
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

export type AutomationStartResult = AutomateAcceptedRS & {
  recovery?: { unconfirmed: number[] };
};

const AMBIGUOUS_STATUS_CODES = new Set([408, 502, 503, 504]);
const AUTOMATION_ENVIRONMENTS_NOT_CONFIGURED = 40060;
const START_TIMEOUT_MS = 30_000;
const RECOVERY_READ_TIMEOUT_MS = 10_000;
const RECOVERY_TIMEOUT_MS = 30_000;
const RECOVERY_RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000];
const CONFLICTING_ITERATIONS = Symbol('conflicting iterations');

type SkippedCases = AutomateAcceptedRS['skipped'];

interface AutomationRequestFailure {
  error: AutomationRequestError;
  errorMessage?: string;
  reautomationRequiredIds?: number[];
  skipped?: SkippedCases;
}

const getBadRequest = (
  body: unknown,
  fallback: 'ENVIRONMENTS_LOAD_FAILED' | 'JOB_START_FAILED',
): AutomationRequestFailure => {
  if (
    typeof body === 'object' &&
    body !== null &&
    'errorCode' in body &&
    body.errorCode === AUTOMATION_ENVIRONMENTS_NOT_CONFIGURED
  ) {
    return { error: 'ENVIRONMENTS_NOT_CONFIGURED' };
  }
  return { error: fallback, errorMessage: getErrorMessage(body) };
};

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
    { signal, timeout: RECOVERY_READ_TIMEOUT_MS },
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

const readStartSnapshot = async (
  projectKey: string,
  testCaseIds: number[],
  pipelineId: number,
  signal: AbortSignal,
): Promise<AutomationStartResult | typeof CONFLICTING_ITERATIONS | undefined> => {
  const reads = await Promise.allSettled(
    testCaseIds.map((id) => readActiveIteration(projectKey, id, pipelineId, signal)),
  );
  const confirmed = reads.flatMap((read) =>
    read.status === 'fulfilled' && read.value ? [read.value] : [],
  );
  const iteration = confirmed[0]?.iteration;
  if (!iteration) return undefined;
  if (
    confirmed.some(
      (entry) =>
        entry.iteration.iterationId !== iteration.iterationId ||
        entry.iteration.number !== iteration.number,
    )
  ) {
    return CONFLICTING_ITERATIONS;
  }
  const accepted = confirmed.map(({ id }) => id);
  const acceptedIds = new Set(accepted);
  const unconfirmed = testCaseIds.filter((id) => !acceptedIds.has(id));
  return { iteration, accepted, skipped: [], recovery: { unconfirmed } };
};

const pollStartOutcome = async (
  projectKey: string,
  testCaseIds: number[],
  pipelineId: number,
  signal: AbortSignal,
) => {
  let latestSnapshot: AutomationStartResult | undefined;
  let observedIterationId: number | undefined;
  /* eslint-disable no-await-in-loop -- Complete each snapshot before starting the next read. */
  for (const retryDelay of RECOVERY_RETRY_DELAYS_MS) {
    if (retryDelay) await delay(retryDelay);
    if (signal.aborted) return undefined;

    const snapshot = await readStartSnapshot(projectKey, testCaseIds, pipelineId, signal);
    if (snapshot === CONFLICTING_ITERATIONS) return undefined;
    const iterationId = snapshot?.iteration.iterationId;
    if (observedIterationId && iterationId && iterationId !== observedIterationId) return undefined;

    observedIterationId ??= iterationId;
    latestSnapshot = snapshot;
    if (snapshot?.accepted.length === testCaseIds.length) break;
  }
  /* eslint-enable no-await-in-loop */
  return latestSnapshot;
};

const readStartOutcome = async (
  projectKey: string,
  testCaseIds: number[],
  pipelineId: number | undefined,
  signal: AbortSignal,
) => {
  if (!pipelineId || signal.aborted) return undefined;
  const recovery = new AbortController();
  const stopRecovery = () => recovery.abort();
  const stopped = new Promise<undefined>((resolve) => {
    recovery.signal.addEventListener('abort', () => resolve(undefined), { once: true });
  });
  const timeout = setTimeout(stopRecovery, RECOVERY_TIMEOUT_MS);
  signal.addEventListener('abort', stopRecovery, { once: true });
  try {
    return await Promise.race([
      stopped,
      pollStartOutcome(projectKey, testCaseIds, pipelineId, recovery.signal),
    ]);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', stopRecovery);
    stopRecovery();
  }
};

const loadEnvironments = async (
  projectKey: string,
  pipelineId: number | undefined,
  signal: AbortSignal,
): Promise<{ environments: AutomationEnvironmentsRS } | AutomationRequestFailure> => {
  const response = await fetch<unknown>(
    URLS.tmsAutomationEnvironments(projectKey),
    {
      signal,
      ...(process.env.NODE_ENV === 'development' && pipelineId && { adapter: 'xhr' }),
      validateStatus: (status) => status === 200 || status === 400,
    },
    true,
  );
  if (response.status === 400) return getBadRequest(response.data, 'ENVIRONMENTS_LOAD_FAILED');
  const environments = normalizeAutomationEnvironments(response.data);
  return environments ? { environments } : { error: 'INVALID_ENVIRONMENTS_RESPONSE' };
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
  if (response.status === 400) return getBadRequest(response.data, 'JOB_START_FAILED');
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
  errorMessage?: string;
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
        if ('environments' in result) {
          setEnvironments(result.environments);
        } else {
          setFailure(result);
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
        if (outcome.error === 'ENVIRONMENTS_NOT_CONFIGURED') setEnvironments(null);
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
    errorMessage: failure?.errorMessage,
    reautomationRequiredIds: failure?.reautomationRequiredIds ?? [],
    skipped: failure?.skipped ?? [],
    start,
    reloadEnvironments: () => setLoadIndex((index) => index + 1),
  };
};
