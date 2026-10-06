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
 * Registers every endpoint of docs/ai-factory-poc/05-backend-contract.md on an
 * `axios-mock-adapter` instance. Called by `index.ts`. Each handler only reads/writes `db.ts`
 * through `engine.ts`/`viewModels.ts` — no business rule lives here.
 */

import MockAdapter from 'axios-mock-adapter';
import { AxiosRequestConfig } from 'axios';
import {
  AutomationStatus,
  EvaluationState,
  FixRoundRS,
  FixRoundStatus,
  IterationPageRS,
  Lifecycle,
  LifecycleActorType,
  LifecycleReason,
  MergeRequestState,
  StageKey,
  StageStatus,
} from 'types/aiFactory';
import {
  findCase,
  findIteration,
  findPipeline,
  getDb,
  listIterations,
  nextCommentId,
  nextFixRoundNumber,
  persist,
  plansBlockedByCase,
  recordLifecycleChange,
  reviewCommentsForCase,
} from './db';
import { applyAutoReady, automateSkipReason } from './engine';
import {
  toIterationRS,
  toIterationSummaryRS,
  toPipelineCompareRS,
  toPipelineRS,
  toTestCaseAiExtension,
  toTestCaseAiRS,
} from './viewModels';
import {
  SCRIPTED_FIX_FAILURE,
  SCRIPTED_FIX_SCORE,
  SCRIPTED_GRADE_FAILURE,
} from './seedData';
import { MockCaseRecord, MockIterationSeed, MockStageSeed } from './types';

/** Real network delay would make a demo feel too instant; this makes fix rounds/automation feel real. */
export const SIMULATED_DELAY_MS = 1500;
const AUTOMATION_ENVIRONMENTS = ['beta5', 'qa', 'dev5'];

const url = (config: AxiosRequestConfig) => config.url || '';
const query = (config: AxiosRequestConfig) => new URL(url(config), 'https://mock').searchParams;
const body = <T>(config: AxiosRequestConfig): T =>
  (typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}) as T;
const notFound = (): [number, { errorCode: number; message: string }] => [404, { errorCode: 40404, message: 'Not found' }];
const conflict = (reason: string): [number, { reason: string }] => [409, { reason }];

interface AutomationPayload {
  testCaseIds: number[];
  environment: string;
  confirmReautomate: boolean;
}

const isAutomationPayload = (value: unknown): value is AutomationPayload => {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    Array.isArray(payload.testCaseIds) &&
    payload.testCaseIds.length > 0 &&
    payload.testCaseIds.every((id) => typeof id === 'number' && Number.isSafeInteger(id) && id > 0) &&
    new Set(payload.testCaseIds).size === payload.testCaseIds.length &&
    typeof payload.environment === 'string' &&
    AUTOMATION_ENVIRONMENTS.includes(payload.environment) &&
    typeof payload.confirmReautomate === 'boolean'
  );
};

const caseWithExtension = (c: MockCaseRecord) => {
  const iteration = c.ai ? findIteration(c.ai.iterationId) : undefined;
  const pipeline = iteration ? findPipeline(iteration.pipelineId) : undefined;
  return {
    ...toTestCaseAiExtension(c, pipeline, iteration),
    blockedPlans: plansBlockedByCase(c.id).map((p) => ({ id: p.id, name: p.name })),
  };
};

