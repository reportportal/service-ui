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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import type { LiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import { getLiveFixTraceTarget } from 'pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget';
import {
  getLiveLibraryCases,
  type LiveLibraryCase,
} from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import { loadLiveFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import { normalizeLiveReview } from 'pages/inside/aiFactory/review/liveReviewComments';

export interface GenerationReviewTraceRound {
  testCaseId: number;
  displayId: string;
  roundId: number;
  roundNumber: number;
  iterationId: number;
  pipelineId: number;
  stageKey: string;
}

export interface GenerationReviewSource {
  sourcePipelineId: number;
  sourceIterationId: number;
}

interface RoundResolution {
  round?: GenerationReviewTraceRound;
  incomplete: boolean;
}

const isDirectResult = (iteration: LiveIterationIdentity, source: GenerationReviewSource) =>
  iteration.pipelineId === source.sourcePipelineId &&
  iteration.id !== source.sourceIterationId &&
  (iteration.rerunOf === undefined || iteration.rerunOf.id === source.sourceIterationId);

const resolveCaseRound = async (
  projectKey: string,
  displayId: string,
  testCase: LiveLibraryCase | null,
  source: GenerationReviewSource,
  signal: AbortSignal,
): Promise<RoundResolution> => {
  if (!testCase || signal.aborted) return { incomplete: true };
  try {
    const response = await fetch(URLS.liveTestCaseReview(projectKey, testCase.id), { signal });
    const review = normalizeLiveReview(response);
    if (!review.fixRoundId) return { incomplete: false };
    const round = await loadLiveFixRound(projectKey, testCase.id, review.fixRoundId, signal);
    if (!round.resultIterationId || round.previousIterationId !== source.sourceIterationId)
      return { incomplete: false };
    const iteration = await getLiveFixTraceTarget(projectKey, round.resultIterationId, signal);
    if (!iteration) return { incomplete: true };
    if (!isDirectResult(iteration, source)) return { incomplete: false };
    return {
      incomplete: false,
      round: {
        testCaseId: testCase.id,
        displayId,
        roundId: round.id,
        roundNumber: round.roundNumber,
        iterationId: iteration.id,
        pipelineId: iteration.pipelineId,
        stageKey: iteration.stageKey,
      },
    };
  } catch {
    return { incomplete: true };
  }
};

export const loadGenerationReviewRounds = async (
  projectKey: string,
  displayIds: string[],
  source: GenerationReviewSource,
  signal: AbortSignal,
): Promise<{ rounds: GenerationReviewTraceRound[]; incomplete: boolean }> => {
  const cases = await getLiveLibraryCases(projectKey, displayIds, signal);
  const results = await Promise.all(
    cases.map(({ displayId, testCase }) =>
      resolveCaseRound(projectKey, displayId, testCase, source, signal),
    ),
  );
  return {
    rounds: results.flatMap(({ round }) => (round ? [round] : [])),
    incomplete: results.some(({ incomplete }) => incomplete),
  };
};
