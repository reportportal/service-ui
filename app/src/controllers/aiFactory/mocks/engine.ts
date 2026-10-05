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
 * Simulated backend rules for the AI Factory mock (docs/ai-factory-poc/01-knowledge-base.md §4).
 * Pure functions over `db.ts` state — handlers call these, components never do (03 §4.3).
 */

import {
  AiIterationStatus,
  AiStageStatus,
  AutomationStatus,
  EvaluationState,
  IterationStatus,
  Lifecycle,
  LifecycleActorType,
  LifecycleReason,
  PipelineType,
  StageKey,
  StageStatus,
  TokenUsageRS,
} from 'types/aiFactory';
import { findIteration, listCasesOfIteration, recordLifecycleChange } from './db';
import { MockCaseRecord, MockIterationSeed, MockPipelineSeed, MockStageSeed } from './types';

const GENERATION_STAGE_ORDER = [StageKey.CREATE, StageKey.GRADE, StageKey.UPLOAD, StageKey.REVIEW];
const AUTOMATION_STAGE_ORDER = [StageKey.PREPARE, StageKey.DEVELOP, StageKey.AUTOMATION_REVIEW, StageKey.FIX];

export const stageOrder = (pipelineType: PipelineType): StageKey[] =>
  pipelineType === PipelineType.GENERATION ? GENERATION_STAGE_ORDER : AUTOMATION_STAGE_ORDER;

const STAGE_FIELD: Record<StageKey, keyof MockIterationSeed['stages']> = {
  [StageKey.CREATE]: 'create',
  [StageKey.GRADE]: 'grade',
  [StageKey.UPLOAD]: 'upload',
  [StageKey.REVIEW]: 'upload', // Review has no seeded stage of its own — see deriveStageStatus
  [StageKey.PREPARE]: 'prepare',
  [StageKey.DEVELOP]: 'develop',
  [StageKey.AUTOMATION_REVIEW]: 'automationReview',
  [StageKey.FIX]: 'fix',
};

export const getStageSeed = (iteration: MockIterationSeed, key: StageKey): MockStageSeed | undefined =>
  iteration.stages[STAGE_FIELD[key]];

export const deriveStageStatus = (iteration: MockIterationSeed, key: StageKey): AiStageStatus => {
  if (key === StageKey.REVIEW) {
    const upload = iteration.stages.upload;
    if (upload?.status !== StageStatus.PASSED) {
      return StageStatus.PENDING;
    }
    const cases = listCasesOfIteration(iteration.id);
    return cases.length && cases.every((c) => c.lifecycle === Lifecycle.READY)
      ? StageStatus.DONE
      : StageStatus.IN_PROGRESS;
  }
  return getStageSeed(iteration, key)?.status ?? StageStatus.PENDING;
};

export const deriveIterationStatus = (pipeline: MockPipelineSeed, iteration: MockIterationSeed): AiIterationStatus => {
  const keys = stageOrder(pipeline.type);
  const failGate = pipeline.type === PipelineType.GENERATION ? [StageKey.CREATE, StageKey.UPLOAD] : keys;
  if (failGate.some((k) => deriveStageStatus(iteration, k) === StageStatus.FAILED)) {
    return IterationStatus.FAILED;
  }
  if (keys.some((k) => deriveStageStatus(iteration, k) === StageStatus.RUNNING)) {
    return IterationStatus.RUNNING;
  }
  if (pipeline.type === PipelineType.AUTOMATION) {
    return IterationStatus.COMPLETED;
  }
  const upload = iteration.stages.upload;
  if (upload?.status !== StageStatus.PASSED) {
    return IterationStatus.RUNNING;
  }
  return deriveStageStatus(iteration, StageKey.REVIEW) === StageStatus.DONE
    ? IterationStatus.COMPLETED
    : IterationStatus.IN_REVIEW;
};

export const addTokens = (a: TokenUsageRS, b: TokenUsageRS): TokenUsageRS => ({
  model: a.model || b.model,
  input: a.input + b.input,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
  output: a.output + b.output,
  cost: a.cost + b.cost,
});

const ZERO_TOKENS: TokenUsageRS = { model: '', input: 0, cacheRead: 0, cacheWrite: 0, output: 0, cost: 0 };

/** Create + Grade + Upload cost/tokens — the base an iteration's cases share, before fix rounds. */
export const baseCost = (iteration: MockIterationSeed): number =>
  [iteration.stages.create, iteration.stages.grade, iteration.stages.upload].reduce(
    (sum, stage) => sum + (stage?.cost || 0),
    0,
  );