export const installAiFactoryHandlers = (mock: MockAdapter): void => {
  // P1 — GET tms/pipeline
  mock.onGet(/\/tms\/pipeline$/).reply(() => [200, getDb().pipelines.map((p) => toPipelineRS(p, listIterations(p.id).length))]);

  // P2 — GET tms/pipeline/{id}/iteration
  mock.onGet(/\/tms\/pipeline\/(\d+)\/iteration(?:\?.*)?$/).reply((config) => {
    const [, pipelineId] = url(config).match(/\/tms\/pipeline\/(\d+)\/iteration/);
    const pipeline = findPipeline(Number(pipelineId));
    if (!pipeline) return notFound();
    const q = query(config);
    const search = (q.get('search') || '').toLowerCase();
    const all = listIterations(pipeline.id).filter(
      (it) =>
        !search ||
        `${pipeline.name} #${it.number} ${it.requirement?.specId || ''} ${it.requirement?.title || ''}`.toLowerCase().includes(search),
    );
    const limit = Number(q.get('limit')) || all.length;
    const offset = Number(q.get('offset')) || 0;
    const content = all.slice(offset, offset + limit).map((it) => toIterationSummaryRS(pipeline, it));
    const page: IterationPageRS = { content, page: { number: Math.floor(offset / limit) || 0, size: limit, totalElements: all.length, totalPages: Math.ceil(all.length / limit) || 1 } };
    return [200, page];
  });

  // P3 — GET tms/pipeline/{id}/iteration/{iterationId}
  mock.onGet(/\/tms\/pipeline\/(\d+)\/iteration\/(\d+)$/).reply((config) => {
    const m = url(config).match(/\/tms\/pipeline\/(\d+)\/iteration\/(\d+)/);
    const pipeline = findPipeline(Number(m[1]));
    const iteration = findIteration(Number(m[2]));
    if (!pipeline || iteration?.pipelineId !== pipeline.id) return notFound();
    return [200, toIterationRS(pipeline, iteration)];
  });

  // P4 — GET/PUT tms/pipeline/{id}/settings
  mock.onGet(/\/tms\/pipeline\/(\d+)\/settings$/).reply((config) => {
    const [, pipelineId] = url(config).match(/\/tms\/pipeline\/(\d+)\/settings/);
    const pipeline = findPipeline(Number(pipelineId));
    if (!pipeline?.settings) return notFound();
    return [200, pipeline.settings];
  });
  mock.onPut(/\/tms\/pipeline\/(\d+)\/settings$/).reply((config) => {
    const [, pipelineId] = url(config).match(/\/tms\/pipeline\/(\d+)\/settings/);
    const pipeline = findPipeline(Number(pipelineId));
    if (!pipeline?.settings) return notFound();
    const payload = body<{ autoReady: boolean; threshold: number }>(config);
    if (!Number.isInteger(payload.threshold) || payload.threshold < 0 || payload.threshold > 100) {
      return [400, { errorCode: 40001, message: 'Threshold must be a whole number from 0 to 100' }];
    }
    pipeline.settings = { ...pipeline.settings, autoReady: payload.autoReady, threshold: payload.threshold };
    persist();
    return [200, pipeline.settings];
  });

  // LP5 — PATCH pipeline/{id}; live Auto-Ready field names adapted to the PoC view model.
  mock.onPatch(/\/pipeline\/(\d+)$/).reply((config) => {
    const [, pipelineId] = url(config).match(/\/pipeline\/(\d+)/);
    const pipeline = findPipeline(Number(pipelineId));
    if (!pipeline?.settings) return notFound();
    const payload = body<{ autoReadyEnabled: boolean; autoReadyThreshold?: number }>(config);
    const threshold = payload.autoReadyThreshold;
    if (
      typeof payload.autoReadyEnabled !== 'boolean' ||
      typeof threshold !== 'number' ||
      !Number.isInteger(threshold) ||
      threshold < 0 ||
      threshold > 100
    ) {
      return [400, { errorCode: 40001, message: 'Threshold must be a whole number from 0 to 100' }];
    }
    pipeline.settings = {
      ...pipeline.settings,
      autoReady: payload.autoReadyEnabled,
      threshold,
    };
    persist();
    return [
      200,
      {
        id: pipeline.id,
        name: pipeline.name,
        autoReadyEnabled: pipeline.settings.autoReady,
        autoReadyThreshold: pipeline.settings.threshold,
        iterationsCount: listIterations(pipeline.id).length,
      },
    ];
  });

  // LP4 — GET pipeline/iteration/{iterationId}/compare?with={otherIterationId}
  mock.onGet(/\/pipeline\/iteration\/(\d+)\/compare(?:\?.*)?$/).reply((config) => {
    const [, candidateIdValue] = url(config).match(/\/pipeline\/iteration\/(\d+)\/compare/);
    const baselineIdValue = query(config).get('with');
    const candidateId = Number(candidateIdValue);
    const baselineId = Number(baselineIdValue);
    if (!baselineIdValue || !Number.isSafeInteger(baselineId) || candidateId === baselineId) {
      return [400, { errorCode: 40001, message: 'Two different iteration ids are required' }];
    }
    const candidate = findIteration(candidateId);
    const baseline = findIteration(baselineId);
    if (!candidate || !baseline) return notFound();
    if (candidate.pipelineId !== baseline.pipelineId) {
      return [400, { errorCode: 40001, message: 'Iterations must belong to the same pipeline' }];
    }
    const pipeline = findPipeline(candidate.pipelineId);
    return pipeline ? [200, toPipelineCompareRS(pipeline, candidate, baseline)] : notFound();
  });

  // C2 — GET tms/test-case/{id}/ai
  mock.onGet(/\/tms\/test-case\/([^/]+)\/ai$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/ai/);
    const c = findCase(decodeURIComponent(id));
    if (!c) return notFound();
    const iteration = c.ai ? findIteration(c.ai.iterationId) : undefined;
    const pipeline = iteration ? findPipeline(iteration.pipelineId) : undefined;
    return [200, toTestCaseAiRS(c, pipeline, iteration)];
  });

  // L1 — POST tms/test-case/{id}/lifecycle
  mock.onPost(/\/tms\/test-case\/([^/]+)\/lifecycle$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/lifecycle/);
    const c = findCase(decodeURIComponent(id));
    if (!c) return notFound();
    const payload = body<{ action: 'APPROVE' | 'MARK_AS_READY'; confirmObsolete?: boolean }>(config);
    if (c.lifecycle !== Lifecycle.DRAFT) return conflict('NOT_DRAFT');
    if (c.fixRoundRunning) return conflict('FIX_RUNNING');
    const unsent = c.comments.filter((x) => x.state === 'PENDING').length;
    if (c.ai && unsent > 0) return conflict('UNSENT_COMMENTS');
    if (c.evaluation?.state === EvaluationState.OBSOLETE && !payload.confirmObsolete) return conflict('EVALUATION_OBSOLETE_CONFIRM_REQUIRED');
    const reason = payload.action === 'APPROVE' ? LifecycleReason.APPROVED : LifecycleReason.MARKED_AS_READY;
    recordLifecycleChange(c, Lifecycle.READY, reason, { type: LifecycleActorType.USER, name: 'You' });
    persist();
    return [200, caseWithExtension(c)];
  });

  // L2 — POST tms/test-case/lifecycle/batch
  mock.onPost(/\/tms\/test-case\/lifecycle\/batch$/).reply((config) => {
    const { testCaseIds } = body<{ testCaseIds: number[] }>(config);
    const updated: { id: number; reason: string }[] = [];
    const skipped: { id: number; displayId: string; reason: string }[] = [];
    testCaseIds.forEach((id) => {
      const c = findCase(id);
      if (!c) return;
      if (c.lifecycle !== Lifecycle.DRAFT) { skipped.push({ id, displayId: c.displayId, reason: 'ALREADY_READY' }); return; }
      if (c.fixRoundRunning) { skipped.push({ id, displayId: c.displayId, reason: 'FIX_RUNNING' }); return; }
      const unsent = c.comments.filter((x) => x.state === 'PENDING').length;
      if (c.ai && unsent > 0) { skipped.push({ id, displayId: c.displayId, reason: 'UNSENT_COMMENTS' }); return; }
      const reason = c.ai ? LifecycleReason.APPROVED : LifecycleReason.MARKED_AS_READY;
      recordLifecycleChange(c, Lifecycle.READY, reason, { type: LifecycleActorType.USER, name: 'You' });
      updated.push({ id, reason: c.ai ? 'APPROVED' : 'MARKED_AS_READY' });
    });
    persist();
    return [200, { updated, skipped }];
  });

  // R1 — GET/POST tms/test-case/{id}/review-comment ; R2/R3 — DELETE (with or without a commentId)
  mock.onGet(/\/tms\/test-case\/([^/]+)\/review-comment$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/review-comment/);
    const caseId = decodeURIComponent(id);
    const c = findCase(caseId);
    return c ? [200, reviewCommentsForCase(caseId, c)] : notFound();
  });
  mock.onPost(/\/tms\/test-case\/([^/]+)\/review-comment$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/review-comment/);
    const c = findCase(decodeURIComponent(id));
    if (!c) return notFound();
    if (!c.ai) return [400, { errorCode: 40001, message: 'Comments are only available for AI cases' }];
    if (c.fixRoundRunning) return conflict('FIX_RUNNING');
    const payload = body<{ target: MockCaseRecord['comments'][number]['target']; text: string }>(config);
    const comment = { id: nextCommentId(), target: payload.target, text: payload.text, author: { id: 1, name: 'You' }, createdAt: Date.now(), state: 'PENDING' as const, canDelete: true };
    c.comments.push(comment);
    persist();
    return [200, comment];
  });
  mock.onDelete(/\/tms\/test-case\/([^/]+)\/review-comment(?:\/(\d+))?(?:\?.*)?$/).reply((config) => {
    const m = url(config).match(/\/tms\/test-case\/([^/]+)\/review-comment(?:\/(\d+))?/);
    const c = findCase(decodeURIComponent(m[1]));
    if (!c) return notFound();
    if (m[2]) {
      // R2 — delete one own, still-pending comment
      const idx = c.comments.findIndex((x) => x.id === Number(m[2]));
      if (idx === -1) return notFound();
      if (c.comments[idx].state !== 'PENDING' || !c.comments[idx].canDelete) return [403, { errorCode: 40300, message: 'Cannot delete this comment' }];
      c.comments.splice(idx, 1);
    } else if (query(config).get('state') === 'PENDING') {
      // R3 — discard all unsent comments
      c.comments = c.comments.filter((x) => x.state !== 'PENDING');
    }
    persist();
    return [200, reviewCommentsForCase(decodeURIComponent(m[1]), c)];
  });

  // F1/F2 — POST/GET tms/test-case/{id}/fix-round
  mock.onGet(/\/tms\/test-case\/([^/]+)\/fix-round$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/fix-round/);
    const c = findCase(decodeURIComponent(id));
    if (!c) return notFound();
    const running = c.fixRoundRunning
      ? [{ round: c.fixRoundRunning.round, testCaseId: c.id, displayId: c.displayId, status: FixRoundStatus.RUNNING, pushedBy: 'You', pushedAt: c.fixRoundRunning.startedAt, commentsCount: c.comments.filter((x) => x.state === 'SENT').length }]
      : [];
    return [200, [...c.fixRounds, ...running]];
  });
  mock.onPost(/\/tms\/test-case\/([^/]+)\/fix-round$/).reply((config) => {
    const [, id] = url(config).match(/\/tms\/test-case\/([^/]+)\/fix-round/);
    const c = findCase(decodeURIComponent(id));
    if (!c) return notFound();
    const pending = c.comments.filter((x) => x.state === 'PENDING');
    if (!pending.length) return conflict('NO_UNSENT_COMMENTS');
    if (c.fixRoundRunning) return conflict('FIX_RUNNING');
    const round = nextFixRoundNumber(c);
    pending.forEach((comment) => { comment.state = 'SENT'; comment.fixRound = round; });
    c.lastAgentChange = undefined;
    c.fixRoundRunning = { round, startedAt: Date.now() };
    persist();
    startFixRoundSimulation(c, round);
    return [202, { round, testCaseId: c.id, displayId: c.displayId, status: FixRoundStatus.RUNNING, pushedBy: 'You', pushedAt: c.fixRoundRunning.startedAt, commentsCount: pending.length }];
  });

  // A1 — GET tms/automation/environment
  mock.onGet(/\/tms\/automation\/environment$/).reply(() => [200, { environments: AUTOMATION_ENVIRONMENTS, default: 'beta5' }]);

  // A2 — POST tms/automation
  mock.onPost(/\/tms\/automation$/).reply((config) => {
    let payload: unknown;
    try {
      payload = body<unknown>(config);
    } catch {
      return [400, { errorCode: 40002, message: 'Invalid automation request' }];
    }
    if (!isAutomationPayload(payload)) return [400, { errorCode: 40002, message: 'Invalid automation request' }];
    if (payload.testCaseIds.some((id) => !findCase(id))) {
      return [400, { errorCode: 40002, message: 'Invalid automation request' }];
    }
    const accepted: number[] = [];
    const skipped: { id: number; displayId: string; reason: string }[] = [];
    const again = payload.testCaseIds.filter((id) => {
      const c = findCase(id);
      return c?.automation?.status === AutomationStatus.AUTOMATED && automateSkipReason(c) === null;
    });
    if (again.length && !payload.confirmReautomate) return [409, { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds: again }];
    payload.testCaseIds.forEach((id) => {
      const c = findCase(id);
      const reason = automateSkipReason(c);
      if (reason) {
        skipped.push({ id, displayId: c.displayId, reason });
      } else {
        accepted.push(id);
      }
    });
    if (!accepted.length) return [400, { errorCode: 40001, message: 'No Ready Test Cases to automate' }];
    const canonicalCaseIds = accepted.flatMap((id) => {
      const caseRecord = findCase(id);
      return caseRecord ? [caseRecord.id] : [];
    });
    const iteration = startAutomationSimulation(
      canonicalCaseIds,
      accepted,
      payload.environment,
    );
    persist();
    return [
      202,
      {
        iteration: {
          pipelineId: iteration.pipelineId,
          iterationId: iteration.id,
          number: iteration.number,
        },
        accepted,
        skipped,
      },
    ];
  });

  resumeAutomationSimulations();
};

