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
 * Smoke test: every endpoint of docs/ai-factory-poc/05-backend-contract.md answers on the mocks.
 * Uses a scratch axios instance (never the app's global one) so this never touches real network
 * code paths. Async simulations (fix round, automation) are advanced with fake timers.
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { URLS } from 'common/urls';
import {
  AutomateAcceptedRS,
  AutomationStatus,
  AutomationEnvironmentsRS,
  FixRoundRS,
  IterationStatus,
  IterationPageRS,
  IterationRS,
  LifecycleBatchRS,
  MergeRequestState,
  PipelineCompareRS,
  PipelineRS,
  PipelineSettingsRS,
  ReviewCommentRS,
  TestCaseAiExtension,
  TestCaseAiRS,
} from 'types/aiFactory';
import {
  findCase,
  findIteration,
  registerCaseAlias,
  reloadMockDb,
  resetMockDb,
} from './db';
import { installAiFactoryHandlers, SIMULATED_DELAY_MS } from './handlers';

const PROJECT = 'demo_project';
let http: ReturnType<typeof axios.create>;
let mock: MockAdapter;

beforeEach(() => {
  resetMockDb();
  http = axios.create();
  mock = new MockAdapter(http);
  installAiFactoryHandlers(mock);
});

afterEach(() => mock.restore());

const reloadPersistedHandlers = (): void => {
  reloadMockDb();
  mock.restore();
  mock = new MockAdapter(http);
  installAiFactoryHandlers(mock);
};

describe('pipelines (P1-P4)', () => {
  test('P1 lists both pipelines', async () => {
    const { data } = await http.get<PipelineRS[]>(URLS.tmsPipeline(PROJECT));
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ name: 'Test case generation', settings: { threshold: 90 } });
  });

  test('P2 lists gen-1 first when sorted, and search filters by requirement', async () => {
    const { data } = await http.get<IterationPageRS>(
      URLS.tmsPipelineIterations(PROJECT, 1, { search: 'BLK' }),
    );
    expect(data.content).toHaveLength(1);
    expect(data.content[0].requirement?.specId).toBe('US-TMS-BLK-001');
  });

  test('P3 returns iteration details with stages', async () => {
    const { data } = await http.get<IterationRS>(URLS.tmsPipelineIterationById(PROJECT, 1, 101));
    expect(data.stages.map((s) => s.key)).toEqual(['CREATE', 'GRADE', 'UPLOAD', 'REVIEW']);
  });

  test('P3 404s for an unknown iteration', async () => {
    const res = await http.get(URLS.tmsPipelineIterationById(PROJECT, 1, 999), {
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
  });

  test('P3 rejects an iteration that belongs to another pipeline', async () => {
    const res = await http.get(URLS.tmsPipelineIterationById(PROJECT, 1, 201), {
      validateStatus: () => true,
    });

    expect(res.status).toBe(404);
  });

  test('LP5 PATCH updates settings through the live contract, with validation', async () => {
    const before = await http.get<PipelineSettingsRS>(URLS.tmsPipelineSettings(PROJECT, 1));
    expect(before.data).toMatchObject({ autoReady: true, threshold: 90 });

    const invalid = await http.patch(
      URLS.pipelineById(PROJECT, 1),
      { autoReadyEnabled: true, autoReadyThreshold: 101 },
      { validateStatus: () => true },
    );
    expect(invalid.status).toBe(400);

    const ok = await http.patch(URLS.pipelineById(PROJECT, 1), {
      autoReadyEnabled: false,
      autoReadyThreshold: 80,
    });
    expect(ok.data).toMatchObject({
      id: 1,
      autoReadyEnabled: false,
      autoReadyThreshold: 80,
    });

    const after = await http.get<PipelineSettingsRS>(URLS.tmsPipelineSettings(PROJECT, 1));
    expect(after.data).toEqual({ autoReady: false, threshold: 80, editable: true });
  });

  test('LP4 uses the path iteration as candidate and the required with query as baseline', async () => {
    const { data } = await http.get<PipelineCompareRS>(
      URLS.pipelineIterationComparison(PROJECT, 103, 102),
    );

    expect(mock.history.get[0].url).toContain('/pipeline/iteration/103/compare?with=102');
    expect(data.mock).toEqual({
      kind: 'REPORTPORTAL_AI_FACTORY_COMPARE_DEMO',
      version: 1,
    });
    expect(data.current).toMatchObject({ id: 103, pipelineId: 1, iterationNumber: 3 });
    expect(data.previous).toMatchObject({ id: 102, pipelineId: 1, iterationNumber: 2 });
    expect(data.current?.mockMetrics).toEqual(
      expect.objectContaining({
        testCasesCount: expect.any(Number),
        autoReadyPromotedCount: expect.any(Number),
      }),
    );
    expect(data.previous?.mockMetrics?.criterionAverages).toEqual(
      expect.objectContaining({ atomicity: expect.any(Number) }),
    );
  });

  test.each([
    ['/api/v1/project/demo_project/pipeline/iteration/103/compare', 'missing baseline'],
    [URLS.pipelineIterationComparison(PROJECT, 103, 103), 'same iteration'],
    [URLS.pipelineIterationComparison(PROJECT, 201, 103), 'cross-pipeline pair'],
  ])('LP4 rejects a %s (%s)', async (url, _description) => {
    const response = await http.get(url, { validateStatus: () => true });

    expect(response.status).toBe(400);
  });
});

describe('test-case AI (C2)', () => {
  test('returns evaluation, cost and pipeline links for TC101', async () => {
    const { data } = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC101'));
    expect(data.evaluation?.totalScore).toBe(94);
    expect(data.cost?.approxTotal).toBeGreaterThan(0);
    expect(data.pipelineLinks[0]).toMatchObject({ iterationNumber: 1, stage: 'GRADE' });
    expect(data.automation).toMatchObject({
      status: AutomationStatus.AUTOMATED,
      mergeRequest: { id: '!212', state: MergeRequestState.OPEN },
      lastResult: { status: 'PASSED' },
    });
  });
});

describe('lifecycle (L1-L2)', () => {
  test('L1 Approve on a Draft AI case with no unsent comments succeeds', async () => {
    const { data } = await http.post<TestCaseAiExtension>(
      URLS.testCaseLifecycle(PROJECT, 'TC104'),
      { action: 'APPROVE' },
    );
    expect(data.lifecycle).toBe('READY');
  });

  test('L1 rejects Approve while a comment is unsent', async () => {
    const res = await http.post<{ reason: string }>(
      URLS.testCaseLifecycle(PROJECT, 'TC106'),
      { action: 'APPROVE' },
      { validateStatus: () => true },
    );
    expect(res.status).toBe(409);
    expect(res.data.reason).toBe('UNSENT_COMMENTS');
  });

  test('L2 batch approves eligible cases and skips the rest', async () => {
    const { data } = await http.post<LifecycleBatchRS>(URLS.testCaseLifecycleBatch(PROJECT), {
      testCaseIds: [1004, 1006],
    });
    expect(data.updated).toEqual([{ id: 1004, reason: 'APPROVED' }]);
    expect(data.skipped).toEqual([{ id: 1006, displayId: 'TC106', reason: 'UNSENT_COMMENTS' }]);
  });
});

describe('review comments (R1-R3)', () => {
  test('R1 add then list, R2 delete own pending, R3 discard all', async () => {
    const added = await http.post<ReviewCommentRS>(URLS.testCaseReviewComments(PROJECT, 'TC104'), {
      target: { type: 'TEXT_SCENARIO' },
      text: 'Please clarify.',
    });
    expect(added.data.state).toBe('PENDING');

    const listed = await http.get<ReviewCommentRS[]>(URLS.testCaseReviewComments(PROJECT, 'TC104'));
    expect(listed.data).toHaveLength(1);

    await http.delete(URLS.testCaseReviewCommentById(PROJECT, 'TC104', added.data.id));
    const afterDelete = await http.get<ReviewCommentRS[]>(
      URLS.testCaseReviewComments(PROJECT, 'TC104'),
    );
    expect(afterDelete.data).toHaveLength(0);

    await http.post(URLS.testCaseReviewComments(PROJECT, 'TC104'), {
      target: { type: 'TEXT_SCENARIO' },
      text: 'Another one.',
    });
    await http.delete(URLS.discardTestCaseReviewComments(PROJECT, 'TC104'));
    const afterDiscard = await http.get<ReviewCommentRS[]>(
      URLS.testCaseReviewComments(PROJECT, 'TC104'),
    );
    expect(afterDiscard.data).toHaveLength(0);
  });
});

describe('fix rounds (F1-F2)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('F1 push starts a round, F2 shows it running then Passed with a new score', async () => {
    const push = await http.post<FixRoundRS>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(push.status).toBe(202);
    expect(push.data.status).toBe('RUNNING');

    const running = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(running.data[0].status).toBe('RUNNING');

    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const done = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(done.data[0]).toMatchObject({
      status: 'PASSED',
      scoreBefore: 81,
      autoReadyPromoted: true,
    });
    expect(done.data[0].scoreAfter).toBeGreaterThan(81);
  });

  test('F1 rejects a push with no unsent comments', async () => {
    const res = await http.post<{ reason: string }>(
      URLS.testCaseFixRounds(PROJECT, 'TC101'),
      undefined,
      { validateStatus: () => true },
    );
    expect(res.status).toBe(409);
    expect(res.data.reason).toBe('NO_UNSENT_COMMENTS');
  });

  test('TC107 fails once (job timeout) then succeeds on the next push', async () => {
    await http.post(URLS.testCaseReviewComments(PROJECT, 'TC107'), {
      target: { type: 'TEXT_SCENARIO' },
      text: 'Fix it.',
    });
    await http.post(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const afterFail = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    expect(afterFail.data[0]).toMatchObject({ status: 'FAILED', failureReason: 'job timeout' });

    await http.post(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const afterRetry = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    expect(afterRetry.data.map(({ status }) => status)).toEqual(['FAILED', 'PASSED']);
  });

  test('TC105 keeps the fix and marks the previous evaluation obsolete when grading fails', async () => {
    await http.post(URLS.testCaseReviewComments(PROJECT, 'TC105'), {
      target: { type: 'TEXT_SCENARIO' },
      text: 'Clarify the result.',
    });
    await http.post(URLS.testCaseFixRounds(PROJECT, 'TC105'));
    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);

    const rounds = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC105'));
    const details = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(rounds.data[0].status).toBe('GRADE_FAILED');
    expect(details.data.evaluation?.state).toBe('OBSOLETE');
    expect(details.data.lastAgentChange).toMatchObject({ round: 1, scoreBefore: 93 });
  });
});

