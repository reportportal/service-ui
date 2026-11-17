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
import { createStageTraceAction } from 'pages/inside/aiFactory/common/stageTrace/navigation';
import { useScopedTraceRequest } from 'pages/inside/aiFactory/common/stageTrace/useScopedTraceRequest';
import { ProjectDetails } from 'pages/organization/constants';

import { loadGenerationReviewRounds } from './loadGenerationReviewRounds';
import { messages } from './messages';

export interface GenerationReviewTraceChooserProps {
  projectKey: string;
  displayIds: string[];
  pipelineId: number;
  iterationId: number;
  stageKey?: string;
  refreshIdentity?: object;
}

export const GenerationReviewTraceChooser = ({
  projectKey,
  displayIds,
  pipelineId,
  iterationId,
  stageKey,
  refreshIdentity,
}: GenerationReviewTraceChooserProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const idsKey = JSON.stringify([...new Set(displayIds)]);
  const resource = useMemo(
    () => ({
      projectKey,
      idsKey,
      pipelineId,
      iterationId,
      stageKey,
      refreshIdentity,
      organizationSlug,
      projectSlug,
    }),
    [
      projectKey,
      idsKey,
      pipelineId,
      iterationId,
      stageKey,
      refreshIdentity,
      organizationSlug,
      projectSlug,
    ],
  );
  const { loading, data, error, run, isCurrent } = useScopedTraceRequest<
    Awaited<ReturnType<typeof loadGenerationReviewRounds>>
  >(resource, enabled);
  const ids = JSON.parse(idsKey) as string[];
  const canLoad = Boolean(projectKey && ids.length && ids.length <= 50);
  const load = () => {
    if (!canLoad) return;
    void run((signal) =>
      loadGenerationReviewRounds(
        projectKey,
        ids,
        { sourcePipelineId: pipelineId, sourceIterationId: iterationId },
        signal,
      ),
    );
  };
  const rounds = error ? [] : data?.rounds;
  if (!enabled) return null;
  return (
    <section data-automation-id="generation-review-trace-chooser">
      <h3>{formatMessage(messages.title)}</h3>
      <p>{formatMessage(messages.limitation)}</p>
      {!canLoad && <p>{formatMessage(messages.unsupported)}</p>}
      {canLoad && (
        <Button variant="text" disabled={loading} onClick={load}>
          {formatMessage(rounds ? messages.refresh : messages.load)}
        </Button>
      )}
      {loading && <output aria-live="polite">{formatMessage(messages.loading)}</output>}
      {(error || data?.incomplete) && <p role="alert">{formatMessage(messages.incomplete)}</p>}
      {rounds?.length === 0 && <p>{formatMessage(messages.empty)}</p>}
      {rounds?.map((round) => (
        <Button
          key={`${round.testCaseId}:${round.roundId}`}
          variant="text"
          onClick={() => {
            if (!isCurrent()) return;
            dispatch(
              createStageTraceAction(
                { organizationSlug, projectSlug },
                { pipelineId: round.pipelineId, iterationId: round.iterationId, stageKey: 'fix' },
                {
                  fixRoundNumber: round.roundNumber,
                  returnTo: { pipelineId, iterationId, stageKey },
                },
              ),
            );
          }}
        >
          {formatMessage(messages.open, { caseName: round.displayId, number: round.roundNumber })}
        </Button>
      ))}
    </section>
  );
};