function failScriptedFixRound(c: MockCaseRecord, round: number, failureReason: string): void {
  c.failedOnce = true;
  const commentsCount = c.comments.filter((cm) => cm.state === 'SENT').length;
  c.comments.forEach((cm) => {
    if (cm.state === 'SENT') {
      cm.state = 'PENDING';
      cm.fixRound = undefined;
    }
  });
  c.fixRounds.push({ round, testCaseId: c.id, displayId: c.displayId, status: FixRoundStatus.FAILED, pushedBy: 'You', pushedAt: c.fixRoundRunning.startedAt, finishedAt: Date.now(), commentsCount, failureReason });
  c.fixRoundRunning = undefined;
  persist();
}

function failScriptedGrade(c: MockCaseRecord, round: number, scoreBefore: number): void {
  const before = c.evaluation ? { ...c.evaluation } : undefined;
  c.evaluation = before && { ...before, state: EvaluationState.OBSOLETE };
  c.comments.forEach((cm) => { if (cm.state === 'SENT') cm.state = 'ADDRESSED'; });
  recordLifecycleChange(c, Lifecycle.DRAFT, LifecycleReason.AGENT_FIX, { type: LifecycleActorType.PIPELINE, name: 'Test case generation' }, `Fix round ${round} — grade failed`);
  if (c.ai) c.ai.modifiedByAgent = true;
  const commentsCount = c.comments.filter((cm) => cm.fixRound === round).length;
  const cost = 0.19 + 0.03 * commentsCount;
  c.fixRounds.push({ round, testCaseId: c.id, displayId: c.displayId, status: FixRoundStatus.GRADE_FAILED, pushedBy: 'You', pushedAt: c.fixRoundRunning.startedAt, finishedAt: Date.now(), commentsCount, scoreBefore, cost });
  c.lastAgentChange = { round, scoreBefore, before: { steps: [] }, after: { steps: [] } };
  c.fixRoundRunning = undefined;
  persist();
}

