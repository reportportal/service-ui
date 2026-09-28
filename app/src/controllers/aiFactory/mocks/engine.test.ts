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

import { formatCost } from 'common/utils/aiFactoryFormatUtils';
import { EvaluationState, IterationStatus, Lifecycle } from 'types/aiFactory';
import { findCase, findIteration, findPipeline, resetMockDb } from './db';
import { applyAutoReady, automateSkipReason, caseCost, deriveIterationStatus, readyCount, totalScore } from './engine';
import { MockCaseRecord } from './types';

beforeEach(() => resetMockDb());

const draftEvaluatedCase = (overrides: Partial<MockCaseRecord> = {}): MockCaseRecord => ({
  id: 9999,
  displayId: 'TC999',
  priority: 'medium' as MockCaseRecord['priority'],
  template: 'STEPS',
  stepsCount: 2,
  lifecycle: Lifecycle.DRAFT,
  ai: { iterationId: 101, modifiedByAgent: false, factoryKey: 'x' },
  evaluation: {
    criteria: [{ key: 'atomicity' as never, score: 90, maxScore: 100, failureReasons: [] }],
    evaluatedAt: Date.now(),
    state: EvaluationState.EVALUATED,
  },
  lifecycleHistory: [],
  comments: [],
  fixRounds: [],
  blockedPlanIds: [],
  ...overrides,
});

describe('deriveIterationStatus', () => {
  test('gen-1: Upload passed but not every case is Ready yet → IN_REVIEW', () => {
    const pipeline = findPipeline(1);
    const iteration = findIteration(101);
    expect(deriveIterationStatus(pipeline, iteration)).toBe(IterationStatus.IN_REVIEW);
  });

  test('gen-3: Grade still running → RUNNING', () => {
    const pipeline = findPipeline(1);
    const iteration = findIteration(103);
    expect(deriveIterationStatus(pipeline, iteration)).toBe(IterationStatus.RUNNING);
  });

  test('auto-1: every stage passed → COMPLETED', () => {
    const pipeline = findPipeline(2);
    const iteration = findIteration(201);
    expect(deriveIterationStatus(pipeline, iteration)).toBe(IterationStatus.COMPLETED);
  });
});

describe('readyCount', () => {
  test('gen-2 has one Ready case (TC105) out of four', () => {
    expect(readyCount(102)).toBe(1);
  });
});

describe('applyAutoReady', () => {
  const settings = { autoReady: true, threshold: 90 };

  test('promotes a Draft, Evaluated, ≥ threshold case with no unsent comments', () => {
    const c = draftEvaluatedCase();
    expect(applyAutoReady(c, settings)).toBe(true);
    expect(c.lifecycle).toBe(Lifecycle.READY);
    expect(c.lifecycleHistory).toHaveLength(1);
    expect(c.lifecycleHistory[0].details).toBe('90 ≥ 90');
  });

  test('does not promote when Auto-Ready is off', () => {
    const c = draftEvaluatedCase();
    expect(applyAutoReady(c, { ...settings, autoReady: false })).toBe(false);
    expect(c.lifecycle).toBe(Lifecycle.DRAFT);
  });

  test('does not promote below the threshold', () => {
    const c = draftEvaluatedCase();
    expect(applyAutoReady(c, { ...settings, threshold: 95 })).toBe(false);
  });

  test('does not promote an Obsolete evaluation', () => {
    const c = draftEvaluatedCase({ evaluation: { ...draftEvaluatedCase().evaluation, state: EvaluationState.OBSOLETE } });
    expect(applyAutoReady(c, settings)).toBe(false);
  });

  test('does not promote while a comment is unsent', () => {
    const c = draftEvaluatedCase({
      comments: [{ id: 1, target: { type: 'STEP' as never, stepId: 1 }, text: 'x', author: { id: 1, name: 'You' }, createdAt: Date.now(), state: 'PENDING', canDelete: true }],
    });
    expect(applyAutoReady(c, settings)).toBe(false);
  });

  test('does not promote while a fix round is running', () => {
    const c = draftEvaluatedCase({ fixRoundRunning: { round: 1, startedAt: Date.now() } });
    expect(applyAutoReady(c, settings)).toBe(false);
  });

  test('never demotes a Ready case', () => {
    const c = draftEvaluatedCase({ lifecycle: Lifecycle.READY });
    expect(applyAutoReady(c, { ...settings, threshold: 999 })).toBe(false);
    expect(c.lifecycle).toBe(Lifecycle.READY);
  });
});

describe('caseCost', () => {
  test('TC103 ≈ $0.54 (Iteration #1 share ≈ $0.32 + Fix round 1 $0.22) — docs/ai-factory-poc/01 §7', () => {
    const iteration = findIteration(101);
    const c = findCase('TC103');
    expect(formatCost(caseCost(c, iteration))).toBe('$0.54');
  });
});

describe('automateSkipReason', () => {
  test('a Ready case with no fix running and not already in progress can be automated', () => {
    expect(automateSkipReason(findCase('TC105'))).toBeNull();
  });

  test('a Draft case cannot be automated', () => {
    expect(automateSkipReason(findCase('TC106'))).toBe('NOT_READY');
  });
});

describe('totalScore', () => {
  test('sums the six criteria', () => {
    const c = findCase('TC101');
    expect(totalScore(c)).toBe(94);
  });
});
