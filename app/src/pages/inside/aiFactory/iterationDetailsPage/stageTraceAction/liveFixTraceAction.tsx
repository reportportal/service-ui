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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { getLiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import { createStageTraceAction } from 'pages/inside/aiFactory/common/stageTrace/navigation';
import { useScopedTraceRequest } from 'pages/inside/aiFactory/common/stageTrace/useScopedTraceRequest';
import { ProjectDetails } from 'pages/organization/constants';

import { messages } from './messages';

export interface LiveFixTraceActionProps {
  projectKey: string;
  resourceKey: object;
  resultIterationId: number;
  roundNumber: number;
}

export const LiveFixTraceAction = ({
  projectKey,
  resourceKey,
  resultIterationId,
  roundNumber,
}: LiveFixTraceActionProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const resource = useMemo(
    () => ({
      projectKey,
      resourceKey,
      resultIterationId,
      roundNumber,
      organizationSlug,
      projectSlug,
    }),
    [projectKey, resourceKey, resultIterationId, roundNumber, organizationSlug, projectSlug],
  );
  const { loading, error, run } = useScopedTraceRequest<
    NonNullable<Awaited<ReturnType<typeof getLiveIterationIdentity>>>
  >(resource, enabled);
  const open = () => {
    if (!projectKey) return;
    void run(
      async (signal) => {
        const iteration = await getLiveIterationIdentity(projectKey, resultIterationId, signal);
        if (!iteration) throw new Error('Missing fix iteration identity');
        return iteration;
      },
      (iteration) =>
        dispatch(
          createStageTraceAction(
            { organizationSlug, projectSlug },
            { pipelineId: iteration.pipelineId, iterationId: iteration.id, stageKey: 'fix' },
            { fixRoundNumber: roundNumber },
          ),
        ),
    );
  };
  if (!enabled) return null;
  return (
    <div data-automation-id="live-fix-trace-action">
      <Button variant="text" disabled={loading} onClick={open}>
        {formatMessage(messages.openFix, { number: roundNumber })}
      </Button>
      {loading && <output aria-live="polite">{formatMessage(messages.resolving)}</output>}
      {error && <span role="alert">{formatMessage(messages.unresolved)}</span>}
    </div>
  );
};