/** Fix round: Fix → Grade → update. Mirrors docs/ai-factory-poc/01-knowledge-base.md §4.8. */
function startFixRoundSimulation(c: MockCaseRecord, round: number): void {
  setTimeout(() => {
    const scriptedFailure = SCRIPTED_FIX_FAILURE[c.displayId];
    if (scriptedFailure && !c.failedOnce) {
      failScriptedFixRound(c, round, scriptedFailure);
      return;
    }
    const before = c.evaluation ? { ...c.evaluation } : undefined;
    const scoreBefore = before ? before.criteria.reduce((s, cr) => s + cr.score, 0) : 0;
    if (SCRIPTED_GRADE_FAILURE.has(c.displayId)) {
      failScriptedGrade(c, round, scoreBefore);
      return;
    }
    const bump = 12;
    const criteria = (before?.criteria || []).map((cr) => ({ ...cr, score: Math.min(cr.maxScore, cr.score + Math.round(bump / 6)), failureReasons: [] }));
    const scriptedScore = SCRIPTED_FIX_SCORE[c.displayId];
    let scoreAfter = criteria.reduce((s, cr) => s + cr.score, 0);
    if (scriptedScore && scoreAfter < scriptedScore) {
      const criterion = criteria.find((candidate) => candidate.score < candidate.maxScore);
      if (criterion) {
        criterion.score += Math.min(scriptedScore - scoreAfter, criterion.maxScore - criterion.score);
        scoreAfter = criteria.reduce((sum, candidate) => sum + candidate.score, 0);
      }
    }
    c.evaluation = { criteria, evaluatedAt: Date.now(), state: EvaluationState.EVALUATED, sourceFixRound: round };
    c.comments.forEach((cm) => { if (cm.state === 'SENT') cm.state = 'ADDRESSED'; });
    const wasReady = c.lifecycle === Lifecycle.READY;
    recordLifecycleChange(c, Lifecycle.DRAFT, LifecycleReason.AGENT_FIX, { type: LifecycleActorType.PIPELINE, name: 'Test case generation' }, `Fix round ${round} (${scoreBefore} → ${scoreAfter})${wasReady ? ' — returned to Draft' : ''}`);
    if (c.ai) c.ai.modifiedByAgent = true;
    const cost = 0.19 + 0.03 * c.comments.filter((cm) => cm.fixRound === round).length;
    const completedRound: FixRoundRS = { round, testCaseId: c.id, displayId: c.displayId, status: FixRoundStatus.PASSED, pushedBy: 'You', pushedAt: c.fixRoundRunning.startedAt, finishedAt: Date.now(), commentsCount: c.comments.filter((cm) => cm.fixRound === round).length, scoreBefore, scoreAfter, cost };
    c.fixRounds.push(completedRound);
    c.lastAgentChange = { round, scoreBefore, scoreAfter, before: { steps: [] }, after: { steps: [] } };
    c.fixRoundRunning = undefined;
    const iteration = c.ai ? findIteration(c.ai.iterationId) : undefined;
    const pipeline = iteration ? findPipeline(iteration.pipelineId) : undefined;
    if (pipeline?.settings) completedRound.autoReadyPromoted = applyAutoReady(c, pipeline.settings);
    persist();
  }, SIMULATED_DELAY_MS);
}

