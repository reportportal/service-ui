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

import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  loadStageTraceAttempts,
  StageTraceError,
  type StageTraceAttempt,
} from 'controllers/aiFactory/stageTrace';
import {
  PROJECT_PIPELINE_STAGE_TRACE_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import { messages } from './messages';

export interface StageTraceActionProps {
  projectKey: string;
  pipelineId: number;
  iterationId: number;
  stageKey: string;
  refreshIdentity?: object;
}

export const StageTraceAction = ({
  projectKey,
  pipelineId,
  iterationId,
  stageKey,
  refreshIdentity,
}: StageTraceActionProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const [retry, setRetry] = useState(0);
  const scope = useMemo(
    () => ({ projectKey, pipelineId, iterationId, stageKey, refreshIdentity, retry, enabled }),
    [projectKey, pipelineId, iterationId, stageKey, refreshIdentity, retry, enabled],
  );
  const [state, setState] = useState<{
    scope: object;
    attempts?: StageTraceAttempt[];
    error?: string;
  }>();
  useEffect(() => {
    if (!enabled || !projectKey || !stageKey) return;
    const controller = new AbortController();
    loadStageTraceAttempts({ projectKey, iterationId, stageKey }, controller.signal).then(
      (attempts) => {
        if (!controller.signal.aborted) setState({ scope, attempts });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            scope,
            error: error instanceof StageTraceError ? error.reason : 'REQUEST_FAILED',
          });
      },
    );
    return () => controller.abort();
  }, [scope, enabled, projectKey, iterationId, stageKey]);
  if (!enabled) return null;
  const current = state?.scope === scope ? state : undefined;
  const currentAttempt = current?.attempts?.find(({ current: isCurrent }) => isCurrent);
  let message = messages.loading;
  if (current?.error) {
    message = messages.error;
    if (current.error === 'FORBIDDEN') message = messages.forbidden;
    if (current.error === 'NOT_FOUND') message = messages.missing;
  } else if (current?.attempts) {
    message = messages.notReported;
    if (current.attempts.some(({ traceStatus }) => traceStatus === 'REPORTED'))
      message = messages.earlier;
    if (currentAttempt?.traceStatus === 'REPORTED') message = messages.reported;
  }
  return (
    <div data-automation-id="stage-trace-action">
      <Button
        variant="text"
        onClick={() =>
          dispatch({
            type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
            payload: { organizationSlug, projectSlug, pipelineId, iterationId, stageKey },
            query: {
              returnPipelineId: String(pipelineId),
              returnIterationId: String(iterationId),
              returnStageKey: stageKey,
            },
          })
        }
      >
        {formatMessage(messages.open)}
      </Button>
      <output aria-live="polite">
        {formatMessage(message, { count: currentAttempt?.eventCount ?? 0 })}
      </output>
      <Button variant="text" onClick={() => setRetry((value) => value + 1)}>
        {formatMessage(messages.refresh)}
      </Button>
    </div>
  );
};
