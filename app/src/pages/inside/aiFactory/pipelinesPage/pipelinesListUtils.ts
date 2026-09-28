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

import { formatDuration } from 'common/utils/timeDateUtils';
import {
  AiPipelineType,
  IterationStatus,
  IterationSummaryRS,
  PipelineType,
  StageKey,
  StageSummaryRS,
} from 'types/aiFactory';

/**
 * Matches a search term against a requirement/pipeline name/iteration number, the same fields
 * P2's `search` param matches server-side (01-knowledge-base.md §4.10). Done client-side here:
 * the mock dataset (and the real one, for a while) is small enough that fetching every iteration
 * once and filtering in memory reproduces the same result without a request per keystroke.
 */
export const matchesSearch = (
  iteration: IterationSummaryRS,
  pipelineName: string,
  search: string,
): boolean => {
  if (!search.trim()) {
    return true;
  }
  const term = search.trim().toLowerCase();
  const haystack = [
    pipelineName,
    `#${iteration.number}`,
    iteration.requirement?.specId,
    iteration.requirement?.title,
    iteration.requirement?.jiraKey,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
};

/**
 * `null` when the stage has no metric worth showing next to its label (e.g. a running Prepare
 * stage with no per-case results yet). Returns structured data — the caller formats it via
 * react-intl, since "cases"/"Score"/"Ready" are fixed vocabulary and must be translatable.
 */
export type StageMetric =
  | { kind: 'cases'; count: number }
  | { kind: 'score'; score: number }
  | { kind: 'ready'; ready: number; total: number };

export const stageMetric = (stage: StageSummaryRS, testCasesCount: number): StageMetric | null => {
  if (stage.metric === undefined) {
    return null;
  }
  switch (stage.key) {
    case StageKey.CREATE:
    case StageKey.UPLOAD:
      return { kind: 'cases', count: stage.metric };
    case StageKey.GRADE:
      return { kind: 'score', score: stage.metric };
    case StageKey.REVIEW:
      return { kind: 'ready', ready: stage.metric, total: testCasesCount };
    default:
      return null;
  }
};

/** Structured outcome data for the iteration card's outcome line — see {@link StageMetric}. */
export type Outcome =
  | { kind: 'generationReady'; ready: number; total: number; fixRounds: number }
  | { kind: 'automationRunning'; total: number }
  | { kind: 'automationDone'; implemented: number; total: number; launchNumber?: number };

export const outcome = (pipelineType: AiPipelineType, iteration: IterationSummaryRS): Outcome => {
  if (pipelineType === PipelineType.GENERATION) {
    return {
      kind: 'generationReady',
      ready: iteration.readyCount ?? 0,
      total: iteration.testCasesCount,
      fixRounds: iteration.fixRoundsCount ?? 0,
    };
  }
  if (iteration.status === IterationStatus.RUNNING) {
    return { kind: 'automationRunning', total: iteration.testCasesCount };
  }
  return {
    kind: 'automationDone',
    implemented: iteration.status === IterationStatus.COMPLETED ? iteration.testCasesCount : 0,
    total: iteration.testCasesCount,
    launchNumber: iteration.launch?.number,
  };
};

/** "Requirement" meta field: the spec for generation, or a short list of TC ids for automation. */
export const requirementOrTestCasesLabel = (iteration: IterationSummaryRS): string | undefined => {
  if (iteration.requirement) {
    return `${iteration.requirement.specId} · ${iteration.requirement.title}`;
  }
  if (iteration.testCases?.length) {
    return iteration.testCases.map((testCase) => testCase.displayId).join(', ');
  }
  return undefined;
};

export const startedAndDuration = (iteration: IterationSummaryRS): string => {
  const started = new Date(iteration.startedAt).toLocaleString();
  return iteration.durationMs ? `${started} · ${formatDuration(iteration.durationMs)}` : started;
};
