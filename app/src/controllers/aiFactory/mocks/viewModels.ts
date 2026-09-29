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

/**
 * Projects `db.ts` internal records into the public contract DTOs (`types/aiFactory.ts`).
 * Handlers call these; nothing else should build a response shape by hand.
 */

import {
  IterationRS,
  IterationSummaryRS,
  Lifecycle,
  PipelineRS,
  PipelineType,
  ReviewCaseSummaryRS,
  StageKey,
  StageRS,
  StageSummaryRS,
  TestCaseAiExtension,
  TestCaseAiRS,
} from 'types/aiFactory';
import { findCase, listCasesOfIteration } from './db';
import {
  autoReadyPromotedCount,
  caseCost,
  caseShare,
  deriveIterationStatus,
  deriveStageStatus,
  getStageSeed,
  iterationCost,
  readyCount,
  stageOrder,
  totalScore,
  unsentCommentsCount,
} from './engine';
import { MockCaseRecord, MockIterationSeed, MockPipelineSeed } from './types';

export const toPipelineRS = (pipeline: MockPipelineSeed, iterationsCount: number): PipelineRS => ({
  id: pipeline.id,
  type: pipeline.type,
  name: pipeline.name,
  repository: pipeline.repository,
  iterationsCount,
  settings: pipeline.settings,
});

const stageSummary = (iteration: MockIterationSeed, key: StageKey): StageSummaryRS => {
  const seed = getStageSeed(iteration, key);
  const cases = listCasesOfIteration(iteration.id);
  const metricByKey: Record<string, number | undefined> = {
    [StageKey.CREATE]: cases.length || undefined,
    [StageKey.GRADE]: seed?.suiteScore,
    [StageKey.UPLOAD]: cases.length || undefined,
    [StageKey.REVIEW]: cases.length ? readyCount(iteration.id) : undefined,
  };
  return {
    key,
    status: deriveStageStatus(iteration, key),
    metric: metricByKey[key],
    cost: key === StageKey.REVIEW ? cases.reduce((s, c) => s + c.fixRounds.reduce((a, r) => a + (r.cost || 0), 0), 0) : seed?.cost || 0,
  };
};

export const toIterationSummaryRS = (pipeline: MockPipelineSeed, iteration: MockIterationSeed): IterationSummaryRS => ({
  id: iteration.id,
  pipelineId: iteration.pipelineId,
  number: iteration.number,
  status: deriveIterationStatus(pipeline, iteration),
  requirement: iteration.requirement,
  testCases: iteration.testCaseIds?.map((id) => ({ id, displayId: findCase(id)?.displayId || String(id) })),
  trigger: iteration.trigger,
  startedBy: iteration.startedBy,
  model: iteration.model,
  environment: iteration.environment,
  startedAt: iteration.startedAt,
  durationMs: iteration.durationMs,
  testCasesCount: iteration.testCaseIds?.length ?? listCasesOfIteration(iteration.id).length,
  suiteScore: iteration.stages.grade?.suiteScore,
  costTotal: iterationCost(iteration),
  readyCount: pipeline.type === PipelineType.GENERATION ? readyCount(iteration.id) : undefined,
  fixRoundsCount:
    pipeline.type === PipelineType.GENERATION
      ? listCasesOfIteration(iteration.id).reduce((s, c) => s + c.fixRounds.length, 0)
      : undefined,
  launch: iteration.launch,
  mergeRequest: iteration.mergeRequest,
  ciPipeline: iteration.ciPipeline,
  attributes: [
    { key: 'env', value: iteration.environment },
    ...(iteration.requirement ? [{ key: 'spec', value: iteration.requirement.specId }, { key: 'jira', value: iteration.requirement.jiraKey || '' }] : []),
    ...(iteration.mergeRequest ? [{ key: 'mr', value: iteration.mergeRequest.id }] : []),
    { key: 'ci', value: iteration.ciPipeline.id },
  ].filter((a) => a.value),
  stages: stageOrder(pipeline.type).map((key) => stageSummary(iteration, key)),
});

const toReviewCaseSummary = (c: MockCaseRecord): ReviewCaseSummaryRS => {
  const readyEntry = [...c.lifecycleHistory].reverse().find((h) => h.to === Lifecycle.READY);
  return {
    testCaseId: c.id,
    displayId: c.displayId,
    name: c.displayId,
    lifecycle: c.lifecycle,
    madeReadyBy: c.lifecycle === Lifecycle.READY ? readyEntry?.actor.name : undefined,
    madeReadyAt: c.lifecycle === Lifecycle.READY ? readyEntry?.at : undefined,
    unsentComments: unsentCommentsCount(c),
    currentScore: totalScore(c),
    evaluationState: c.evaluation?.state,
    fixRunning: Boolean(c.fixRoundRunning),
  };
};

