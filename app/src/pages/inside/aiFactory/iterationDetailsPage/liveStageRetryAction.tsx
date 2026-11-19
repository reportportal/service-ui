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

import { useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, RerunIcon } from '@reportportal/ui-kit';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import { messages } from './messages';

interface LiveStageRetryActionProps {
  projectKey: string;
  iterationId: number;
  stageId: number;
  stageLabel: string;
  disabled: boolean;
  onRefresh: () => void;
}

const retryResponseMessages: Partial<Record<number, keyof typeof messages>> = {
  202: 'stageRetryRequested',
  400: 'stageRetryUnavailable',
  403: 'stageRetryForbidden',
  404: 'stageRetryNotFound',
  409: 'stageRetryConflict',
};

const blocksRetryForAttempt = (feedback?: keyof typeof messages) =>
  feedback === 'stageRetryRequested' ||
  feedback === 'stageRetryConflict' ||
  feedback === 'stageRetryUnconfirmed';

export const LiveStageRetryAction = ({
  projectKey,
  iterationId,
  stageId,
  stageLabel,
  disabled,
  onRefresh,
}: LiveStageRetryActionProps) => {
  const { formatMessage } = useIntl();
  const currentRequest = useRef<AbortController>();
  const isCurrentAttemptLocked = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<keyof typeof messages>();

  useLayoutEffect(
    () => () => {
      currentRequest.current?.abort();
    },
    [],
  );

  const retry = async () => {
    if (disabled || currentRequest.current || isCurrentAttemptLocked.current) return;
    const controller = new AbortController();
    currentRequest.current = controller;
    setIsSending(true);
    setFeedback(undefined);

    let result: keyof typeof messages;
    try {
      const { status } = await fetch(
        URLS.retryPipelineStage(projectKey, iterationId, stageId),
        {
          method: 'POST',
          signal: controller.signal,
          validateStatus: (statusCode) => retryResponseMessages[statusCode] !== undefined,
        },
        true,
      );
      result = retryResponseMessages[status] ?? 'stageRetryUnconfirmed';
    } catch {
      result = 'stageRetryUnconfirmed';
    }

    currentRequest.current = undefined;
    if (controller.signal.aborted) return;

    // The card remounts when the backend reports a different attempt.
    isCurrentAttemptLocked.current = blocksRetryForAttempt(result);
    setIsSending(false);
    setFeedback(result);
    if (isCurrentAttemptLocked.current) onRefresh();
  };

  return (
    <div>
      <Button
        variant="text"
        icon={<RerunIcon />}
        data-automation-id={`retryReducedStage-${stageId}`}
        disabled={disabled || isSending || blocksRetryForAttempt(feedback)}
        onClick={() => {
          void retry();
        }}
      >
        {formatMessage(messages.retryStage, { stage: stageLabel })}
      </Button>
      <output aria-live="polite">{feedback && formatMessage(messages[feedback])}</output>
    </div>
  );
};
