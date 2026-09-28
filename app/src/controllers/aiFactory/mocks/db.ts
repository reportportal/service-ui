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
 * In-memory store for the AI Factory mock backend, hydrated from `seedData.ts` and persisted to
 * localStorage so a demo survives a page reload. See docs/ai-factory-poc/03-frontend-architecture.md
 * §4.3. Never touches the real backend — `overlay.ts` (real TMS data) is a separate concern.
 */

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { AutomationStatus, Lifecycle, LifecycleActorType, LifecycleReason } from 'types/aiFactory';
import { CASES, ITERATIONS, LAUNCHES, PIPELINES, PLANS } from './seedData';
import {
  MockCaseRecord,
  MockCaseSeed,
  MockIterationSeed,
  MockLaunchSeed,
  MockPipelineSeed,
  MockPlanSeed,
} from './types';

const STORAGE_KEY = 'ai_factory_mock_db_v1';
/** Spread seeded history entries evenly over the 24h before their case's evaluation time. */
const HISTORY_SPREAD_MS = 60 * 60 * 1000;

export interface MockDb {
  pipelines: MockPipelineSeed[];
  iterations: MockIterationSeed[];
  cases: MockCaseRecord[];
  plans: MockPlanSeed[];
  launches: MockLaunchSeed[];
  nextCommentId: number;
}

const hydrateCase = (seed: MockCaseSeed): MockCaseRecord => {
  const at0 = seed.evaluation?.evaluatedAt ?? Date.now();
  let seedNextCommentId = 1;
  const nextSeedCommentId = () => {
    const id = seedNextCommentId;
    seedNextCommentId += 1;
    return id;
  };
  const lifecycleHistory = seed.lifecycleHistory.map((entry, i) => ({
    ...entry,
    from: i === 0 ? undefined : seed.lifecycleHistory[i - 1].to,
    at: at0 + (i - seed.lifecycleHistory.length) * HISTORY_SPREAD_MS,
  }));
  const fixRounds = (seed.completedFixRounds || []).map((round) => ({
    round: round.round,
    testCaseId: seed.id,
    displayId: seed.displayId,
    status: 'PASSED' as const,
    pushedBy: 'Helen Bobrova',
    pushedAt: at0 - 60_000,
    finishedAt: at0,
    commentsCount: round.comments.length,
    scoreBefore: round.scoreBefore,
    scoreAfter: round.scoreAfter,
    cost: round.cost,
    tokens: round.tokens ? [round.tokens] : undefined,
  }));
  const comments = (seed.pendingComments || []).map((comment) => ({
    id: nextSeedCommentId(),
    target: comment.target,
    text: comment.text,
    author: { id: 0, name: comment.author },
    createdAt: at0,
    state: 'PENDING' as const,
    canDelete: false, // seeded comments are not authored by "You" — matches the prototype's TC106
  }));
  return {
    id: seed.id,
    displayId: seed.displayId,
    priority: seed.priority,
    template: seed.template,
    stepsCount: seed.stepsCount,
    lifecycle: seed.lifecycle,
    ai: seed.ai,
    evaluation: seed.evaluation && {
      criteria: seed.evaluation.criteria,
      evaluatedAt: seed.evaluation.evaluatedAt,
      state: seed.evaluation.state,
      sourceFixRound: seed.evaluation.sourceFixRound,
    },
    lifecycleHistory,
    automation: seed.automation && {
      ...seed.automation,
      scenarioChangedAfterAutomation: false,
    },
    comments,
    fixRounds,
    blockedPlanIds: seed.blockedPlanIds || [],
  };
};

const cloneSeed = (): MockDb => ({
  pipelines: JSON.parse(JSON.stringify(PIPELINES)),
  iterations: JSON.parse(JSON.stringify(ITERATIONS)),
  cases: CASES.map(hydrateCase),
  plans: JSON.parse(JSON.stringify(PLANS)),
  launches: JSON.parse(JSON.stringify(LAUNCHES)),
  nextCommentId: CASES.reduce((max, c) => Math.max(max, (c.pendingComments || []).length + 1), 1),
});

const loadPersisted = (): MockDb | null => {
  try {
    return getStorageItem(STORAGE_KEY) as MockDb | null;
  } catch {
    return null;
  }
};

let state: MockDb = loadPersisted() || cloneSeed();

export const persist = (): void => {
  try {
    setStorageItem(STORAGE_KEY, state);
  } catch {
    // localStorage may be unavailable (private mode, quota) — the demo still works in-memory
  }
};

/** Discards persisted state and reloads the seed — the "Reset demo" action. */
export const resetMockDb = (): void => {
  state = cloneSeed();
  persist();
};

export const getDb = (): MockDb => state;

export const findPipeline = (pipelineId: number) => state.pipelines.find((p) => p.id === pipelineId);

export const findIteration = (iterationId: number) => state.iterations.find((i) => i.id === iterationId);

export const listIterations = (pipelineId?: number) =>
  state.iterations
    .filter((i) => pipelineId === undefined || i.pipelineId === pipelineId)
    .sort((a, b) => b.number - a.number);

export const findCase = (idOrDisplayId: number | string): MockCaseRecord | undefined =>
  state.cases.find((c) => c.id === idOrDisplayId || c.displayId === idOrDisplayId);

export const listCasesOfIteration = (iterationId: number): MockCaseRecord[] =>
  state.cases.filter((c) => c.ai?.iterationId === iterationId);

export const findPlan = (planId: number) => state.plans.find((p) => p.id === planId);

export const plansBlockedByCase = (caseId: number) => state.plans.filter((p) => p.testCaseIds.includes(caseId));

export const findLaunch = (launchId: number) => state.launches.find((l) => l.id === launchId);

export const nextCommentId = (): number => {
  const id = state.nextCommentId;
  state.nextCommentId += 1;
  return id;
};

export const nextFixRoundNumber = (caseRecord: MockCaseRecord): number =>
  Math.max(0, ...caseRecord.fixRounds.map((r) => r.round), caseRecord.fixRoundRunning?.round || 0) + 1;

export const setAutomationInProgress = (caseRecord: MockCaseRecord, iterationId: number): void => {
  caseRecord.automation = {
    status: AutomationStatus.IN_PROGRESS,
    iterationId,
    scenarioChangedAfterAutomation: false,
  };
};

export const recordLifecycleChange = (
  caseRecord: MockCaseRecord,
  to: Lifecycle,
  reason: LifecycleReason,
  actor: { type: LifecycleActorType; name: string },
  details?: string,
): void => {
  const from = caseRecord.lifecycle;
  caseRecord.lifecycle = to;
  caseRecord.lifecycleHistory.push({ from, to, reason, details, actor, at: Date.now() });
};
