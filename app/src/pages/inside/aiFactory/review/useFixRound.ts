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
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import {
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
} from 'controllers/notification';
import { FixRoundStatus, type FixRoundRS } from 'types/aiFactory';
import { usePolling } from 'pages/inside/aiFactory/common';

import { messages } from './messages';

const POLLING_INTERVAL_MS = 3000;
const FIX_ROUND_STATUSES = new Set<string>(Object.values(FixRoundStatus));

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const normalizeFixRound = (value: unknown): FixRoundRS | null => {
  const round = asRecord(value);
  if (
    !round ||
    typeof round.round !== 'number' ||
    !Number.isFinite(round.round) ||
    typeof round.testCaseId !== 'number' ||
    typeof round.displayId !== 'string' ||
    typeof round.status !== 'string' ||
    !FIX_ROUND_STATUSES.has(round.status) ||
    typeof round.pushedBy !== 'string' ||
    typeof round.pushedAt !== 'number' ||
    typeof round.commentsCount !== 'number'
  ) {
    return null;
  }

  return round as unknown as FixRoundRS;
};

const latestFixRound = (value: unknown): FixRoundRS | null => {
  if (!Array.isArray(value)) return null;

  return (
    value
      .map(normalizeFixRound)
      .filter((round): round is FixRoundRS => round !== null)
      .sort((left, right) => right.round - left.round)[0] ?? null
  );
};

export interface FixRoundLoadState {
  current: FixRoundRS | null;
  isLoading: boolean;
  isStarting: boolean;
  isError: boolean;
  start: () => Promise<void>;
  reload: () => void;
}

interface UseFixRoundOptions {
  onStarted?: (round: FixRoundRS) => void;
  onFinished?: (round: FixRoundRS) => void;
}

export const useFixRound = (
  projectKey: string,
  testCaseId: number,
  isEnabled: boolean,
  { onStarted, onFinished }: UseFixRoundOptions = {},
): FixRoundLoadState => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [current, setCurrent] = useState<FixRoundRS | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [requestIndex, setRequestIndex] = useState(0);
  const observedRunningRound = useRef<number | null>(null);
  const notifiedRound = useRef<number | null>(null);
  const requestSequence = useRef(0);
  const onStartedRef = useRef(onStarted);
  const onFinishedRef = useRef(onFinished);
  const notifyFinishedRef = useRef<(round: FixRoundRS) => void>(() => {});
  const url = URLS.testCaseFixRounds(projectKey, testCaseId);

  useEffect(() => {
    onStartedRef.current = onStarted;
    onFinishedRef.current = onFinished;
  }, [onFinished, onStarted]);

  const notifyFinished = useCallback(
    (round: FixRoundRS) => {
      if (notifiedRound.current === round.round) return;

      notifiedRound.current = round.round;
      if (round.status === FixRoundStatus.PASSED) {
        dispatch(
          showSuccessNotification({
            message: formatMessage(
              round.autoReadyPromoted ? messages.fixPassedAutoReady : messages.fixPassed,
              { round: round.round },
            ),
          }),
        );
      } else if (round.status === FixRoundStatus.GRADE_FAILED) {
        dispatch(
          showWarningNotification({
            message: formatMessage(messages.fixGradeFailed, { round: round.round }),
          }),
        );
      } else if (round.status === FixRoundStatus.FAILED) {
        dispatch(
          showErrorNotification({
            message: formatMessage(messages.fixFailed, { round: round.round }),
          }),
        );
      }
      onFinishedRef.current?.(round);
    },
    [dispatch, formatMessage],
  );

  useEffect(() => {
    notifyFinishedRef.current = notifyFinished;
  }, [notifyFinished]);

  const load = useCallback(async () => {
    if (!isEnabled || !projectKey || !testCaseId) return;

    requestSequence.current += 1;
    const requestId = requestSequence.current;
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch<FixRoundRS[]>(url);
      if (requestId !== requestSequence.current) return;
      const latest = latestFixRound(response);
      setCurrent(latest);
      if (latest?.status === FixRoundStatus.RUNNING) {
        observedRunningRound.current = latest.round;
      } else if (latest && observedRunningRound.current === latest.round) {
        observedRunningRound.current = null;
        notifyFinishedRef.current(latest);
      }
    } catch (error: unknown) {
      if (
        requestId === requestSequence.current &&
        !(error instanceof Error && error.message === ERROR_CANCELED)
      ) {
        setIsError(true);
      }
    } finally {
      if (requestId === requestSequence.current) setIsLoading(false);
    }
  }, [isEnabled, projectKey, testCaseId, url]);

  useEffect(() => {
    void load();
  }, [load, requestIndex]);

  usePolling(() => void load(), POLLING_INTERVAL_MS, current?.status === FixRoundStatus.RUNNING);

  const start = useCallback(async () => {
    requestSequence.current += 1;
    setIsStarting(true);
    setIsError(false);
    try {
      const response = await fetch<FixRoundRS>(url, { method: 'POST' });
      const round = normalizeFixRound(response);
      if (!round || round.status !== FixRoundStatus.RUNNING) {
        throw new Error('Invalid fix-round response');
      }
      observedRunningRound.current = round.round;
      notifiedRound.current = null;
      setCurrent(round);
      onStartedRef.current?.(round);
    } catch {
      setIsError(true);
      dispatch(showErrorNotification({ message: formatMessage(messages.fixStartFailed) }));
    } finally {
      setIsStarting(false);
    }
  }, [dispatch, formatMessage, url]);

  return {
    current: isEnabled ? current : null,
    isLoading: isEnabled && isLoading,
    isStarting,
    isError,
    start,
    reload: () => setRequestIndex((index) => index + 1),
  };
};