const baseTokens = (iteration: MockIterationSeed): TokenUsageRS =>
  [iteration.stages.create, iteration.stages.grade, iteration.stages.upload].reduce<TokenUsageRS>(
    (sum, stage) => (stage?.tokens[0] ? addTokens(sum, stage.tokens[0]) : sum),
    ZERO_TOKENS,
  );

export const fixRoundsCost = (iteration: MockIterationSeed): number =>
  listCasesOfIteration(iteration.id).reduce(
    (sum, c) => sum + c.fixRounds.reduce((s, r) => s + (r.cost || 0), 0),
    0,
  );

export const iterationCost = (iteration: MockIterationSeed): number => baseCost(iteration) + fixRoundsCost(iteration);

export const readyCount = (iterationId: number): number =>
  listCasesOfIteration(iterationId).filter((c) => c.lifecycle === Lifecycle.READY).length;

export const autoReadyPromotedCount = (iterationId: number): number =>
  listCasesOfIteration(iterationId).filter(
    (c) => c.lifecycle === Lifecycle.READY && c.lifecycleHistory.some((h) => h.reason === LifecycleReason.AUTO_READY),
  ).length;

/** = (Create + Grade + Upload cost of the case's iteration) ÷ number of its cases. */
export const caseShare = (caseRecord: MockCaseRecord, iteration: MockIterationSeed): { amount: number; tokens: TokenUsageRS; casesCount: number } => {
  const casesCount = Math.max(1, listCasesOfIteration(iteration.id).length);
  const tokens = baseTokens(iteration);
  return {
    amount: baseCost(iteration) / casesCount,
    tokens: { ...tokens, input: tokens.input / casesCount, cacheRead: tokens.cacheRead / casesCount, cacheWrite: tokens.cacheWrite / casesCount, output: tokens.output / casesCount, cost: tokens.cost / casesCount },
    casesCount,
  };
};

export const caseCost = (caseRecord: MockCaseRecord, iteration: MockIterationSeed): number =>
  caseShare(caseRecord, iteration).amount + caseRecord.fixRounds.reduce((s, r) => s + (r.cost || 0), 0);

const pendingCommentsCount = (caseRecord: MockCaseRecord): number =>
  caseRecord.comments.filter((c) => c.state === 'PENDING').length;

/**
 * US-005: promotes a Draft AI case to Ready when Auto-Ready is on, the evaluation is Evaluated
 * (not Obsolete) and ≥ threshold, and there are no unsent comments or a running fix. Never demotes.
 */
export const totalScore = (caseRecord: MockCaseRecord): number | undefined =>
  caseRecord.evaluation?.criteria.reduce((s, c) => s + c.score, 0);

export const applyAutoReady = (caseRecord: MockCaseRecord, settings: { autoReady: boolean; threshold: number }): boolean => {
  const score = totalScore(caseRecord);
  if (
    !settings.autoReady ||
    !caseRecord.ai ||
    caseRecord.lifecycle !== Lifecycle.DRAFT ||
    caseRecord.evaluation?.state !== EvaluationState.EVALUATED ||
    caseRecord.fixRoundRunning ||
    pendingCommentsCount(caseRecord) > 0 ||
    score === undefined ||
    score < settings.threshold
  ) {
    return false;
  }
  recordLifecycleChange(
    caseRecord,
    Lifecycle.READY,
    LifecycleReason.AUTO_READY,
    { type: LifecycleActorType.AUTO_READY, name: 'Auto-Ready' },
    `${score} ≥ ${settings.threshold}`,
  );
  return true;
};

export const unsentCommentsCount = pendingCommentsCount;

/** `null` = can be automated; otherwise the reason it must be skipped. */
export const automateSkipReason = (caseRecord: MockCaseRecord): 'NOT_READY' | 'FIX_RUNNING' | 'AUTOMATION_IN_PROGRESS' | null => {
  if (caseRecord.fixRoundRunning) return 'FIX_RUNNING';
  if (caseRecord.automation?.status === AutomationStatus.IN_PROGRESS) return 'AUTOMATION_IN_PROGRESS';
  if (caseRecord.lifecycle !== Lifecycle.READY) return 'NOT_READY';
  return null;
};

/** The generation iteration that created the case — most handlers need both. */
export const getCaseIteration = (caseRecord: MockCaseRecord): MockIterationSeed | undefined =>
  caseRecord.ai ? findIteration(caseRecord.ai.iterationId) : undefined;
