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

import { useCallback, useState } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
} from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import {
  LifecycleAction,
  LifecycleRejectReason,
  LifecycleUpdateReason,
  SkipReason,
  type AiSkipReason,
  type LifecycleBatchRS,
  type LifecyclePayload,
} from 'types/aiFactory';

import { messages } from './messages';

interface LifecycleTestCase {
  id: number;
  ai?: unknown;
}

export type LifecycleUpdateResult = 'UPDATED' | 'CONFIRM_OBSOLETE' | 'FAILED';

interface UseLifecycleActionsOptions {
  onSingleSuccess?: () => void;
  onBatchSuccess?: () => void;
}

const REJECT_REASONS = new Set<string>(Object.values(LifecycleRejectReason));
const UPDATE_REASONS = new Set<string>(Object.values(LifecycleUpdateReason));
const SKIP_REASON_MESSAGES: Record<AiSkipReason, MessageDescriptor> = {
  [SkipReason.ALREADY_READY]: messages.reasonAlreadyReady,
  [SkipReason.FIX_RUNNING]: messages.reasonFixRunning,
  [SkipReason.UNSENT_COMMENTS]: messages.reasonUnsentComments,
  [SkipReason.NOT_READY]: messages.reasonNotReady,
  [SkipReason.AUTOMATION_IN_PROGRESS]: messages.reasonAutomationInProgress,
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const getRejectReason = (error: unknown): LifecycleRejectReason | null => {
  const reason = asRecord(error)?.reason;
  return typeof reason === 'string' && REJECT_REASONS.has(reason)
    ? (reason as LifecycleRejectReason)
    : null;
};

const normalizeBatchResponse = (value: unknown): LifecycleBatchRS | null => {
  const response = asRecord(value);
  if (!response || !Array.isArray(response.updated) || !Array.isArray(response.skipped)) {
    return null;
  }

  const hasValidUpdatedEntries = response.updated.every((item) => {
    const entry = asRecord(item);
    return (
      typeof entry?.id === 'number' &&
      Number.isFinite(entry.id) &&
      typeof entry.reason === 'string' &&
      UPDATE_REASONS.has(entry.reason)
    );
  });
  const hasValidSkippedEntries = response.skipped.every((item) => {
    const entry = asRecord(item);
    return (
      typeof entry?.id === 'number' &&
      Number.isFinite(entry.id) &&
      typeof entry.displayId === 'string' &&
      typeof entry.reason === 'string' &&
      Object.prototype.hasOwnProperty.call(SKIP_REASON_MESSAGES, entry.reason)
    );
  });

  return hasValidUpdatedEntries && hasValidSkippedEntries
    ? (response as unknown as LifecycleBatchRS)
    : null;
};

export const useLifecycleActions = ({
  onSingleSuccess,
  onBatchSuccess,
}: UseLifecycleActionsOptions = {}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const [isLoading, setIsLoading] = useState(false);

  const updateLifecycle = useCallback(
    async (
      testCase: LifecycleTestCase,
      confirmObsolete = false,
    ): Promise<LifecycleUpdateResult> => {
      const payload: LifecyclePayload = {
        action: testCase.ai ? LifecycleAction.APPROVE : LifecycleAction.MARK_AS_READY,
        ...(confirmObsolete && { confirmObsolete: true }),
      };

      setIsLoading(true);
      try {
        await fetch(URLS.testCaseLifecycle(projectKey, testCase.id), {
          method: 'POST',
          data: payload,
        });
        dispatch(
          showSuccessNotification({
            message: formatMessage(
              testCase.ai ? messages.approvedSuccess : messages.markedAsReadySuccess,
            ),
          }),
        );
        onSingleSuccess?.();
        return 'UPDATED';
      } catch (error: unknown) {
        const reason = getRejectReason(error);
        if (reason === LifecycleRejectReason.EVALUATION_OBSOLETE_CONFIRM_REQUIRED) {
          return 'CONFIRM_OBSOLETE';
        }

        let message = messages.updateFailed;
        if (reason === LifecycleRejectReason.UNSENT_COMMENTS) {
          message = messages.unsentCommentsHint;
        } else if (reason === LifecycleRejectReason.FIX_RUNNING) {
          message = messages.fixRunningHint;
        } else if (reason === LifecycleRejectReason.NOT_DRAFT) {
          message = messages.noLongerDraft;
        } else if (reason === LifecycleRejectReason.NO_PERMISSION) {
          message = messages.noPermission;
        }
        dispatch(showErrorNotification({ message: formatMessage(message) }));
        return 'FAILED';
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, formatMessage, onSingleSuccess, projectKey],
  );

  const updateLifecycleBatch = useCallback(
    async (testCaseIds: number[]): Promise<LifecycleBatchRS | null> => {
      setIsLoading(true);
      try {
        const rawResponse = await fetch<LifecycleBatchRS>(
          URLS.testCaseLifecycleBatch(projectKey),
          { method: 'POST', data: { testCaseIds } },
        );
        const response = normalizeBatchResponse(rawResponse);
        if (!response) throw new Error('Invalid lifecycle batch response');

        if (response.updated.length) {
          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.bulkSuccess, { count: response.updated.length }),
            }),
          );
        }
        if (response.skipped.length) {
          const skippedCases = response.skipped
            .map(({ displayId, reason }) =>
              formatMessage(
                messages.skippedCase,
                { id: displayId, reason: formatMessage(SKIP_REASON_MESSAGES[reason]) },
              ),
            )
            .join('; ');
          dispatch(
            showWarningNotification({
              message: formatMessage(messages.bulkSkipped, { cases: skippedCases }),
            }),
          );
        }

        onBatchSuccess?.();
        return response;
      } catch {
        dispatch(showErrorNotification({ message: formatMessage(messages.updateFailed) }));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, formatMessage, onBatchSuccess, projectKey],
  );

  return { isLoading, updateLifecycle, updateLifecycleBatch };
};