const AUTOMATION_STEPS: {
  field: keyof MockIterationSeed['stages'];
  key: StageKey;
  unitCost: number;
}[] = [
  { field: 'prepare', key: StageKey.PREPARE, unitCost: 0.28 },
  { field: 'develop', key: StageKey.DEVELOP, unitCost: 0.92 },
  { field: 'automationReview', key: StageKey.AUTOMATION_REVIEW, unitCost: 0.24 },
  { field: 'fix', key: StageKey.FIX, unitCost: 0 },
];

const activeAutomationIterations = new Map<number, MockIterationSeed>();

const deactivateAutomationIteration = (iteration: MockIterationSeed): void => {
  if (activeAutomationIterations.get(iteration.id) === iteration) {
    activeAutomationIterations.delete(iteration.id);
  }
};

const stageResult = (step: (typeof AUTOMATION_STEPS)[number]): string =>
  step.key === StageKey.FIX ? 'Skipped · review was clean' : 'Done';

const completedAutomationStage = (
  step: (typeof AUTOMATION_STEPS)[number],
  caseIds: number[],
): MockStageSeed => ({
  status: step.key === StageKey.FIX ? StageStatus.SKIPPED : StageStatus.PASSED,
  durationMs: 60_000,
  cost: step.unitCost * caseIds.length,
  tokens: [],
  perCase: Object.fromEntries(caseIds.map((id) => [id, stageResult(step)])),
});

