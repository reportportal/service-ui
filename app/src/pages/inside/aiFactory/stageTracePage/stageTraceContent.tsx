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

import { useIntl } from 'react-intl';
import { SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { StageTraceTimeline } from 'pages/inside/aiFactory/stageTracePage/stageTraceTimeline';
import { StageTraceSnapshot } from 'pages/inside/aiFactory/stageTracePage/stageTraceSnapshot';
import type {
  StageTraceState,
  TraceFailure,
} from 'pages/inside/aiFactory/stageTracePage/useStageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceContentProps {
  state: StageTraceState;
  stageKey: string;
  attempt?: StageTraceAttempt;
  failure?: TraceFailure;
  isLoading: boolean;
  isProjectUnavailable?: boolean;
}
const cx = createClassnames(styles);
const FAILURE_MESSAGES: Record<TraceFailure, keyof typeof messages> = {
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'notFound',
  INVALID_RESPONSE: 'invalid',
  REQUEST_FAILED: 'failed',
};
export const StageTraceContent = ({
  state,
  stageKey,
  attempt,
  failure,
  isLoading,
  isProjectUnavailable = false,
}: StageTraceContentProps) => {
  const { formatMessage } = useIntl();
  const errorMessage = isProjectUnavailable
    ? messages.projectUnavailable
    : failure && messages[FAILURE_MESSAGES[failure]];
  if (errorMessage)
    return (
      <SystemMessage mode="error">
        <div role="alert">{formatMessage(errorMessage)}</div>
      </SystemMessage>
    );
  if (isLoading)
    return (
      <output className={cx('state')} aria-live="polite">
        {formatMessage(messages.loading)}
      </output>
    );
  const { trace } = state;
  return (
    <div className={cx('body')}>
      <main className={cx('main')}>
        {trace?.status === 'NOT_REPORTED' && (
          <SystemMessage mode="info">
            <output aria-live="polite">
              {formatMessage(messages.notReported)}
              {trace.reason && <p className={cx('reason')}>{trace.reason}</p>}
            </output>
          </SystemMessage>
        )}
        {trace?.status === 'REPORTED' &&
          (trace.events.length ? (
            <StageTraceTimeline key={`${state.scope}:${trace.attempt}`} events={trace.events} />
          ) : (
            <SystemMessage mode="info">{formatMessage(messages.empty)}</SystemMessage>
          ))}
        {trace?.reportedAt && (
          <p>
            {formatMessage(messages.reportedAt)}: {new Date(trace.reportedAt).toLocaleString()}
          </p>
        )}
      </main>
      <StageTraceSnapshot
        iteration={state.iteration}
        stageKey={stageKey}
        attempt={attempt}
        hasError={state.metadataFailed}
      />
    </div>
  );
};
