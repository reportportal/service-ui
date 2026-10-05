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

import { AiPipelineType, AiStageKey, IterationRS, Lifecycle, PipelineType, StageKey, StageStatus } from 'types/aiFactory';

/** Grade is the default stage for generation, Develop for automation (01-knowledge-base.md §4.10). */
export const defaultStageKey = (pipelineType: AiPipelineType): AiStageKey =>
  pipelineType === PipelineType.GENERATION ? StageKey.GRADE : StageKey.DEVELOP;

export type KpiItem = { key: string; value: number | string };

/** Numeric-only KPIs for the header (message keys are resolved by the component). */
export const buildKpis = (pipelineType: AiPipelineType, iteration: IterationRS): KpiItem[] => {
  const kpis: KpiItem[] = [{ key: 'kpiTestCases', value: iteration.testCasesCount }];
  if (pipelineType === PipelineType.GENERATION) {
    if (iteration.suiteScore !== undefined) {
      kpis.push({ key: 'kpiSuiteScore', value: `${iteration.suiteScore} / 100` });
    }
    if (iteration.autoReadyPromotedCount !== undefined) {
      kpis.push({
        key: 'kpiAutoReadyPromoted',
        value: `${iteration.autoReadyPromotedCount} of ${iteration.testCasesCount}`,
      });
    }
    if (iteration.readyCount !== undefined) {
      kpis.push({ key: 'kpiReadyNow', value: `${iteration.readyCount} / ${iteration.testCasesCount}` });
    }
    if (iteration.fixRoundsCount !== undefined) {
      kpis.push({ key: 'kpiFixRounds', value: iteration.fixRoundsCount });
    }
  }
  kpis.push({ key: 'kpiCost', value: iteration.costTotal });
  return kpis;
};

/** Count of Draft cases from the Review stage's per-case list — the authoritative source. */
export const draftCasesCount = (iteration: IterationRS): number => {
  const review = iteration.stages.find((stage) => stage.key === StageKey.REVIEW)?.review;
  if (!review) {
    return 0;
  }
  return review.cases.filter((c) => c.lifecycle === Lifecycle.DRAFT).length;
};

/** The stage whose failure fails the whole iteration (Create or Upload — 01 §4.10), if any. */
export const failedStage = (iteration: IterationRS) =>
  iteration.stages.find(
    (stage) =>
      (stage.key === StageKey.CREATE || stage.key === StageKey.UPLOAD) &&
      stage.status === StageStatus.FAILED,
  );

/** The stage currently in progress — names it in the Running banner (01 §3a G2). */
export const runningStage = (iteration: IterationRS) =>
  iteration.stages.find(
    (stage) => stage.status === StageStatus.RUNNING || stage.status === StageStatus.IN_PROGRESS,
  );