const toStageRS = (pipeline: MockPipelineSeed, iteration: MockIterationSeed, key: StageKey): StageRS => {
  const seed = getStageSeed(iteration, key);
  const summary = stageSummary(iteration, key);
  const cases = listCasesOfIteration(iteration.id);
  const base: StageRS = { ...summary, startedAt: iteration.startedAt, durationMs: seed?.durationMs, tokens: seed?.tokens || [] };
  if (key === StageKey.CREATE && cases.length) {
    base.create = {
      cases: cases.map((c) => ({ name: c.displayId, priority: c.priority, testCaseId: c.id, displayId: c.displayId })),
    };
  }
  if (key === StageKey.GRADE && seed) {
    base.grade = {
      suiteScore: seed.suiteScore || 0,
      warnings: [],
      cases: cases.map((c) => ({ name: c.displayId, testCaseId: c.id, displayId: c.displayId, totalScore: totalScore(c) || 0, criteria: c.evaluation?.criteria || [] })),
    };
  }
  if (key === StageKey.UPLOAD && seed) {
    base.upload = {
      threshold: seed.threshold || 90,
      results: cases.map((c) => ({
        name: c.displayId,
        testCaseId: c.id,
        displayId: c.displayId,
        result: c.lifecycle === Lifecycle.READY ? 'CREATED_READY_AUTO' : 'CREATED_DRAFT',
        score: totalScore(c),
      })),
    };
  }
  if (key === StageKey.REVIEW) {
    base.review = {
      cases: cases.map(toReviewCaseSummary),
      fixRounds: cases.flatMap((c) => [...c.fixRounds, ...(c.fixRoundRunning ? [runningFixRoundRS(c)] : [])]),
    };
  }
  if (pipeline.type === PipelineType.AUTOMATION && seed?.perCase) {
    base.perCase = Object.entries(seed.perCase).map(([id, result]) => ({ testCaseId: Number(id), displayId: `TC${id}`, name: `TC${id}`, status: summary.status, result }));
  }
  return base;
};

const runningFixRoundRS = (c: MockCaseRecord) => ({
  round: c.fixRoundRunning.round,
  testCaseId: c.id,
  displayId: c.displayId,
  status: 'RUNNING' as const,
  pushedBy: 'You',
  pushedAt: c.fixRoundRunning.startedAt,
  commentsCount: c.comments.filter((x) => x.state === 'SENT').length,
});

export const toIterationRS = (pipeline: MockPipelineSeed, iteration: MockIterationSeed): IterationRS => ({
  ...toIterationSummaryRS(pipeline, iteration),
  libraryFolder: iteration.folderPath ? { id: iteration.id, path: iteration.folderPath } : undefined,
  autoReadyPromotedCount: pipeline.type === PipelineType.GENERATION ? autoReadyPromotedCount(iteration.id) : undefined,
  stages: stageOrder(pipeline.type).map((key) => toStageRS(pipeline, iteration, key)),
});

export const toTestCaseAiExtension = (c: MockCaseRecord, pipeline?: MockPipelineSeed, iteration?: MockIterationSeed): TestCaseAiExtension => ({
  lifecycle: c.lifecycle,
  ai:
    c.ai && iteration
      ? { generatedByIteration: { pipelineId: iteration.pipelineId, iterationId: iteration.id, number: iteration.number }, modifiedByAgent: c.ai.modifiedByAgent, factoryKey: c.ai.factoryKey }
      : undefined,
  evaluationSummary: c.evaluation && { totalScore: totalScore(c) || 0, state: c.evaluation.state },
  costSummary: c.ai && iteration ? { approxTotal: caseCost(c, iteration) } : undefined,
  review: { unsentCommentsCount: unsentCommentsCount(c), fixRound: c.fixRoundRunning ? { number: c.fixRoundRunning.round, status: 'RUNNING' } : undefined },
  automation: c.automation && { status: c.automation.status },
  blockedPlans: undefined, // filled by the caller, which has the plan list (db.plansBlockedByCase)
});

export const toTestCaseAiRS = (c: MockCaseRecord, pipeline?: MockPipelineSeed, iteration?: MockIterationSeed): TestCaseAiRS => ({
  evaluation:
    c.evaluation && iteration
      ? {
          totalScore: totalScore(c) || 0,
          state: c.evaluation.state,
          source: { iterationId: iteration.id, iterationNumber: iteration.number, fixRound: c.evaluation.sourceFixRound },
          evaluatedAt: c.evaluation.evaluatedAt,
          criteria: c.evaluation.criteria,
        }
      : undefined,
  cost:
    c.ai && iteration
      ? (() => {
          const share = caseShare(c, iteration);
          return {
            approxTotal: caseCost(c, iteration),
            iterationShare: { iterationNumber: iteration.number, amount: share.amount, iterationBaseCost: share.amount * share.casesCount, casesCount: share.casesCount },
            fixRounds: c.fixRounds.map((r) => ({ round: r.round, amount: r.cost || 0 })),
            tokens: share.tokens,
            model: iteration.model,
          };
        })()
      : undefined,
  pipelineLinks: iteration
    ? [
        { pipelineId: iteration.pipelineId, iterationId: iteration.id, iterationNumber: iteration.number, stage: StageKey.GRADE },
        ...c.fixRounds.map((r) => ({ pipelineId: iteration.pipelineId, iterationId: iteration.id, iterationNumber: iteration.number, stage: StageKey.REVIEW, fixRound: r.round })),
      ]
    : [],
  lastAgentChange: c.lastAgentChange,
  automation: c.automation && {
    status: c.automation.status,
    iteration: c.automation.iterationId ? { pipelineId: 2, iterationId: c.automation.iterationId, number: 1 } : undefined,
    launch: c.automation.launch,
    lastResult: c.automation.lastResult,
    scenarioChangedAfterAutomation: c.automation.scenarioChangedAfterAutomation,
  },
  lifecycleHistory: c.lifecycleHistory,
});