const runningAutomationStage = (): MockStageSeed => ({
  status: StageStatus.RUNNING,
  durationMs: 0,
  cost: 0,
  tokens: [],
});

const completeAutomationIteration = (iteration: MockIterationSeed, caseIds: number[]): void => {
  const launch = {
    id: 9000 + iteration.id,
    name: 'RP UI Test @implement_test',
    number: 100 + iteration.id,
  };
  iteration.launch = launch;
  iteration.mergeRequest = {
    id: `!${iteration.id}`,
    url: '#',
    state: MergeRequestState.OPEN,
  };
  iteration.durationMs = Math.max(0, Date.now() - iteration.startedAt);
  caseIds.forEach((id) => {
    const caseRecord = findCase(id);
    if (!caseRecord) return;
    caseRecord.automation = {
      status: AutomationStatus.AUTOMATED,
      iterationId: iteration.id,
      launch,
      lastResult: { status: 'PASSED' },
      scenarioChangedAfterAutomation: false,
    };
  });
};

const scheduleAutomationStep = (
  iteration: MockIterationSeed,
  caseIds: number[],
  stepIndex: number,
): void => {
  activeAutomationIterations.set(iteration.id, iteration);
  setTimeout(() => {
    const currentIteration = findIteration(iteration.id);
    if (!currentIteration || currentIteration !== iteration) {
      deactivateAutomationIteration(iteration);
      return;
    }
    const step = AUTOMATION_STEPS[stepIndex];
    currentIteration.stages[step.field] = completedAutomationStage(step, caseIds);
    const nextStep = AUTOMATION_STEPS[stepIndex + 1];
    if (nextStep) {
      currentIteration.stages[nextStep.field] = runningAutomationStage();
      persist();
      scheduleAutomationStep(currentIteration, caseIds, stepIndex + 1);
      return;
    }
    completeAutomationIteration(currentIteration, caseIds);
    deactivateAutomationIteration(iteration);
    persist();
  }, SIMULATED_DELAY_MS);
};