describe('automation (A1-A2)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('A1 lists environments', async () => {
    const { data } = await http.get<AutomationEnvironmentsRS>(
      URLS.tmsAutomationEnvironments(PROJECT),
    );
    expect(data.default).toBe('beta5');
  });

  test.each([
    [{ testCaseIds: [], environment: 'beta5', confirmReautomate: false }, 'empty IDs'],
    [
      { testCaseIds: [1005, 1005], environment: 'beta5', confirmReautomate: false },
      'duplicate IDs',
    ],
    [
      { testCaseIds: [1005], environment: 'unknown', confirmReautomate: false },
      'unknown environment',
    ],
    [{ testCaseIds: [1005], environment: 'beta5' }, 'missing confirmation'],
  ])('A2 rejects an invalid payload with %s (%s)', async (payload, _description) => {
    const response = await http.post(URLS.tmsAutomation(PROJECT), payload, {
      validateStatus: () => true,
    });

    expect(response.status).toBe(400);
    expect(response.data).toMatchObject({
      errorCode: 40002,
      message: 'Invalid automation request',
    });
  });

  test('A2 names already automated case IDs in 409 then accepts the confirmed retry', async () => {
    const payload = {
      testCaseIds: [1001],
      environment: 'qa',
      confirmReautomate: false,
    };
    const conflictResponse = await http.post(URLS.tmsAutomation(PROJECT), payload, {
      validateStatus: () => true,
    });

    expect(conflictResponse.status).toBe(409);
    expect(conflictResponse.data).toEqual({
      reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED',
      testCaseIds: [1001],
    });

    const confirmed = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      ...payload,
      confirmReautomate: true,
    });
    expect(confirmed.status).toBe(202);
    expect(confirmed.data.accepted).toEqual([1001]);
    expect(findCase(1001).automation?.status).toBe(AutomationStatus.IN_PROGRESS);
  });

  test('A2 rejects an unknown case without enumerating valid IDs', async () => {
    const response = await http.post(
      URLS.tmsAutomation(PROJECT),
      { testCaseIds: [9999], environment: 'beta5', confirmReautomate: false },
      { validateStatus: () => true },
    );

    expect(response.status).toBe(400);
    expect(response.data).toEqual({
      errorCode: 40002,
      message: 'Invalid automation request',
    });
    expect(JSON.stringify(response.data)).not.toContain('1005');
  });

  test('A2 skips fix-running and automation-in-progress cases with deterministic reasons', async () => {
    findCase(1006).fixRoundRunning = { round: 1, startedAt: Date.now() };
    findCase(1007).automation = {
      status: AutomationStatus.IN_PROGRESS,
      iterationId: 201,
      scenarioChangedAfterAutomation: false,
    };

    const response = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1005, 1006, 1007],
      environment: 'dev5',
      confirmReautomate: false,
    });

    expect(response.data.accepted).toEqual([1005]);
    expect(response.data.skipped).toEqual([
      { id: 1006, displayId: 'TC106', reason: 'FIX_RUNNING' },
      { id: 1007, displayId: 'TC107', reason: 'AUTOMATION_IN_PROGRESS' },
    ]);
  });

  test('A2 rejects an all-ineligible selection without creating an iteration', async () => {
    const response = await http.post(
      URLS.tmsAutomation(PROJECT),
      { testCaseIds: [1006, 1007], environment: 'beta5', confirmReautomate: false },
      { validateStatus: () => true },
    );

    expect(response.status).toBe(400);
    expect(response.data).toEqual({
      errorCode: 40001,
      message: 'No Ready Test Cases to automate',
    });
  });

  test('A2 accepts Ready cases, skips Draft, and the iteration completes', async () => {
    const res = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1005, 1006],
      environment: 'beta5',
      confirmReautomate: false,
    });
    expect(res.status).toBe(202);
    expect(res.data.accepted).toEqual([1005]);
    expect(res.data.skipped).toEqual([{ id: 1006, displayId: 'TC106', reason: 'NOT_READY' }]);

    jest.advanceTimersByTime(SIMULATED_DELAY_MS * 4 + 100);
    const c = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(c.data.automation?.status).toBe('AUTOMATED');
  });

  test('P2, P3 and C2 expose ordered live progress and the actual iteration identity', async () => {
    const accepted = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1005],
      environment: 'qa',
      confirmReautomate: false,
    });
    const { pipelineId, iterationId, number } = accepted.data.iteration;

    const initialList = await http.get<IterationPageRS>(
      URLS.tmsPipelineIterations(PROJECT, pipelineId),
    );
    const initial = initialList.data.content.find(({ id }) => id === iterationId);
    expect(initial).toMatchObject({
      pipelineId,
      number,
      status: 'RUNNING',
    });
    expect(initial?.durationMs).toBeUndefined();
    expect(initial?.stages.map(({ key, status }) => [key, status])).toEqual([
      ['PREPARE', 'RUNNING'],
      ['DEVELOP', 'PENDING'],
      ['AUTOMATION_REVIEW', 'PENDING'],
      ['FIX', 'PENDING'],
    ]);

    const inProgressCase = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(inProgressCase.data.automation).toMatchObject({
      status: AutomationStatus.IN_PROGRESS,
      iteration: { pipelineId, iterationId, number },
    });

    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const firstTransition = await http.get<IterationRS>(
      URLS.tmsPipelineIterationById(PROJECT, pipelineId, iterationId),
    );
    expect(firstTransition.data.stages.map(({ status }) => status)).toEqual([
      'PASSED',
      'RUNNING',
      'PENDING',
      'PENDING',
    ]);
    expect(firstTransition.data.stages[0].perCase).toEqual([
      {
        testCaseId: 1005,
        displayId: 'TC105',
        name: 'TC105',
        status: 'PASSED',
        result: 'Done',
      },
    ]);

    jest.advanceTimersByTime(SIMULATED_DELAY_MS * 3 + 100);
    const completed = await http.get<IterationRS>(
      URLS.tmsPipelineIterationById(PROJECT, pipelineId, iterationId),
    );
    expect(completed.data.status).toBe('COMPLETED');
    expect(completed.data.durationMs).toBeGreaterThan(0);
    expect(completed.data.stages.map(({ status }) => status)).toEqual([
      'PASSED',
      'PASSED',
      'PASSED',
      'SKIPPED',
    ]);
    expect(completed.data.stages[3].perCase?.[0]).toMatchObject({
      displayId: 'TC105',
      name: 'TC105',
      result: 'Skipped · review was clean',
    });

    const automatedCase = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(automatedCase.data.automation).toMatchObject({
      status: AutomationStatus.AUTOMATED,
      iteration: { pipelineId, iterationId, number },
      mergeRequest: {
        id: `!${iterationId}`,
        state: MergeRequestState.OPEN,
      },
      lastResult: { status: 'PASSED' },
    });
  });

  test('rehydrates persisted running automation and resumes it after handler reload', async () => {
    const accepted = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1005],
      environment: 'qa',
      confirmReautomate: false,
    });
    const { pipelineId, iterationId } = accepted.data.iteration;
    reloadPersistedHandlers();

    const rehydratedIteration = await http.get<IterationRS>(
      URLS.tmsPipelineIterationById(PROJECT, pipelineId, iterationId),
    );
    const rehydratedCase = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(rehydratedIteration.data).toMatchObject({
      id: iterationId,
      status: IterationStatus.RUNNING,
    });
    expect(rehydratedCase.data.automation).toMatchObject({
      status: AutomationStatus.IN_PROGRESS,
      iteration: { pipelineId, iterationId },
    });

    jest.advanceTimersByTime(SIMULATED_DELAY_MS * 4 + 100);

    const resumedIteration = await http.get<IterationRS>(
      URLS.tmsPipelineIterationById(PROJECT, pipelineId, iterationId),
    );
    const resumedCase = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(resumedIteration.data.status).toBe(IterationStatus.COMPLETED);
    expect(resumedIteration.data.stages.map(({ status }) => status)).toEqual([
      'PASSED',
      'PASSED',
      'PASSED',
      'SKIPPED',
    ]);
    expect(resumedCase.data.automation).toMatchObject({
      status: AutomationStatus.AUTOMATED,
      iteration: { pipelineId, iterationId },
      lastResult: { status: 'PASSED' },
    });
  });

  test('resetting while automation is pending makes the delayed callback a no-op', async () => {
    await http.post(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1005],
      environment: 'beta5',
      confirmReautomate: false,
    });

    resetMockDb();

    expect(() => jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100)).not.toThrow();
    expect(findCase(1005).automation).toBeUndefined();
  });

  test('persisted automation resumes with canonical case IDs after aliases are lost', async () => {
    const externalCaseId = 55_005;
    const canonicalCase = findCase(1005);
    if (!canonicalCase) throw new Error('Expected seeded TC105');
    registerCaseAlias(externalCaseId, canonicalCase);
    const accepted = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), {
      testCaseIds: [1006, externalCaseId],
      environment: 'beta5',
      confirmReautomate: false,
    });
    const { pipelineId, iterationId } = accepted.data.iteration;

    expect(accepted.data.accepted).toEqual([externalCaseId]);
    expect(accepted.data.skipped).toEqual([
      { id: 1006, displayId: 'TC106', reason: 'NOT_READY' },
    ]);

    reloadPersistedHandlers();
    expect(findIteration(iterationId)).toMatchObject({
      testCaseIds: [1005],
      requestedTestCaseIds: [externalCaseId],
    });
    jest.advanceTimersByTime(SIMULATED_DELAY_MS * 4 + 100);

    const completed = await http.get<IterationRS>(
      URLS.tmsPipelineIterationById(PROJECT, pipelineId, iterationId),
    );
    expect(completed.data.testCases).toEqual([{ id: externalCaseId, displayId: 'TC105' }]);
    expect(completed.data.stages[0].perCase).toEqual([
      expect.objectContaining({
        testCaseId: externalCaseId,
        displayId: 'TC105',
        name: 'TC105',
      }),
    ]);
    expect(findCase(1005).automation).toMatchObject({
      status: AutomationStatus.AUTOMATED,
      iterationId,
    });
  });
});
