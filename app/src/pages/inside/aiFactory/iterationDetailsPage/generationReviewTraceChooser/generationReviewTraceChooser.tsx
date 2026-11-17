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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  PROJECT_PIPELINE_STAGE_TRACE_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import {
  loadGenerationReviewRounds,
  type GenerationReviewTraceRound,
} from './loadGenerationReviewRounds';
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
  const scope = useMemo(
    () => ({
      projectKey,
      idsKey,
      pipelineId,
      iterationId,
      stageKey,
      refreshIdentity,
      enabled,
      active: true,
      controller: undefined as AbortController | undefined,
    }),
    [projectKey, idsKey, pipelineId, iterationId, stageKey, refreshIdentity, enabled],
  );
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const [state, setState] = useState<{
    scope: object;
    loading?: boolean;
    rounds?: GenerationReviewTraceRound[];
    incomplete?: boolean;
  }>();
  const isCurrent = () => enabled && scope.active && currentScope.current === scope;
  useEffect(() => {
    scope.active = true;
    return () => {
      scope.active = false;
      scope.controller?.abort();
    };
  }, [scope]);
  const ids = JSON.parse(idsKey) as string[];
  const canLoad = Boolean(projectKey && ids.length && ids.length <= 50);
  const load = async () => {
    if (!isCurrent() || !canLoad || scope.controller) return;
    const controller = new AbortController();
    scope.controller = controller;
    setState({ scope, loading: true });
    try {
      const result = await loadGenerationReviewRounds(
        projectKey,
        ids,
        { sourcePipelineId: pipelineId, sourceIterationId: iterationId },
        controller.signal,
      );
      if (isCurrent() && !controller.signal.aborted) setState({ scope, ...result });
    } catch {
      if (isCurrent() && !controller.signal.aborted)
        setState({ scope, rounds: [], incomplete: true });
    } finally {
      if (scope.controller === controller) scope.controller = undefined;
    }
  };
  if (!enabled) return null;
  const current = state?.scope === scope ? state : undefined;
  return (
    <section data-automation-id="generation-review-trace-chooser">
      <h3>{formatMessage(messages.title)}</h3>
      <p>{formatMessage(messages.limitation)}</p>
      {!canLoad && <p>{formatMessage(messages.unsupported)}</p>}
      {canLoad && (
        <Button variant="text" disabled={current?.loading} onClick={() => void load()}>
          {formatMessage(current?.rounds ? messages.refresh : messages.load)}
        </Button>
      )}
      {current?.loading && <output aria-live="polite">{formatMessage(messages.loading)}</output>}
      {current?.incomplete && <p role="alert">{formatMessage(messages.incomplete)}</p>}
      {current?.rounds?.length === 0 && <p>{formatMessage(messages.empty)}</p>}
      {current?.rounds?.map((round) => (
        <Button
          key={`${round.testCaseId}:${round.roundId}`}
          variant="text"
          onClick={() => {
            if (!isCurrent()) return;
            dispatch({
              type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
              payload: {
                organizationSlug,
                projectSlug,
                pipelineId: round.pipelineId,
                iterationId: round.iterationId,
                stageKey: 'fix',
              },
              query: {
                fixRoundNumber: String(round.roundNumber),
                returnPipelineId: String(pipelineId),
                returnIterationId: String(iterationId),
                ...(stageKey ? { returnStageKey: stageKey } : {}),
              },
            });
          }}
        >
          {formatMessage(messages.open, { caseName: round.displayId, number: round.roundNumber })}
        </Button>
      ))}
    </section>
  );
};
