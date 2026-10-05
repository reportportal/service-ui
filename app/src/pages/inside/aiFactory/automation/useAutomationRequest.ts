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

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import type {
  AutomateAcceptedRS,
  AutomatePayload,
  AutomationEnvironmentsRS,
} from 'types/aiFactory';

import { normalizeAutomateAccepted, normalizeAutomationEnvironments } from './automationUtils';

export type AutomationRequestError =
  | 'ENVIRONMENTS_LOAD_FAILED'
  | 'INVALID_ENVIRONMENTS_RESPONSE'
  | 'REAUTOMATE_CONFIRMATION_REQUIRED'
  | 'JOB_START_FAILED'
  | 'INVALID_AUTOMATION_RESPONSE';

interface AutomationErrorResponse {
  reason?: string;
  testCaseIds?: unknown;
}

const getReautomationRequiredIds = (
  error: unknown,
  requestedIds: readonly number[],
): number[] | null => {
  const response =
    typeof error === 'object' && error !== null ? (error as AutomationErrorResponse) : null;
  const responseIds = Array.isArray(response?.testCaseIds)
    ? response.testCaseIds.filter(
        (id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
      )
    : [];
  if (
    response?.reason !== 'ALREADY_AUTOMATED_CONFIRM_REQUIRED' ||
    !Array.isArray(response.testCaseIds) ||
    response.testCaseIds.length === 0 ||
    responseIds.length !== response.testCaseIds.length ||
    !responseIds.every((id) => requestedIds.includes(id)) ||
    new Set(responseIds).size !== responseIds.length
  ) {
    return null;
  }

  return responseIds;
};

export interface AutomationRequestState {
  environments: AutomationEnvironmentsRS | null;
  isLoadingEnvironments: boolean;
  isStarting: boolean;
  error: AutomationRequestError | null;
  reautomationRequiredIds: number[];
  start: (payload: AutomatePayload) => Promise<AutomateAcceptedRS | null>;
  reloadEnvironments: () => void;
  clearError: () => void;
}

export const useAutomationRequest = (
  projectKey: string,
  isEnabled: boolean,
): AutomationRequestState => {
  const [environments, setEnvironments] = useState<AutomationEnvironmentsRS | null>(null);
  const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<AutomationRequestError | null>(null);
  const [reautomationRequiredIds, setReautomationRequiredIds] = useState<number[]>([]);
  const [requestIndex, setRequestIndex] = useState(0);
  const requestGeneration = useRef(0);
  const startRequestSequence = useRef(0);
  const cancelStartRequest = useRef<() => void>(() => {});

  useEffect(() => {
    const generation = requestGeneration.current + 1;
    requestGeneration.current = generation;
    startRequestSequence.current += 1;
    cancelStartRequest.current();
    cancelStartRequest.current = () => {};
    setEnvironments(null);
    setIsStarting(false);
    setReautomationRequiredIds([]);

    if (!isEnabled || !projectKey) {
      setIsLoadingEnvironments(false);
      setError(null);
      return undefined;
    }

    let isActive = true;
    let cancelRequest = () => {};
    setIsLoadingEnvironments(true);
    setError(null);
    void fetch<unknown>(URLS.tmsAutomationEnvironments(projectKey), {
      abort: (cancel) => {
        cancelRequest = cancel;
      },
      })
      .then((response) => {
        if (!isActive || requestGeneration.current !== generation) return;
        const normalized = normalizeAutomationEnvironments(response);
        if (!normalized) {
          setError('INVALID_ENVIRONMENTS_RESPONSE');
          return;
        }
        setEnvironments(normalized);
      })
      .catch((requestError: unknown) => {
        if (
          isActive &&
          requestGeneration.current === generation &&
          !(requestError instanceof Error && requestError.message === ERROR_CANCELED)
        ) {
          setError('ENVIRONMENTS_LOAD_FAILED');
        }
      })
      .finally(() => {
        if (isActive && requestGeneration.current === generation) {
          setIsLoadingEnvironments(false);
        }
      });

    return () => {
      isActive = false;
      cancelRequest();
      cancelStartRequest.current();
      cancelStartRequest.current = () => {};
      startRequestSequence.current += 1;
      if (requestGeneration.current === generation) {
        requestGeneration.current += 1;
      }
    };
  }, [isEnabled, projectKey, requestIndex]);

  const start = useCallback(
    async (payload: AutomatePayload) => {
      if (!isEnabled || !projectKey) {
        return null;
      }
      if (!environments?.environments.includes(payload.environment)) {
        setError('INVALID_ENVIRONMENTS_RESPONSE');
        return null;
      }

      const generation = requestGeneration.current;
      const sequence = startRequestSequence.current + 1;
      startRequestSequence.current = sequence;
      let cancelRequest = () => {};
      cancelStartRequest.current();
      cancelStartRequest.current = () => cancelRequest();
      setIsStarting(true);
      setError(null);
      try {
        const response = await fetch<unknown>(URLS.tmsAutomation(projectKey), {
          method: 'POST',
          data: payload,
          abort: (cancel) => {
            cancelRequest = cancel;
          },
        });
        if (
          requestGeneration.current !== generation ||
          startRequestSequence.current !== sequence
        ) {
          return null;
        }
        const normalized = normalizeAutomateAccepted(response, payload.testCaseIds);
        if (!normalized) {
          setError('INVALID_AUTOMATION_RESPONSE');
          return null;
        }
        setReautomationRequiredIds([]);
        return normalized;
      } catch (requestError: unknown) {
        if (
          requestGeneration.current !== generation ||
          startRequestSequence.current !== sequence
        ) {
          return null;
        }
        if (requestError instanceof Error && requestError.message === ERROR_CANCELED) {
          return null;
        }
        const requiredIds = getReautomationRequiredIds(requestError, payload.testCaseIds);
        if (requiredIds) {
          setReautomationRequiredIds(requiredIds);
          setError('REAUTOMATE_CONFIRMATION_REQUIRED');
        } else {
          setError('JOB_START_FAILED');
        }
        return null;
      } finally {
        if (
          requestGeneration.current === generation &&
          startRequestSequence.current === sequence
        ) {
          cancelStartRequest.current = () => {};
          setIsStarting(false);
        }
      }
    },
    [environments, isEnabled, projectKey],
  );

  return {
    environments,
    isLoadingEnvironments,
    isStarting,
    error,
    reautomationRequiredIds,
    start,
    reloadEnvironments: () => setRequestIndex((index) => index + 1),
    clearError: () => setError(null),
  };
};
