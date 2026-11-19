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

import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { createStageTraceAction } from 'pages/inside/aiFactory/common/stageTrace/navigation';
import { useScopedTraceRequest } from 'pages/inside/aiFactory/common/stageTrace/useScopedTraceRequest';
import { loadGenerationReviewRounds } from 'pages/inside/aiFactory/iterationDetailsPage/generationReviewTraceChooser/loadGenerationReviewRounds';
import type { LiveLibraryCase } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import { LiveFixRoundDetails } from 'pages/inside/aiFactory/review/liveFixRoundHistory/liveFixRoundDetails';
import { ProjectDetails } from 'pages/organization/constants';
import { messages } from 'pages/inside/aiFactory/iterationDetailsPage/generationReviewTraceChooser/messages';

export interface GenerationReviewTraceChooserProps {
  projectKey: string;
  cases: LiveLibraryCase[];
  pipelineId: number;
  iterationId: number;
  stageKey?: string;
  refreshVersion?: number | object;
}

export const GenerationReviewTraceChooser = ({
  projectKey,
  cases,
  pipelineId,
  iterationId,
  stageKey,
  refreshVersion,
}: GenerationReviewTraceChooserProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const caseScope = useMemo(
    () => ({ projectKey, pipelineId, iterationId, stageKey, organizationSlug, projectSlug }),
    [projectKey, pipelineId, iterationId, stageKey, organizationSlug, projectSlug],
  );
  const [selection, setSelection] = useState<{ scope: object; value: string }>();
  const selected = cases.find(
    ({ id }) => selection?.scope === caseScope && String(id) === selection.value,
  );
  const testCase = selected ?? (cases.length === 1 ? cases[0] : undefined);
  const caseId = testCase?.id;
  const displayId = testCase?.displayId;
  const resource = useMemo(
    () => ({ caseScope, caseId, displayId, refreshVersion }),
    [caseScope, caseId, displayId, refreshVersion],
  );
  const { loading, data, error, run, isCurrent } = useScopedTraceRequest<
    Awaited<ReturnType<typeof loadGenerationReviewRounds>>
  >(resource, enabled);
  const caseOptions = cases.map(({ id, displayId: label, name }) => ({
    label: formatMessage(messages.caseOption, { displayId: label, name }),
    value: String(id),
  }));
  const load = () => {
    if (!testCase) return;
    run((signal) =>
      loadGenerationReviewRounds(
        projectKey,
        testCase,
        { sourcePipelineId: pipelineId, sourceIterationId: iterationId },
        signal,
      ),
    );
  };
  const rounds = error ? undefined : data?.rounds;
  if (!enabled) return null;
  return (
    <section data-automation-id="generation-review-trace-chooser">
      <h3>{formatMessage(messages.title)}</h3>
      <p>{formatMessage(messages.limitation)}</p>
      {caseOptions.length > 0 ? (
        <>
          <Dropdown
            label={formatMessage(messages.caseLabel)}
            placeholder={formatMessage(messages.casePlaceholder)}
            options={caseOptions}
            value={testCase ? String(testCase.id) : ''}
            onChange={(value) => {
              if (typeof value === 'string') setSelection({ scope: caseScope, value });
            }}
            data-automation-id="generationReviewTraceCase"
          />
          <Button variant="text" disabled={loading || !testCase} onClick={load}>
            {formatMessage(rounds ? messages.refresh : messages.load)}
          </Button>
        </>
      ) : (
        <p>{formatMessage(messages.noCases)}</p>
      )}
      {loading && <output aria-live="polite">{formatMessage(messages.loading)}</output>}
      {(error || data?.incomplete) && <p role="alert">{formatMessage(messages.incomplete)}</p>}
      {!data?.incomplete && rounds?.length === 0 && <p>{formatMessage(messages.empty)}</p>}
      <ul>
        {rounds?.map((round) => (
          <li key={`${round.testCaseId}:${round.roundId}`}>
            <span>{round.displayId}</span>
            <LiveFixRoundDetails round={round} />
            {round.traceUnavailable && <p>{formatMessage(messages.unresolved)}</p>}
            {round.pipelineId && round.iterationId && round.stageKey && (
              <Button
                variant="text"
                onClick={() => {
                  if (!isCurrent() || !round.pipelineId || !round.iterationId || !round.stageKey)
                    return;
                  dispatch(
                    createStageTraceAction(
                      { organizationSlug, projectSlug },
                      {
                        pipelineId: round.pipelineId,
                        iterationId: round.iterationId,
                        stageKey: round.stageKey,
                      },
                      {
                        fixRoundNumber: round.roundNumber,
                        returnTo: { pipelineId, iterationId, stageKey },
                      },
                    ),
                  );
                }}
              >
                {formatMessage(messages.open, {
                  caseName: round.displayId,
                  number: round.roundNumber,
                })}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