const runningAutomationStepIndex = (iteration: MockIterationSeed): number =>
  AUTOMATION_STEPS.findIndex(
    ({ field }) => iteration.stages[field]?.status === StageStatus.RUNNING,
  );

const resumeAutomationSimulations = (): void => {
  listIterations()
    .filter((iteration) => iteration.testCaseIds?.length)
    .forEach((iteration) => {
      const runningIndex = runningAutomationStepIndex(iteration);
      if (runningIndex < 0 || activeAutomationIterations.get(iteration.id) === iteration) {
        return;
      }
      scheduleAutomationStep(iteration, iteration.testCaseIds ?? [], runningIndex);
    });
};

/** Automation: Prepare → Develop → Review → Fix (skipped when the review is clean). */
function startAutomationSimulation(
  caseIds: number[],
  requestedCaseIds: number[],
  environment: string,
): MockIterationSeed {
  const pipelineId = 2;
  const existing = listIterations(pipelineId);
  const number = (existing[0]?.number || 0) + 1;
  const iterationId = 200 + number * 1000; // keeps mock ids away from the seed's 201
  const iteration: MockIterationSeed = {
    id: iterationId,
    pipelineId,
    number,
    testCaseIds: caseIds,
    requestedTestCaseIds: requestedCaseIds,
    trigger: 'Automate · Test Case Library',
    startedBy: 'You',
    model: 'auto (default)',
    environment,
    startedAt: Date.now(),
    ciPipeline: { id: `#${iterationId}`, url: '#' },
    stages: { prepare: runningAutomationStage() },
  };
  getDb().iterations.push(iteration);
  caseIds.forEach((id) => {
    const c = findCase(id);
    if (!c) return;
    c.automation = {
      status: AutomationStatus.IN_PROGRESS,
      iterationId,
      scenarioChangedAfterAutomation: false,
    };
  });
  activeAutomationIterations.delete(iteration.id);
  scheduleAutomationStep(iteration, caseIds, 0);
  return iteration;
}
