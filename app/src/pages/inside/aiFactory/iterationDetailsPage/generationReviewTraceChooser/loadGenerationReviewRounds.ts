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

import type { LiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import {
  getLiveFixTraceTarget,
  type LiveFixTraceTarget,
} from 'pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget';
import type { LiveLibraryCase } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import {
  loadLiveFixRoundHistory,
  type NativeFixRound,
} from 'pages/inside/aiFactory/review/liveFixRounds';

export interface GenerationReviewTraceRound extends NativeFixRound {
  displayId: string;
  roundId: number;
  iterationId?: number;
  pipelineId?: number;
  stageKey?: string;
  traceUnavailable?: boolean;
}

export interface GenerationReviewSource {
  sourcePipelineId: number;
  sourceIterationId: number;
}

const mapLimited = async <T, R>(items: T[], read: (item: T) => Promise<R>): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let next = 0;
  const work = async (): Promise<void> => {
    const index = next;
    next += 1;
    if (index >= items.length) return;
    results[index] = await read(items[index]);
    return work();
  };
  await Promise.all(Array.from({ length: Math.min(5, items.length) }, work));
  return results;
};

const isDirectResult = (iteration: LiveIterationIdentity, source: GenerationReviewSource) =>
  iteration.pipelineId === source.sourcePipelineId &&
  iteration.id !== source.sourceIterationId &&
  (iteration.rerunOf === undefined || iteration.rerunOf.id === source.sourceIterationId);

const createTargetResolver = (projectKey: string, signal: AbortSignal) => {
  const targets = new Map<number, Promise<LiveFixTraceTarget | undefined>>();
  return (id: number) => {
    const existing = targets.get(id);
    if (existing !== undefined) return existing;
    const request: Promise<LiveFixTraceTarget | undefined> = getLiveFixTraceTarget(
      projectKey,
      id,
      signal,
    ).catch((): undefined => undefined);
    targets.set(id, request);
    return request;
  };
};

const resolveRound = async (
  round: GenerationReviewTraceRound,
  source: GenerationReviewSource,
  resolveTarget: ReturnType<typeof createTargetResolver>,
): Promise<GenerationReviewTraceRound> => {
  if (!round.resultIterationId) return round;
  const iteration = await resolveTarget(round.resultIterationId);
  if (!iteration || !isDirectResult(iteration, source)) return { ...round, traceUnavailable: true };
  return {
    ...round,
    iterationId: iteration.id,
    pipelineId: iteration.pipelineId,
    stageKey: iteration.stageKey,
  };
};

const ensureRequestIsActive = (signal: AbortSignal) => {
  if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');
};

export const loadGenerationReviewRounds = async (
  projectKey: string,
  testCase: Pick<LiveLibraryCase, 'id' | 'displayId'>,
  source: GenerationReviewSource,
  signal: AbortSignal,
): Promise<{ rounds: GenerationReviewTraceRound[]; incomplete: boolean }> => {
  ensureRequestIsActive(signal);
  const history = await loadLiveFixRoundHistory(projectKey, testCase.id, signal);
  ensureRequestIsActive(signal);
  const sourceRounds = history
    .filter((round) => round.previousIterationId === source.sourceIterationId)
    .map((round) => ({ ...round, roundId: round.id, displayId: testCase.displayId }));
  const resolveTarget = createTargetResolver(projectKey, signal);
  const rounds = await mapLimited(sourceRounds, (round) =>
    resolveRound(round, source, resolveTarget),
  );
  return { rounds, incomplete: rounds.some((round) => round.traceUnavailable) };
};
